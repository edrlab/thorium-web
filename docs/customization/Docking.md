# Docking

The docking system can be configured entirely, and actions’ container be even set docked as default, or given specific docking options to display to users.

Note this docking system supports Left-to-right and Right-to-left languages, which should explain the use of logical properties for its panels and their configuration.

## Docking

The overarching property `docking` is used to configure the `dock` configuration, the `displayOrder` of docking actions (`transient`, `start`, and `end`), as well as their collapsibility and visibility.

### Dock

You can configure the dock panels using `dock`. The value can be:

- `false`: disables docking entirely;
- `true`: enables docking and exposes two panels;
- an object whose properties are in enum `ThBreakpoints` and value is in enum `ThDockingTypes` (`none`, `start`, `end`, `both`).

Note this object don’t require all `ThBreakpoints` to be configured, only the ones requiring a specific setting.

This means you can disable docking on smaller screens for instance, or only expose a single panel on larger screens:

```
dock: {
  [ThBreakpoints.compact]: ThDockingTypes.none,
  [ThBreakpoints.medium]: ThDockingTypes.none,
  [ThBreakpoints.expanded]: ThDockingTypes.none,
  [ThBreakpoints.large]: ThDockingTypes.start,
  [ThBreakpoints.xLarge]: ThDockingTypes.start
}
```

### Display Order

Property `displayOrder` accepts an array of `ThDockingKeys` (`transient`, `start`, `end`).

```
displayOrder: [
  ThDockingKeys.transient,
  ThDockingKeys.start,
  ThDockingKeys.end
]
```

### Collapsibility and visibility

See [dedicated doc](./Collapsibility.md).

## Docking Preferences/Options

Each action with a sheet/container can have an optional `docked` configuration with the following properties:

- `dockable`: the docking options (in `ThDockingTypes` enum) to display to the user for this specific action (required);
- `reserved`: reserves the action’s dock slot(s) so it can’t be popped out by the user and can’t be evicted from its slot by other actions (default is `false`, see [Reserved actions](#reserved-actions));
- `dragIndicator`: enable/disable the drag indicator if the actions’ container is resizable (default is `false`);
- `width`: the initial/default width of the container when docked;
- `minWidth`: the minimum width of the container when docked;
- `maxWidth`: the maximum width of the container when docked.

`width`, `minWidth`, and `maxWidth` accept a `ThDockingSizeValue`:

- a plain `number`, interpreted as `px` (e.g. `360`);
- a unitless string, interpreted as a percentage of the docking group’s width (e.g. `"30"`);
- a string with an explicit CSS unit: `px`, `%`, `em`, `rem`, `vh`, or `vw` (e.g. `"30%"`, `"20rem"`, `"40vw"`).

For instance, if you want the Table of Contents to be dockable in both panels, with a drag handle, and make it resizable, you would configure:

```
[ThActionKeys.toc]: {
  ...
  docked: {
    dockable: ThDockingTypes.both,
    dragIndicator: true,
    width: 360,
    minWidth: 320,
    maxWidth: 450
  }
}
```

Resizability is inferred from `width`, `minWidth`, and `maxWidth` and their values have to meet the requirement of an ascending range of values. This ascending-range check only applies when all three are plain numbers (`px`); if you mix in a unit string, they are used as configured without this validation.

If no width-related property is set at all, then the `default` set in `theming` will be used.

Note the panels can be dragged shut, which closes the action they contain, and dragged back out to reopen it. Either way they will try to keep the width the user has previously set.

## Docked Sheets

You can set the action’s container as docked using `ThSheetTypes.dockedStart` and `ThSheetTypes.dockedEnd` in the action’s `sheet` object, either as the `defaultSheet` itself or per-breakpoint in `breakpoints`.

For instance, if you want to have the Table of Contents docked by default on larger screens but as a popover otherwise:

```
[ThActionKeys.toc]: {
  ...
  sheet: {
    defaultSheet: ThSheetTypes.popover,
    breakpoints: {
      [ThBreakpoints.large]: ThSheetTypes.dockedStart,
      [ThBreakpoints.xLarge]: ThSheetTypes.dockedStart
    }
}
```

Or, if you want it docked by default at every breakpoint where a dock slot is available:

```
[ThActionKeys.toc]: {
  ...
  sheet: {
    defaultSheet: ThSheetTypes.dockedStart,
    fallbackSheet: ThSheetTypes.modal
  }
}
```

This preference must also meet the following requirements:

- be compatible with `docking.dock` for its breakpoint;
- be compatible with `docked.dockable` in its own configuration.

This should dock and open the container on load if applicable.

Note the user’s customization will override this preference.

### `fallbackSheet`

When `defaultSheet` (or a breakpoint’s resolved sheet) is `dockedStart`/`dockedEnd` but no dock slot is actually available — no breakpoint match in `docking.dock`, `docked.dockable` doesn’t allow the slot, or the slot is currently held by a [reserved](#reserved-actions) action — the container falls back to `fallbackSheet` instead. This only happens when the user opens the action; it’s never used to auto-pop a sheet open on its own.

`fallbackSheet` accepts any `ThSheetTypes` value except `dockedStart`/`dockedEnd` (and `compactPopover`, or `popover` for audio actions). It defaults to `ThSheetTypes.modal` if not set.

## Reserved actions

Setting `docked.reserved` to `true` reserves the action’s dock slot(s) so that:

- the user can’t pop it out to a popover/fullscreen/modal — no undock control is shown in its docker;
- it can still be moved by the user between its own allowed slots (start/end) if `dockable` is `ThDockingTypes.both`;
- no other, non-reserved action can evict it from a slot it currently occupies. That other action’s own docker button for that slot is disabled while the reserved action holds it, and becomes usable again once the reserved action releases it (closes, or moves to its other slot).
- it still falls back to `fallbackSheet` (never silently to a popover) when the user opens it and no dock slot is available at all.

```
[ThActionKeys.toc]: {
  ...
  docked: {
    dockable: ThDockingTypes.both,
    reserved: true,
    width: 360,
    minWidth: 320,
    maxWidth: 450
  },
  sheet: {
    defaultSheet: ThSheetTypes.dockedStart,
    fallbackSheet: ThSheetTypes.modal
  }
}
```

Configuring two reserved actions with overlapping `dockable` slots (e.g. both `both`, or both `start`) is a misconfiguration with undefined resolution — the last one to dock wins. Give reserved actions non-overlapping `dockable` values (e.g. one `start`, the other `end`) instead.