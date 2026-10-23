# Tooltips Components API Documentation

## ThTooltip

A drop-in replacement for the Tooltip component from react-aria-components. It must be rendered inside a `TooltipTrigger`, like the component it wraps.

`ThActionButton` and `ThLink` use it for their `compounds.tooltip`. You only need it directly if you build your own `TooltipTrigger`.

### Props

```typescript
type ThTooltipProps = TooltipProps & {
  ref?: React.Ref<HTMLDivElement>; // Ref for the tooltip element
}
```

All props are passed through to `Tooltip` unchanged.

### Usage

```tsx
import { Button, TooltipTrigger } from "react-aria-components";
import { ThTooltip } from "@edrlab/thorium-web/core/components";

<TooltipTrigger delay={ 500 } closeDelay={ 300 }>
  <Button aria-label="Table of contents">…</Button>
  <ThTooltip placement="bottom" className="my-tooltip">
    Table of contents
  </ThTooltip>
</TooltipTrigger>
```

### Features

- **Escape blurs the trigger.** While the tooltip is open, react-aria-components stops Escape from reaching the trigger, and only the tooltip closes. `ThTooltip` also removes focus from the trigger, if it has focus, so one Escape is enough.
- **No stuck tooltips.** When the pointer moves from one trigger to another during the warmup period, react-aria-components closes the previous tooltip instantly. After that, it can get stuck: it stays in the DOM, isn't positioned, and shows in the top-left corner of the viewport. `ThTooltip` unmounts the tooltip after an instant close to prevent this. Exit animations still run for regular closes.

## Accessibility

- Same ARIA behavior as the Tooltip component from react-aria-components (`role="tooltip"`, `aria-describedby` on the trigger)
- A single Escape closes the tooltip and removes focus from its trigger
