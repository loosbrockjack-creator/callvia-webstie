"use client";

// The six Features micro-mocks.
//
// Each one shows a small, plausible fragment of Callvia actually doing the job
// named on the card. That is the whole reason they exist: an icon says
// "scheduling", a booked 2:30 slot says the product works. The content is
// deliberately specific (real-looking names, a real-looking address, an
// unrounded phone number) because round placeholder data is the fastest way to
// make a mock look fake.
//
// All six are decorative in the accessibility sense. The heading and body copy
// beside them carry the meaning, so the SVGs are aria-hidden rather than
// captioned, which would just read the same sentence twice to a screen reader.

import { motion, type Variants } from "framer-motion";

import { cn } from "@/lib/utils";
import {
  containerVariants,
  drawVariants,
  EASE_CARD,
  FILL,
  popVariants,
  riseVariants,
  slideVariants,
  STROKE,
  TEXT,
  useGraphicMotion,
} from "@/components/graphics/shared";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

/** Grow from the left edge. Needs both properties inline: `transform-box`
 *  alone still leaves the origin at the centre of the box. */
const growVariants: Variants = {
  hidden: { scaleX: 0 },
  shown: { scaleX: 1, transition: { duration: 0.75, ease: EASE_CARD } },
};

const growFromLeft = {
  transformBox: "fill-box" as const,
  transformOrigin: "left center",
};

