"use client";

import { CSSProperties, ReactNode, use, useEffect, useState } from "react";
import { ObjectEntries, ObjectKeys, getId, isKeyOf } from "@/utils";

type Listener<T> = (value: T) => void;

type Store<T> = {
  subscribe: (listener: Listener<T>) => () => void;
  get: () => T;
  set: (updater: (oldState: T) => T) => void;
};

export function createStore<T>(initialState: T): Store<T> {
  let state = initialState;
  const listeners: Listener<T>[] = [];

  function subscribe(listener: Listener<T>) {
    listeners.push(listener);
    let isSubscribed = true;

    return () => {
      if (isSubscribed) {
        const index = listeners.indexOf(listener);
        listeners.splice(index, 1);
        isSubscribed = false;
      }
    };
  }

  function get() {
    return state;
  }

  function set(updater: (oldState: T) => T) {
    state = updater(state);
    listeners.forEach((listener) => listener(state));
  }

  return { subscribe, get, set };
}

let overlaysStore: ReturnType<typeof createOverlayStore> | undefined;

type OverlayStoreState<T extends object> = {
  storeIds: (keyof T)[];
  stores: { [K in keyof T]: Store<T[K]> };
};

function createOverlayStore<T extends { [K in keyof T]: T[K] }>(overlays: T) {
  const baseStore = createStore<OverlayStoreState<T>>({
    storeIds: ObjectKeys(overlays),
    stores: overlays,
  });

  function getStore(id: PropertyKey) {
    const stores = baseStore.get().stores;
    if (!isKeyOf(stores, id)) {
      throw new Error(`Overlay with id ${String(id)} does not exist`);
    }

    return stores[id];
  }

  function subscribe(listener: Listener<OverlayStoreState<T>>) {
    console.warn("Overlay store should not have multiple listeners");
    return baseStore.subscribe(listener);
  }

  const stores = baseStore.get().storeIds.reduce((acc, id) => {
    const store = getStore(id);
    acc[id] = {
      ...store.get(),
      render: (cb: () => ReactNode) => {
        store.set((oldState) => ({ ...oldState, content: cb() }));
      },
    };
    return acc;
  }, {} as { [K in keyof T]: T[K] });

  const res = { ...baseStore, subscribe, getStore, stores };

  overlaysStore = res;
  return res;
}

export function useOverlays() {
  if (!overlaysStore) {
    throw new Error("Overlay store not initialized");
  }
  return overlaysStore.get();
}

export function Overlay() {
  const { storeIds } = useOverlays();

  return (
    <>
      {storeIds.map((id) => (
        <OverlayManager key={String(id)} id={id} />
      ))}
    </>
  );
}

export function OverlayManager({ id }: { id: PropertyKey }) {
  if (!overlaysStore) {
    throw new Error("Overlay store not initialized");
  }
  const store = overlaysStore.getStore(id);

  const [overlayState, setOverlayState] = useState(store.get());
  console.log(`${String(id)} rendered`);

  useEffect(() => {
    const unsubscribe = store.subscribe(setOverlayState);
    return unsubscribe;
  }, [store]);

  return (
    <div id={`overlay-${String(id)}`} className="m-2 bg-blue-600 p-6">
      <h3>{String(id)}</h3>
      <div className="border-2 border-white p-4">
        {!overlayState.content ? (
          <div>Nothing</div>
        ) : (
          <div>{overlayState.content}</div>
        )}
      </div>
    </div>
  );
}

const modalStore = createStore<{
  isOpen: boolean;
  windows: string[];
  open: (value: string) => void;
  close: () => void;
}>((state) => ({
  open: (value) => {
    if (state.isOpen) {
      state.windows.push(value);
    }
  },
  close: () => {},
}));

const toastStore = createStore<{
  open: (value: ReactNode) => void;
}>({
  open: (value) => {
    console.log({ value });
  },
});

const {
  stores: { modal, toast },
} = createOverlayStore({ modal: modalStore, toast: toastStore });

export { modal, toast };

// Not use single component per group. We need to spam divs in order to manipulate the z-index.
// Refactor how you create overlays: Renderer, actions, state
