# Styling

The package exports a set of CSS that can be imported in your app or serve as a reference for your own styles.

## Usage

### PublicationGrid and StatefulLoader

The `PublicationGrid` and `StatefulLoader` are not part of `StatefulReader` in practice, so their styles are exported in the `misc` package.

```tsx
import "@edrlab/thorium-web/misc/styles";
```

### Epub StatefulReader

When using the `StatefulReader` component for EPUB, the styles are exported in the `epub` package.

> [!NOTE]
> This stylesheet contains styles for `html` and `body`, as well as a necessary reset for buttons and inputs. Please bear in mind that it may override styles for these elements if the stylesheet is imported last in your page.

```tsx
import "@edrlab/thorium-web/epub/styles";
```

### Audio StatefulPlayer

When using the `StatefulPlayer` component for audio, the styles are exported in the `audio` package.

```tsx
import "@edrlab/thorium-web/audio/styles";
```

### WebPub StatefulReader

When using the `StatefulReader` component for WebPub, the styles are exported in the `webpub` package.

> [!NOTE]
> This stylesheet contains styles for `html` and `body`, as well as a necessary reset for buttons and inputs. Please bear in mind that it may override styles for these elements if the stylesheet is imported last in your page.

```tsx
import "@edrlab/thorium-web/webpub/styles";
```

## Advanced

Although easily importable, you can also copy the styles from:

- `dist/components/Audio/index.css`
- `dist/components/Misc/index.css`
- `dist/components/Epub/index.css`
- `dist/components/WebPub/index.css`

And customize them as needed.

## Customization

The entire list of class names is available in the [API docs](./API.md).

### Class names

Classes are following pattern `thorium_web_` + module name + component name e.g. `.thorium_web_button_icon`, `.thorium_web_overflow_menu`, or `.thorium_web_sheets_popover`.

`StatefulReader` (Epub/WebPub) provides the following layouts and states:

- `.thorium_web_stackedUI`/`.thorium_web_layeredUI`: the type of layout used, derived from preference `layout.ui`
- `.thorium_web_isReflow`/`.thorium_web_isFXL`: whether the EPUB reader is in reflow or fixed-layout mode
- `.thorium_web_isScroll`/`.thorium_web_isPaged`: whether the EPUB reader is in scroll or paged mode
- `.thorium_web_isImmersive`: whether immersive mode is enabled
- `.thorium_web_isHovering`: whether the top or bottom bars are being hovered
- `.thorium_web_is{Breakpoint}`: whether the reader is in a given breakpoint:
  - `.thorium_web_isCompact`
  - `.thorium_web_isMedium`
  - `.thorium_web_isExpanded`
  - `.thorium_web_isLarge`
  - `.thorium_web_isXLarge`
- `.thorium_web_container_is{Breakpoint}`: whether the publication’s container is in a given breakpoint:
  - `thorium_web_container_isCompact`
  - `thorium_web_container_isMedium`
  - `thorium_web_container_isExpanded`
  - `thorium_web_container_isLarge`
  - `thorium_web_container_isXLarge`

> [!NOTE]
> `StatefulPlayer` (Audio) uses its own layout independent of `StatefulReader`. None of the above layout classes or states (`thorium_web_stackedUI`, `thorium_web_layeredUI`, `thorium_web_isImmersive`, `thorium_web_isHovering`, etc.) apply to the audio player. See [Audio Components](./API.md#audio-components) for audio-specific layout classes.

### Component states

For components themselves, you can use the `data` attribute referenced in [React Aria documentation](https://react-spectrum.adobe.com/react-aria/components.html) e.g. `[data-pressed]`, `[data-hovered]`, `[data-focus-visible]`, `[data-disabled]`

### Custom properties

`StatefulReader` exposes the following custom properties for theming, layout, and other purposes.

#### Theming:

- `--th-theme-background`: The background color of the current theme
- `--th-theme-text`: The text color of the current theme
- `--th-theme-link`: The link color of the current theme
- `--th-theme-visited`: The visited link color of the current theme
- `--th-theme-subdue`: The subdue color of the current theme
- `--th-theme-disable`: The disable color of the current theme
- `--th-theme-hover`: The hover color of the current theme
- `--th-theme-onHover`: The on-hover color for text/icons of the current theme
- `--th-theme-select`: The select background color of the current theme
- `--th-theme-onSelect`: The on-select text color of the current theme
- `--th-theme-focus`: The focus outline color of the current theme
- `--th-theme-elevate`: The drop shadow color of the current theme
- `--th-theme-immerse`: The immersive mode opacity of the current theme

#### Layout:

- `--th-layout-spacing`: The spacing base for margins/paddings of the reader derived from preferences
- `--th-layout-radius`: The border-radius of icons, containers, etc. of the reader derived from preferences
- `--th-icon-size`: The size of icons in the reader derived from preferences
- `--th-arrow-size`: The size of navigation arrows derived from preferences
- `--th-arrow-offset`: The offset of navigation arrows derived from preferences
- `--visual-viewport-height`: The height of the visual viewport of the reader (provided by React Aria)

#### Sheets:

- `--th-sheet-sticky-header`: The height of the sticky header of sheets
- `--th-layout-constraints-popover`: The max-width of popover sheets derived from preferences
- `--th-layout-constraints-modal`: The max-width of modal sheets derived from preferences
- `--th-layout-constraints-bottomSheet`: The max-width of draggable bottom sheets derived from preferences
- `--th-layout-constraints-pagination`: The max-width for pagination components derived from preferences
- `--th-layout-defaults-scrim`: The default scrim/underlay background-color of sheets derived from preferences