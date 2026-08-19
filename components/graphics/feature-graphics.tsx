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

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import {
  containerVariants,
  drawVariants,
  FILL,
  popVariants,
  riseVariants,
  slideVariants,
  STROKE,
  TEXT,
  useGraphicMotion,
} from "@/components/graphics/shared";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

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
    <GraphicFrame viewBox="0 -13 280 130">
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
    <GraphicFrame viewBox="0 -12 280 130">
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
    <GraphicFrame viewBox="0 -15 280 130">
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
    <GraphicFrame viewBox="0 -5 280 130">
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

/**
 * Call summaries: the message that lands the moment the call ends.
 *
 * The field set mirrors the real text Callvia sends, in the real order:
 * Name, Number, Address, Job Type, Urgency, then the summary paragraph. The
 * product's own output is the most credible thing this card could show, so it
 * is worth matching rather than inventing a prettier shape.
 *
 * What is not literal is the styling. The real SMS is a flat wall of plain
 * text because that is all SMS can be; rendered that way here it would read as
 * a screenshot dropped into the page. Setting the labels in dim mono against
 * aligned values is the same label/value treatment the rest of the site uses,
 * so it belongs here while still being recognisably the same message.
 *
 * The caller matches the Lead capture card deliberately: same name, number,
 * address and job. The two cards are one call, captured and then sent on.
 */
export function SummaryGraphic() {
  const fields = [
    { label: "NAME", value: "Dana R." },
    { label: "NUMBER", value: "(612) 555-0148" },
    { label: "ADDRESS", value: "418 Cedar Ave, Ankeny" },
    { label: "JOB TYPE", value: "Water heater leaking" },
  ];

  return (
    <GraphicFrame viewBox="0 0 280 130">
      <motion.rect
        variants={riseVariants}
        x={8}
        y={0}
        width={264}
        height={130}
        rx={12}
        fill={FILL.panel}
        stroke={STROKE.hairline}
        strokeWidth={0.75}
      />

      <motion.g variants={riseVariants}>
        {/* Dimmed from `active`: the urgency chip below is this card's one
            bright element, and two of them would cancel each other out. */}
        <circle cx={24} cy={17} r={3.5} fill={STROKE.strong} />
        <text x={36} y={20.5} fontSize={9.5} fontWeight={600} fill={TEXT.bright}>
          Callvia
        </text>
        <text
          x={256}
          y={20.5}
          textAnchor="end"
          fontSize={8}
          fontFamily={MONO}
          fill={TEXT.label}
        >
          11:13 AM
        </text>
      </motion.g>

      <motion.path
        variants={drawVariants}
        d="M20 29 H260"
        stroke={STROKE.faint}
        strokeWidth={1}
      />

      {fields.map((field, i) => {
        const y = 44 + i * 15;
        return (
          <motion.g key={field.label} variants={riseVariants}>
            <text
              x={20}
              y={y}
              fontSize={7}
              fontFamily={MONO}
              letterSpacing={0.8}
              fill={TEXT.label}
            >
              {field.label}
            </text>
            <text x={80} y={y} fontSize={9} fill={TEXT.value}>
              {field.value}
            </text>
          </motion.g>
        );
      })}

      {/* Urgency is the whole reason the text arrives before you are off the
          ladder, so it is the one thing set as a chip rather than a value. */}
      <motion.g variants={riseVariants}>
        <text
          x={20}
          y={104}
          fontSize={7}
          fontFamily={MONO}
          letterSpacing={0.8}
          fill={TEXT.label}
        >
          URGENCY
        </text>
        <rect x={78} y={95} width={58} height={13} rx={6.5} fill={FILL.active} />
        <text
          x={107}
          y={104}
          textAnchor="middle"
          fontSize={7.5}
          fontWeight={600}
          fontFamily={MONO}
          letterSpacing={0.5}
          fill={FILL.onActive}
        >
          IMMEDIATE
        </text>
      </motion.g>

      <motion.path
        variants={drawVariants}
        d="M20 114 H260"
        stroke={STROKE.faint}
        strokeWidth={1}
      />

      <motion.text variants={riseVariants} x={20} y={125} fontSize={8} fill={TEXT.label}>
        Call summary: water heater leaking into the utility room.
      </motion.text>
    </GraphicFrame>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Custom call handling: the questions from the Build My Receptionist flow.
 *
 * This card used to show three sliders labelled GREETING, HOURS and
 * TRANSFERS, which was nonsense. A greeting is not a quantity and neither are
 * business hours, so there was nothing for a slider to express. What the
 * product actually does is ask a short list of questions and build the
 * receptionist from the answers, so the card now shows exactly that.
 *
 * The questions and their options are lifted from QUESTIONS in
 * components/BuildFunnel.tsx (`answerWhen`, `urgent`, `booking`), shortened to
 * fit. If the wording changes there, change it here too: the point of this
 * card is that it shows the real flow.
 */
export function HandlingGraphic() {
  // Rough advance width for the label font at these sizes. Laying the chips
  // out in script keeps the row packed correctly when the copy changes,
  // instead of leaving hand-tuned x values to drift out of date.
  const chipWidth = (text: string) => Math.round(text.length * 4.35 + 18);

  const groups = [
    {
      question: "When should it answer?",
      options: ["24/7", "After hours", "Missed calls"],
      selected: "After hours",
    },
    {
      question: "When something is urgent?",
      options: ["Call me now", "Text an alert", "Flag it"],
      selected: "Call me now",
    },
    {
      question: "Book appointments?",
      options: ["Yes", "No"],
      selected: "Yes",
    },
  ];

  return (
    <GraphicFrame viewBox="0 0 280 130">
      {groups.map((group, gi) => {
        const labelY = 12 + gi * 42;
        const chipY = labelY + 6;
        let x = 20;

        return (
          <g key={group.question}>
            <motion.text
              variants={riseVariants}
              x={20}
              y={labelY}
              fontSize={8.5}
              fill={TEXT.value}
            >
              {group.question}
            </motion.text>

            {group.options.map((option) => {
              const w = chipWidth(option);
              const isSelected = option === group.selected;
              const chipX = x;
              x += w + 6;

              return (
                <motion.g key={option} variants={riseVariants}>
                  <rect
                    x={chipX}
                    y={chipY}
                    width={w}
                    height={15}
                    rx={7.5}
                    fill={isSelected ? FILL.active : FILL.panel}
                    stroke={isSelected ? "none" : STROKE.hairline}
                    strokeWidth={0.75}
                  />
                  <text
                    x={chipX + w / 2}
                    y={chipY + 10.3}
                    textAnchor="middle"
                    fontSize={7.5}
                    fontWeight={isSelected ? 600 : 400}
                    fill={isSelected ? FILL.onActive : TEXT.value}
                  >
                    {option}
                  </text>
                </motion.g>
              );
            })}
          </g>
        );
      })}
    </GraphicFrame>
  );
}
