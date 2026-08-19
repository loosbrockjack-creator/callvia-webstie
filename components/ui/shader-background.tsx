"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Flowing plasma-line field, adapted from the 21st.dev "Shader Background".
 *
 * Differences from the source snippet, all deliberate:
 *  - Typed, and the render loop is actually cancelled on unmount (the original
 *    leaked a requestAnimationFrame callback forever).
 *  - Palette retuned to Callvia: near-black wash, accent purple strands.
 *  - Line count and device pixel ratio drop on small screens. The strands are
 *    soft-edged, so downsampling is invisible but roughly quarters the cost.
 *  - Pauses when scrolled out of view or on a hidden tab, and renders a single
 *    static frame under prefers-reduced-motion.
 *  - The dead drawGrid/gridColor block from the source is gone; main() never
 *    called it.
 */

// GLSL mirror of --color-accent (#7c5cfc) in app/globals.css. Shaders cannot
// read CSS custom properties, so this is the one place the accent is restated
// as floats. Change both together.
const ACCENT = "vec3(0.486, 0.361, 0.988)";

// The source mixed a saturated navy to purple (0.1,0.1,0.3 -> 0.3,0.1,0.5).
// Pushed almost to black so the strands carry all of the color.
const BG_LOW = "vec4(0.016, 0.012, 0.043, 1.0)";
const BG_HIGH = "vec4(0.043, 0.020, 0.078, 1.0)";

// Strand crossings sum toward white. Held just under 1 so the bright knots stay
// purple instead of blowing out.
const LINE_BRIGHTNESS = "0.9";

// Seconds into the animation to freeze at under reduced motion. t=0 is a flat,
// uninteresting frame, this one has the strands spread out.
const STATIC_FRAME_TIME = 12;

const VERTEX_SHADER = `
attribute vec2 aVertexPosition;
void main() {
  gl_Position = vec4(aVertexPosition, 0.0, 1.0);
}
`;

const fragmentShader = (linesPerGroup: number) => `
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
// Half-extent of visible shader space, set from JS. See spanFor().
uniform vec2 uSpan;

#define LINES_PER_GROUP ${linesPerGroup}

const float overallSpeed = 0.2;
const float gridSmoothWidth = 0.015;
const float minLineWidth = 0.01;
const float maxLineWidth = 0.2;
const float lineSpeed = 1.0 * overallSpeed;
const float lineAmplitude = 1.0;
const float lineFrequency = 0.2;
const float warpSpeed = 0.2 * overallSpeed;
const float warpFrequency = 0.5;
const float warpAmplitude = 1.0;
const float offsetFrequency = 0.5;
const float offsetSpeed = 1.33 * overallSpeed;
const float minOffsetSpread = 0.6;
const float maxOffsetSpread = 2.0;

const vec4 lineColor = vec4(${ACCENT} * ${LINE_BRIGHTNESS}, 1.0);
const vec4 bgColor1 = ${BG_LOW};
const vec4 bgColor2 = ${BG_HIGH};

#define drawCircle(pos, radius, coord) smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))
#define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))
#define drawCrispLine(pos, halfWidth, t) smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))

float random(float t) {
  return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;
}

float getPlasmaY(float x, float horizontalFade, float offset) {
  return random(x * lineFrequency + iTime * lineSpeed) * horizontalFade * lineAmplitude + offset;
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 uv = fragCoord.xy / iResolution.xy;

  // Both axes are framed from JS rather than derived from width alone. The
  // source divided x and y by width, so a phone showed the same width of field
  // as a laptop crushed into a third of the pixels, which read as cramped, and
  // covered three times as much of it vertically, which left the strands in a
  // thin band. uSpan fixes the framing on each axis independently.
  vec2 space = (uv - 0.5) * 2.0 * uSpan;

  float horizontalFade = 1.0 - (cos(uv.x * 6.28) * 0.5 + 0.5);
  float verticalFade = 1.0 - (cos(uv.y * 6.28) * 0.5 + 0.5);

  space.y += random(space.x * warpFrequency + iTime * warpSpeed) * warpAmplitude * (0.5 + horizontalFade);
  space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * warpAmplitude * horizontalFade;

  vec4 lines = vec4(0.0);

  for (int l = 0; l < LINES_PER_GROUP; l++) {
    float normalizedLineIndex = float(l) / float(LINES_PER_GROUP);
    float offsetTime = iTime * offsetSpeed;
    float offsetPosition = float(l) + space.x * offsetFrequency;
    float rand = random(offsetPosition + offsetTime) * 0.5 + 0.5;
    float halfWidth = mix(minLineWidth, maxLineWidth, rand * horizontalFade) / 2.0;
    float offset = random(offsetPosition + offsetTime * (1.0 + normalizedLineIndex)) * mix(minOffsetSpread, maxOffsetSpread, horizontalFade);
    float linePosition = getPlasmaY(space.x, horizontalFade, offset);
    float line = drawSmoothLine(linePosition, halfWidth, space.y) / 2.0 + drawCrispLine(linePosition, halfWidth * 0.15, space.y);

    float circleX = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
    vec2 circlePosition = vec2(circleX, getPlasmaY(circleX, horizontalFade, offset));
    float circle = drawCircle(circlePosition, 0.01, space) * 4.0;

    line = line + circle;
    lines += line * lineColor * rand;
  }

  vec4 fragColor = mix(bgColor1, bgColor2, uv.x);
  fragColor *= verticalFade;
  fragColor.a = 1.0;
  fragColor += lines;

  gl_FragColor = fragColor;
}
`;

