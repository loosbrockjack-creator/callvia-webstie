<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Every page must work on a phone

Mobile is a requirement here, not a polish pass. Clients sign agreements and fill
onboarding forms on their phones, and the admin dashboard gets checked on one.
**Nothing is done until it has been looked at 390px wide.**

Non-negotiables:

- **Mobile-first.** Base styles target small screens; `sm:` / `md:` / `lg:` add
  desktop. Never the reverse.
- **No horizontal scrolling at any width.** A wide table is not made mobile by
  wrapping it in `overflow-x-auto` with a `min-w-[Npx]` inside. That is a
  workaround. Reflow instead: cards below `md:`, table at `md:` and up. See
  `components/admin/ui/DataTable.tsx`.
- **Inputs must be `text-base` (16px) minimum.** Anything smaller makes iOS
  Safari zoom the whole viewport on focus. This is the single most common reason
  a form feels broken on a phone.
- **Tap targets at least 44px.** Applies to text links used as buttons, not just
  buttons. Make the whole row the hit target for checkboxes.
- **No `autoFocus` on a mobile step.** It throws the keyboard up over the
  content the person is still reading.
- Modals become bottom sheets below `sm:`; centered dialogs above.
- Use `env(safe-area-inset-bottom)` on anything fixed to the bottom.
- Use native input types (`type="date"`, `inputMode`) so phones give the right
  keyboard and picker.
- Charts: thin axis ticks on narrow screens (labels collide well before 390px),
  give them a fixed min-height so they cannot squash, and remember there is no
  hover on a phone.
- Honor the `prefers-reduced-motion` block in `app/globals.css`. If you add a
  keyframe animation, add a real class for it and switch it off there. An
  `animate-[...]` arbitrary value cannot be targeted.

Design tokens live in the `@theme` block in `app/globals.css` (`surface`, `line`,
`muted`, `dim`, `success`, `warning`, `danger`, `accent`). Use them. Do not add
another hardcoded hex.
