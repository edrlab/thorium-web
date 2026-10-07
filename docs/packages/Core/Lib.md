# Core Lib

The Core package ships with a Redux provider, reducers, and hooks.

## Provider

The provider is used to wrap your application and provide the Redux store to all components:

```tsx
import { ThStoreProvider } from "@edrlab/thorium-web/core/lib";

const App = () => {
  return (
    <ThStoreProvider>
      {/* Your application */}
    </ThStoreProvider>
  );
};
```

> [!IMPORTANT]
> When using stateful components from `@edrlab/thorium-web/epub`, you must use the `<ThStoreProvider>` from that package, not from `@edrlab/thorium-web/core/lib`. Otherwise, your app and components will use a different store.

It accepts two optional props:

- `storageKey`: the key to use to store the states in local storage. Defaults to `thorium-web-state`.
- `store`: your own Redux store if you need to modify or extend the default one.

## Reducers

The Core package comes with a list of slices offering multiple reducers:

- `actionsReducer`: manages the actions of the application (opening a menu, opening a modal, etc.);
- `audioSettingsReducer`: manages audio playback settings (volume, playback rate, skip intervals, etc.);
- `divinaSettingsReducer`: manages Divina-specific settings (quality, scrolled, spreads, strip width);
- `playerReducer`: manages audio player state (playback status, seeking, stalled, seekable ranges);
- `preferencesReducer`: manages persisted preferences state via Redux;
- `publicationReducer`: manages data related to the publication (direction, title, etc.);
- `readAlongPlayerReducer`: manages the read-along player (active, layout, status, sleep timer, etc.);
- `readAlongSettingsReducer`: manages read-along preferences (voice, rate, highlight, etc.);
- `readerReducer`: manages state of the reader (loading, immersive mode, etc.);
- `settingsReducer`: manages settings of the application (typography, spacing, etc.);
- `themeReducer`: manages the theme and accessibility of the application;
- `webPubSettingsReducer`: manages WebPub-specific settings.

These are used to build the default store if none is provided through the `store` prop.

### Extending with Custom Reducers

You can extend the default store with your own Redux Toolkit slices. Here"s how to create a custom slice that follows the same pattern as the built-in reducers.

> [!IMPORTANT]
> When using stateful components from `@edrlab/thorium-web/epub`, you must import from that same package, not from `@edrlab/thorium-web/core/lib`. Otherwise, your app and components will use a different store.

First create your reducer, e.g. a redux slice:

```typescript
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const counterSlice = createSlice({
  name: "counter",
  initialState: {
    value: 0,
  },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

// Export actions
export const { increment, decrement, incrementByAmount } = counterSlice.actions;

export default counterSlice.reducer;
```

Then, create a store with your custom reducer:

```typescript
// Store configuration
import { configureStore } from "@reduxjs/toolkit";
import { makeStore } from "@edrlab/thorium-web/core/lib";
import counterReducer from "./features/counter/counterSlice";

// Create store with your custom reducer
const store = makeStore("my-app-storage-key", {
  counter: {
    reducer: counterReducer,
    persist: true 
  }
});
```

Then pass it to the store prop of the `<ThStoreProvider>`:

```typescript
import { ThStoreProvider } from "@edrlab/thorium-web/core/lib";

const App = () => {
  return (
    <ThStoreProvider store={ store }>
      {/* Your application */}
    </ThStoreProvider>
  );
};
```

Finally use in your components:

```typescript
import { useAppDispatch, useAppSelector } from "@edrlab/thorium-web/core/lib";
import { increment } from "./features/counter/counterSlice";

export function Counter() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <div>
      <span>{ count }</span>
      <button onClick={ () => dispatch(increment()) }>Increment</button>
    </div>
  );
}
```

### Reducer Configuration

When adding a reducer to the store, you can configure it with these options:

- `reducer`: (Required) The reducer function
- `persist`: (Optional) Whether to persist this reducer’s state in localStorage (default: `false`)

## Hooks

Hooks are provided to access the Redux store. They are especially important in the context of NextJS.

The following hooks are available:

- `useAppDispatch`: returns the dispatch function from the Redux store.
- `useAppSelector`: returns the selected state from the Redux store.
- `useAppStore`: returns the Redux store.

Your components will mainly use the two first hooks like this:

```tsx
import { 
  useAppDispatch, 
  useAppSelector, 
  myReducerAction
} from "@edrlab/thorium-web/core/lib";

const MyStatefulComponent = () => {
  const dispatch = useAppDispatch();
  const someValue = useAppSelector(state => state.myReducer.someValue);
  
  return (
    <div>
      <p>Value from Redux: { someValue }</p>
      <button onClick={() => dispatch(myReducerAction())}>Dispatch Action</button>
    </div>
  );
};
```

`useAppStore` is used to access the store directly, which can be useful for non-TSX components:

```tsx
import { useAppStore } from "@edrlab/thorium-web/core/lib";

const MyHelper = () => {
  const store = useAppStore();
  const someValue = store.getState().myReducer.someValue;

  // Do something with someValue
}

> [!IMPORTANT]
> When using stateful components from `@edrlab/thorium-web/epub`, you must use the hooks from that package, not from `@edrlab/thorium-web/core/lib`. Otherwise, your app and components will use a different store.