// The field was tuned at this width. Narrower viewports show a zoomed-in slice
// of it at the same visual scale, rather than the whole thing squeezed down.
const REFERENCE_WIDTH = 1440;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

function spanFor(w: number, h: number): [number, number] {
  // Hold roughly the reference shader-units-per-pixel horizontally. Floored so
  // a very narrow screen still shows more than a couple of strands.
  const x = clamp((5 * w) / REFERENCE_WIDTH, 2.4, 5.5);
  // Strands live within about +/- 3 units vertically, so keeping the vertical
  // half-extent near that fills the frame at any aspect ratio.
  const y = clamp(x * (h / w), 2.6, 3.4);
  return [x, y];
}

function compile(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

/**
 * `driveRef` layers a caller-owned value on top of the field's own clock, which
 * is how the backdrop pushes it forward and back with scroll position. The
 * field keeps animating on its own either way, so it is never still; scrolling
 * just moves it further, and scrolling up unwinds it. `paused` skips the
 * fragment pass while the field is scrolled out of sight.
 */
export function ShaderBackground({
  className,
  driveRef,
}: {
  className?: string;
  driveRef?: RefObject<{ offset: number; paused: boolean }>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });

    // No WebGL. The gradient fallback rendered behind this canvas stands in.
    if (!gl) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isNarrow = window.matchMedia("(max-width: 640px)").matches;

    // Halving the strand count on phones halves the per-pixel inner loop, and
    // at that width the missing strands are not perceptible.
    const linesPerGroup = isNarrow ? 8 : 16;
    // The single biggest mobile win. A phone at dpr 3 is ~3x the pixels of a
    // dpr 1 buffer in each axis, for an effect with no hard edges to preserve.
    const maxDpr = isNarrow ? 1 : 2;

    const vertexShader = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = compile(gl, gl.FRAGMENT_SHADER, fragmentShader(linesPerGroup));
    if (!vertexShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Shader link failed:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragShader);
      return;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
    const uResolution = gl.getUniformLocation(program, "iResolution");
    const uTime = gl.getUniformLocation(program, "iTime");
    const uSpan = gl.getUniformLocation(program, "uSpan");

    let lastW = 0;
    let lastH = 0;
    let span = spanFor(window.innerWidth, window.innerHeight);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (w === lastW && h === lastH) return false;

      lastW = w;
      lastH = h;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      span = spanFor(canvas.clientWidth, canvas.clientHeight);
      return true;
    };

    const draw = (time: number) => {
      gl.useProgram(program);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      gl.uniform2f(uSpan, span[0], span[1]);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(aVertexPosition);
      gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    // Elapsed animation time is accumulated rather than read off a start
    // timestamp, so pausing and resuming does not jump the strands forward.
    let elapsed = 0;
    let lastTs = 0;
    let frameId = 0;
    let running = false;
    let visible = true;
    let contextLost = false;

    const loop = (ts: number) => {
      if (lastTs === 0) lastTs = ts;
      elapsed += (ts - lastTs) / 1000;
      lastTs = ts;

      const resized = resize();
      const drive = driveRef?.current;

      // Faded out of sight below the hero. Keep accumulating time so coming
      // back up does not jump, but skip the full-screen fragment pass.
      if (drive?.paused && !resized) {
        frameId = requestAnimationFrame(loop);
        return;
      }

      draw(elapsed + (drive?.offset ?? 0));
      frameId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || reduceMotion || contextLost) return;
      running = true;
      lastTs = 0;
      frameId = requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const sync = () => {
      if (visible && !document.hidden) start();
      else stop();
    };

    resize();

    if (reduceMotion) {
      // One frame, then nothing. No loop is ever scheduled.
      draw(STATIC_FRAME_TIME);
    } else {
      start();
    }

    const onResize = () => {
      if (resize() && !running) {
        draw(reduceMotion ? STATIC_FRAME_TIME : elapsed);
      }
    };

    const onVisibility = () => sync();

    const onContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
      stop();
    };

    // Stop burning frames once the backdrop has scrolled away.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!reduceMotion) sync();
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onContextLost);

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);

      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragShader);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [driveRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      // 100lvh rather than 100% so a collapsing mobile URL bar does not
      // reallocate the drawing buffer on every scroll nudge.
      style={{ display: "block", width: "100%", height: "100lvh" }}
    />
  );
}