function GraphicFrame({
  children,
  viewBox,
  className,
}: {
  children: React.ReactNode;
  viewBox: string;
  className?: string;
}) {
  const motionProps = useGraphicMotion();

  // Sized by height, not width. Capping the width instead left the graphic
  // floating in the middle of a much wider well with dead space either side,
  // and every graphic here is wider than it is tall, so height is the binding
  // constraint anyway. `h-full w-auto` lets the viewBox aspect pick the width,
  // and max-w-full stops the narrowest cards from overflowing.
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-5">
      <motion.svg
        viewBox={viewBox}
        fill="none"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
        className={cn("h-full w-auto max-w-full", className)}
        variants={containerVariants}
        {...motionProps}
      >
        {children}
      </motion.svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Appointment booking: a three-day strip with one slot confirmed. */
export function BookingGraphic() {
  const days = ["TUE", "WED", "THU"];
  const columns = [8, 100, 192];
  const rows = [20, 42, 64, 86];
  const bookedColumn = 1;
  const bookedRow = 1;

  return (
    <GraphicFrame viewBox="0 0 280 112">
      {days.map((day, i) => (
        <motion.text
          key={day}
          variants={riseVariants}
          x={columns[i] + 40}
          y={9}
          textAnchor="middle"
          fontSize={8}
          fontFamily={MONO}
          letterSpacing={1.4}
          fill={TEXT.label}
        >
          {day}
        </motion.text>
      ))}

      {columns.map((x, ci) =>
        rows.map((y, ri) => {
          if (ci === bookedColumn && ri === bookedRow) return null;
          return (
            <motion.rect
              key={`${ci}-${ri}`}
              variants={riseVariants}
              x={x}
              y={y}
              width={80}
              height={18}
              rx={5}
              fill={FILL.panel}
              stroke={STROKE.hairline}
              strokeWidth={0.75}
            />
          );
        })
      )}

      {/* The one resolved thing in the frame. */}
      <motion.g variants={popVariants} className="svg-fill-box">
        <rect
          x={columns[bookedColumn]}
          y={rows[bookedRow]}
          width={80}
          height={18}
          rx={5}
          fill={FILL.active}
        />
        <text
          x={columns[bookedColumn] + 40}
          y={rows[bookedRow] + 12.5}
          textAnchor="middle"
          fontSize={9}
          fontFamily={MONO}
          fill={FILL.onActive}
        >
          2:30 PM
        </text>
      </motion.g>
    </GraphicFrame>
  );
}

/* -------------------------------------------------------------------------- */

/** Lead capture: caller details confirmed one field at a time. */
export function LeadCaptureGraphic() {
  const fields = [
    { label: "CALLER", value: "Dana R." },
    { label: "PHONE", value: "(612) 555-0148" },
    { label: "ADDRESS", value: "418 Cedar Ave" },
    { label: "JOB", value: "Water heater leaking" },
  ];

  return (
    <GraphicFrame viewBox="0 0 280 112">
      {fields.map((field, i) => {
        const y = 4 + i * 28;
        return (
          <motion.g key={field.label} variants={riseVariants}>
            <rect
              x={8}
              y={y}
              width={264}
              height={22}
              rx={6}
              fill={FILL.panel}
              stroke={STROKE.hairline}
              strokeWidth={0.75}
            />
            <text
              x={20}
              y={y + 14.5}
              fontSize={7.5}
              fontFamily={MONO}
              letterSpacing={0.9}
              fill={TEXT.label}
            >
              {field.label}
            </text>
            <text x={78} y={y + 14.8} fontSize={9.5} fill={TEXT.value}>
              {field.value}
            </text>
            <motion.path
              variants={drawVariants}
              d={`M247 ${y + 11} l2.6 2.8 l5.4 -6.2`}
              stroke={STROKE.active}
              strokeWidth={1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>
        );
      })}
    </GraphicFrame>
  );
}

/* -------------------------------------------------------------------------- */

/** Urgency detection: a triage bar settling on the right severity. */
export function UrgencyGraphic() {
  const segments = [
    { x: 8, label: "ROUTINE" },
    { x: 99, label: "SOON" },
    { x: 190, label: "URGENT" },
  ];
  const activeIndex = 2;
  const knobX = segments[activeIndex].x + 41;

  return (
    <GraphicFrame viewBox="0 0 280 112">
      <motion.text
        variants={riseVariants}
        x={140}
        y={26}
        textAnchor="middle"
        fontSize={10}
        fill={TEXT.value}
      >
        &ldquo;water&rsquo;s coming through the ceiling&rdquo;
      </motion.text>

      {segments.map((segment, i) => (
        <motion.rect
          key={segment.label}
          variants={riseVariants}
          x={segment.x}
          y={58}
          width={82}
          height={6}
          rx={3}
          fill={i === activeIndex ? FILL.active : STROKE.hairline}
        />
      ))}

      {segments.map((segment, i) => (
        <motion.text
          key={`${segment.label}-label`}
          variants={riseVariants}
          x={segment.x + 41}
          y={82}
          textAnchor="middle"
          fontSize={7.5}
          fontFamily={MONO}
          letterSpacing={1.1}
          fill={i === activeIndex ? TEXT.bright : TEXT.label}
        >
          {segment.label}
        </motion.text>
      ))}

      {/* Travels the full bar so you read it as a decision being made, not a
          state that was always set. */}
      <motion.g variants={slideVariants(-(knobX - (segments[0].x + 41)))}>
        <circle
          cx={knobX}
          cy={61}
          r={6}
          fill={FILL.recess}
          stroke={STROKE.active}
          strokeWidth={1.4}
        />
      </motion.g>
    </GraphicFrame>
  );
}

/* -------------------------------------------------------------------------- */

/** Urgent call routing: the call reaching you, or a text if it cannot. */
export function RoutingGraphic() {
  return (
    <GraphicFrame viewBox="0 0 280 120">
      <motion.path
        variants={drawVariants}
        d="M66 60 H98"
        stroke={STROKE.soft}
        strokeWidth={1}
      />
      <motion.path
        variants={drawVariants}
        d="M172 60 H186 Q196 60 196 50 V42 Q196 32 206 32"
        stroke={STROKE.soft}
        strokeWidth={1}
      />
      <motion.path
        variants={drawVariants}
        d="M172 60 H186 Q196 60 196 70 V78 Q196 88 206 88"
        stroke={STROKE.soft}
        strokeWidth={1}
        strokeDasharray="3 3"
      />

      <motion.g variants={riseVariants}>
        <rect
          x={4}
          y={48}
          width={62}
          height={24}
          rx={7}
          fill={FILL.panel}
          stroke={STROKE.hairline}
          strokeWidth={0.75}
        />
        <text
          x={35}
          y={63.5}
          textAnchor="middle"
          fontSize={9}
          fill={TEXT.value}
        >
          Caller
        </text>
      </motion.g>

      {/* The product is the bright node. Everything else is context. */}
      <motion.g variants={popVariants} className="svg-fill-box">
        <rect x={98} y={48} width={74} height={24} rx={7} fill={FILL.active} />
        <text
          x={135}
          y={63.5}
          textAnchor="middle"
          fontSize={9}
          fontWeight={600}
          fill={FILL.onActive}
        >
          Callvia
        </text>
      </motion.g>

      <motion.g variants={riseVariants}>
        <rect
          x={206}
          y={20}
          width={70}
          height={24}
          rx={7}
          fill={FILL.panelRaised}
          stroke={STROKE.soft}
          strokeWidth={0.75}
        />
        <text
          x={241}
          y={35.5}
          textAnchor="middle"
          fontSize={9}
          fill={TEXT.bright}
        >
          Your cell
        </text>
      </motion.g>

      <motion.g variants={riseVariants}>
        <rect
          x={206}
          y={76}
          width={70}
          height={24}
          rx={7}
          fill={FILL.panel}
          stroke={STROKE.hairline}
          strokeWidth={0.75}
        />
        <text
          x={241}
          y={91.5}
          textAnchor="middle"
          fontSize={9}
          fill={TEXT.value}
        >
          Text alert
        </text>
      </motion.g>
    </GraphicFrame>
  );
}

/* -------------------------------------------------------------------------- */

/** Call summaries: the message that lands the moment the call ends. */
export function SummaryGraphic() {
  return (
    <GraphicFrame viewBox="0 0 280 116">
      <motion.rect
        variants={riseVariants}
        x={8}
        y={4}
        width={264}
        height={108}
        rx={12}
        fill={FILL.panel}
        stroke={STROKE.hairline}
        strokeWidth={0.75}
      />

      <motion.g variants={riseVariants}>
        <circle cx={24} cy={24} r={3.5} fill={FILL.active} />
        <text x={36} y={27.5} fontSize={9.5} fontWeight={600} fill={TEXT.bright}>
          Callvia
        </text>
        <text
          x={256}
          y={27.5}
          textAnchor="end"
          fontSize={8}
          fontFamily={MONO}
          fill={TEXT.label}
        >
          2:41 PM
        </text>
      </motion.g>

      <motion.path
        variants={drawVariants}
        d="M20 40 H260"
        stroke={STROKE.faint}
        strokeWidth={1}
      />

      <motion.text variants={riseVariants} x={20} y={62} fontSize={10} fill={TEXT.bright}>
        Dana R. &middot; water heater leaking
      </motion.text>
      <motion.text variants={riseVariants} x={20} y={80} fontSize={9.5} fill={TEXT.value}>
        418 Cedar Ave, Ankeny
      </motion.text>
      <motion.text
        variants={riseVariants}
        x={20}
        y={99}
        fontSize={9.5}
        fontFamily={MONO}
        fill={TEXT.value}
      >
        (612) 555-0148
      </motion.text>
    </GraphicFrame>
  );
}

/* -------------------------------------------------------------------------- */

/** Custom call handling: the controls behind how it answers. */
export function HandlingGraphic() {
  const controls = [
    { label: "GREETING", fill: 0.72 },
    { label: "HOURS", fill: 0.45 },
    { label: "TRANSFERS", fill: 0.88 },
  ];
  const trackX = 100;
  const trackWidth = 162;

  return (
    <GraphicFrame viewBox="0 0 280 112">
      {controls.map((control, i) => {
        const y = 16 + i * 28;
        const knobX = trackX + trackWidth * control.fill;
        return (
          <motion.g key={control.label} variants={riseVariants}>
            <text
              x={8}
              y={y + 3}
              fontSize={7.5}
              fontFamily={MONO}
              letterSpacing={1}
              fill={TEXT.label}
            >
              {control.label}
            </text>
            <rect
              x={trackX}
              y={y - 2}
              width={trackWidth}
              height={4}
              rx={2}
              fill={STROKE.hairline}
            />
            <motion.rect
              variants={growVariants}
              style={growFromLeft}
              x={trackX}
              y={y - 2}
              width={trackWidth * control.fill}
              height={4}
              rx={2}
              fill={STROKE.strong}
            />
            <motion.g variants={slideVariants(-(knobX - trackX))}>
              <circle
                cx={knobX}
                cy={y}
                r={5}
                fill={FILL.recess}
                stroke={STROKE.active}
                strokeWidth={1.3}
              />
            </motion.g>
          </motion.g>
        );
      })}

      <motion.g variants={riseVariants}>
        <text
          x={8}
          y={103}
          fontSize={7.5}
          fontFamily={MONO}
          letterSpacing={1}
          fill={TEXT.label}
        >
          AFTER HOURS
        </text>
        <rect x={trackX} y={92} width={34} height={16} rx={8} fill={FILL.active} />
        <circle cx={trackX + 26} cy={100} r={5.5} fill={FILL.onActive} />
      </motion.g>
    </GraphicFrame>
  );
}
