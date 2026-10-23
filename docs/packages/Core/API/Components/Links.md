# Links Components API Documentation

## ThLink

A base link component that extends the Link component from react-aria-components with additional tooltip support. The tooltip is rendered with [`ThTooltip`](./Tooltips.md).

### Props

`ThLinkProps` extends `LinkProps` from react-aria-components:

```typescript
interface ThLinkProps extends LinkProps {
  ref?: React.ForwardedRef<HTMLAnchorElement>; // Ref for the link element
  href: string;                               // URL the link points to
  children: React.ReactNode;                   // Content of the link
  compounds?: {
    tooltipTrigger?: WithRef<TooltipTriggerProps, HTMLDivElement>; // Props for tooltip trigger
    tooltip?: WithRef<TooltipProps, HTMLDivElement>;              // Props for tooltip
    label: string;                                                // Text content for the tooltip
  };
}
```

### Usage

```tsx
import { ThLink } from "@thorium-web/core/Components/Links";

// Basic usage
<ThLink href="/example">Example Link</ThLink>

// With tooltip
<ThLink 
  href="/example"
  compounds={{
    tooltipTrigger: {
      delay: 500,
      closeDelay: 300
    },
    tooltip: {
      className: "my-tooltip"
    },
    label: "Navigate to example page"
  }}
>
  Example Link
</ThLink>
```

## ThLinkIconProps

Common props for icon-based links (ThHome and ThLibrary):

```typescript
interface ThLinkIconProps extends Omit<ThLinkProps, "children"> {
  "aria-label": string;  // Required for accessibility
}
```

## ThHome

A specialized link component that displays a home icon. Always shows the home icon and ignores any children.

### Props

Extends `ThLinkIconProps` (which includes `aria-label` and omits `children`).

### Usage

```tsx
import { ThHome } from "@thorium-web/core/Components/Links";

<ThHome 
  href="/" 
  aria-label="Go to home"
  compounds={{
    tooltipTrigger: {
      delay: 500,
      closeDelay: 300
    },
    label: "Return to home page"
  }}
/>
```

## ThLibrary

A specialized link component that displays a library/bookshelf icon. Always shows the library icon and ignores any children.

### Props

Extends `ThLinkIconProps` (which includes `aria-label` and omits `children`).

### Usage

```tsx
import { ThLibrary } from "@thorium-web/core/Components/Links";

<ThLibrary 
  href="/library" 
  aria-label="Go to library"
  compounds={{
    tooltipTrigger: {
      delay: 500,
      closeDelay: 300
    },
    label: "Return to library"
  }}
/>
```

## ThBackArrow

A specialized link component that displays a back arrow icon. Always shows the back arrow icon and ignores any children.

### Props

Extends `ThLinkIconProps` (which includes `aria-label`, omits `children`, and adds `direction`).

### Usage

```tsx
import { ThBackArrow } from "@thorium-web/core/Components/Links";

<ThBackArrow 
  href="/example" 
  aria-label="Go to example"
  direction="left"
  compounds={{
    tooltipTrigger: {
      delay: 500,
      closeDelay: 300
    },
    label: "Navigate to example page"
  }}
/>
```

## Accessibility

All link components implement proper accessibility features including:
- Keyboard navigation
- ARIA attributes
- Focus management
- Screen reader support
