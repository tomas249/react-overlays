"use client";

import { useEffect, ReactNode, CSSProperties, useState } from "react";

/**
 * STORE
 */

type Toast = {
  id: string;
  content: ReactNode;
  style?: CSSProperties;
};

type State = Toast[];

function createActions(oldState: State) {
  return {
    addToast: (id: string, content: ReactNode, style?: CSSProperties) => {
      const toast: Toast = { id, content, style };
      return [...oldState, toast];
    },
    deleteToast: (id: string) => oldState.filter((toast) => toast.id !== id),
    updateToast: (id: string, content: ReactNode, style?: CSSProperties) => {
      return oldState.map((toast) => {
        if (toast.id === id) {
          return { ...toast, content, style };
        }

        return toast;
      });
    },
  };
}

function dispatch(
  actionsCb: (actions: ReturnType<typeof createActions>) => State
) {
  const actions = createActions(globalState);
  const newState = actionsCb(actions);

  globalState = newState;

  listeners.forEach((listener) => {
    listener(newState);
  });
}

let globalState: State = [];
const listeners: ((state: State) => void)[] = [];

export function useStore() {
  const [state, setState] = useState(globalState);

  useEffect(() => {
    listeners.push(setState);

    return () => {
      const index = listeners.indexOf(setState);
      if (index >= 0) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return { state };
}

function getProps(id: string) {
  return {
    id,
    update: (content: ReactNode, style?: CSSProperties) => {
      dispatch((actions) => actions.updateToast(id, content, style));
    },
    delete: () => {
      dispatch((actions) => actions.deleteToast(id));
    },
  };
}

/**
 * DISPATCH
 */
const getId = initId();

export function toast(
  content: (props: ReturnType<typeof getProps>) => ReactNode,
  style?: CSSProperties
) {
  const id = getId();
  const props = getProps(id);
  dispatch((actions) => actions.addToast(id, content(props), style));

  return props;
}

/**
 * RENDERER
 */
export function Toaster() {
  const { state } = useStore();

  return (
    <div className="fixed bottom-4 right-4">
      {state.map((toast) => (
        <div
          key={toast.id}
          className="mb-4 rounded-lg bg-white p-4 text-black shadow-lg"
          style={toast.style}
        >
          {toast.content}
        </div>
      ))}
    </div>
  );
}

/**
 * ##################################
 * HELPERS
 */

function initId() {
  let id = 1;
  return () => {
    return String(id++);
  };
}
