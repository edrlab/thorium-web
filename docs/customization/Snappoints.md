# Snap Points

The draggable bottom sheet uses an optional `snapped` object configured for each action with a container. This eases customization of the bottom sheet’s snappoints, its reference detent/height, and scrim/underlay. 

## Scrim

The optional `scrim` value can be: 

- `false` to disable the scrim/underlay’s background entirely;
- `true` to use the background set in `theming.defaults.scrim`;
- a `string` that is a valid value for CSS property `background`.

The last option allows you to override the default `scrim` if needed specifically for an action’s bottom sheet container.

## Max Width

In case you want to use the bottom sheet on larger screens, it can be useful to constrain its `max-width`. 

This optional `maxWidth` property overrides the value set in `theming.constraints` for the bottom sheet.

## Snap Points

### Properties and values

Snap points are using 3 optional properties to build the draggable bottom sheet:

- `minHeight`: the minimum height of the bottom sheet when open (smaller snap point);
- `peekHeight`: the initial height of the bottom sheen on open (defaut snap point);
- `maxHeight`: the maximum height of the bottom sheet when open (larger snap point).

Their value can be:

- `number`: the height of the screen as a percentage;
- string `full-height`: the entire height of the screen (type of `BottomSheetDetent`);
- string `content-height`: the height of the content the sheet contains (type of `BottomSheetDetent`).

### Logic

If no height-related property is set, then the bottom sheet will use a fallback of percentages `[30, 50, 100]`.

It will also use these values when their specific height property is `undefined` e.g. `30` for `minHeight`.

If the `value` for a property is `100`, `full-height`, or `content-height`, then the snap points’ array ends there. 

For instance:

- `minHeight: full-height` will make the bottom sheet an animated fullscreen sheet you can close by dragging but with no snap point.
- `peekHeight: content-height` will make the bottom sheet draggable with 2 snap points, effectively transforming the `peekHeight` into the max height, constrained by its content’s. 
- `maxHeight: 100` or `maxHeight: full-height`, with neither `minHeight` nor `peekHeight`, will make the bottom sheet open at full height, with no other snap point: dragging it down closes it.

## Examples

This would be the configuration for settings as a bottom sheet on the smaller breakpoint (and popover otherwise)

```
[ThActionKeys.settings]: {
  ...
  sheet: {
    defaultSheet: ThSheetTypes.popover,
    breakpoints: {
      [ThBreakpoints.compact]: ThSheetTypes.bottomSheet
    }
  },
  ...
  snapped: {
    scrim: true,
    peekHeight: 50,
    minHeight: 30,
    maxHeight: 100
  }
}
```

In this case, we apply the default scrim, and percentages for each snap point. The bottom sheet will open at 50% of the height of the screen, its min-height is 30% and is max-height is fullscreen.

If you’d like a bottom sheet with no snap point for the Jump to Position Action container with no scrim, then:

```
[ThActionKeys.jumpToPosition]: {
  ...
  sheet: {
    defaultSheet: ThSheetTypes.popover,
    breakpoints: {
      [ThBreakpoints.compact]: ThSheetTypes.bottomSheet
    }
  },
  ...
  snapped: {
    scrim: false,
    minHeight: "content-height",
  }
}
```