# Divina Settings API Documentation

Divina-specific settings components. They are registered by `createDefaultPlugin` and displayed through `settings.divinaOrder`.

Divina also relies on these shared components, which handle the `"divina"` profile:

- `StatefulTheme`: uses the Fixed-Layout theme order (`theming.themes.fxlOrder`) and slot;
- `StatefulLayout`: toggles between paginated and scrolled. It is disabled for natively scrolled publications (webtoons).

See the [Settings API](../../Epub/API/Settings.md) for these and the base components.

## Components

### StatefulDivinaQuality

```typescript
interface StatefulDivinaQualityProps {}
```

**Features:**
- Radio group for image quality: `auto`, `low`, `high`, `max` (`DivinaQuality` from `@readium/navigator`)
- Only offers the values listed in `settings.keys[ThSettingsKeys.divinaQuality].choices`
- Syncs the navigator’s effective value to `divinaSettings.quality`

**Example:**
```typescript
<StatefulDivinaQuality />
```

### StatefulDivinaSpreads

```typescript
interface StatefulDivinaSpreadsProps {}
```

**Features:**
- Switch displaying two pages side by side
- Disabled in scrolled mode, since spreads only apply to paged mode
- Syncs the navigator’s effective value to `divinaSettings.spreads`

**Example:**
```typescript
<StatefulDivinaSpreads />
```

### StatefulDivinaStripWidth

```typescript
interface StatefulDivinaStripWidthProps {}
```

**Features:**
- Number field for the width of the strip, using the navigator’s `stripWidthRangeConfig` for range and step
- Disabled in paged mode, since strip width only applies to scrolled mode
- Syncs the navigator’s effective value to `divinaSettings.stripWidth`

**Example:**
```typescript
<StatefulDivinaStripWidth />
```

## State

Divina settings are stored in the `divinaSettings` slice, and persisted. See the [DivinaSettings Reducer](../../Core/API/Store.md#divinasettings-reducer).

Values are `null` until the user changes them, in which case the navigator’s defaults apply. A setting is only submitted to the navigator on load if its component is part of `settings.divinaOrder`.
