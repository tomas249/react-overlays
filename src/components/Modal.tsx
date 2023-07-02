"use client";

import { useEffect, ReactNode, CSSProperties, useState, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * STORE
 */

type Toast = {
  id: string;
  content: ReactNode;
  style?: CSSProperties;
};

type Store = {
  storeIds: string[];
  states: Record<string, any[]>;
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

const globalState: State = [];
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

type ContentProps<T> = Omit<ReturnType<typeof getProps>, "delete"> & {
  delete: (data: T) => void;
};

// export function toast<T>(
//   content: (props: ContentProps<T>) => ReactNode,
//   style?: CSSProperties
// ) {
//   const id = getId();
//   const props = getProps(id);

//   return new Promise<T>((resolve) => {
//     const deleteAndResolve = (data: T) => {
//       props.delete();
//       resolve(data);
//     };
//     const newProps = {
//       ...props,
//       delete: deleteAndResolve,
//     };
//     dispatch((actions) => actions.addToast(id, content(newProps), style));
//   });
// }

function ToastRenderer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-4 right-4">
      {toasts.map((toast) => (
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

export const toast = globalStore.add<State>("modal", {
  Renderer: (state) => {
    const [data, setDate] = useState(null);
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
  },
  dispatchActions: (oldState) => ({
    render: (id: string, content: ReactNode, style?: CSSProperties) => {
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
  }),
  instanceActions: (id, dispatch) => ({
    delete: () => {
      dispatch((actions) => actions.deleteToast(id));
    },
  }),
});

/**
 * RENDERER
 */

/**
 * ##################################
 * ####################################################################
 */

("use client");

import { CSSProperties, ReactNode, useEffect, useState } from "react";
import { getId } from "@/utils";

type Store<State, Actions> = {
  Renderer: (props: { state: State }) => JSX.Element;
  actions: (
    id: string,
    dispatch: (updateState: (oldState: State) => State) => void
  ) => Actions;
};

type Toast = {
  id: string;
  content: ReactNode;
  style?: CSSProperties;
};

let firstStore: Store<any, any> | null = null;

let globalState: Toast[] = [];
const listeners: ((state: Toast[]) => void)[] = [];

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

  return { state, store: firstStore };
}

export function Overlay() {
  const { state, store } = useStore();

  if (!store) {
    return <></>;
  }

  const { Renderer } = store;

  return <Renderer state={state} />;
}
// ------------------------------

function createStore<State, Actions>(
  name: string,
  store: Store<State, Actions>
) {
  firstStore = store;

  const { actions } = store;

  return (instance: (actions: Actions) => ReactNode) => {
    const id = getId();

    const dispatch = (updateState: (oldState: State) => State) => {
      const state = globalState as State;
      const newState = updateState(state);
      console.log({ state, newState });
      globalState = newState as any;
      listeners.forEach((listener) => {
        listener(globalState);
      });
    };

    const actionsWithState = actions(id, dispatch);
    const content = instance(actionsWithState);
    dispatch((old) => [...old, { id, content }]);
  };
}

type ToastActions = {
  close: () => void;
};

export const toast = createOverlay<Toast[], ToastActions>("toast", {
  Renderer: ({ state }) => {
    return (
      <div className="fixed bottom-4 right-4">
        {state.map((toast) => (
          <IndividualToast key={toast.id} {...toast} />
        ))}
      </div>
    );
  },
  actions: (id, dispatch) => ({
    close: () => {
      dispatch((oldState) => oldState.filter((toast) => toast.id !== id));
    },
  }),
});

const IndividualToast = ({ id, content, style }: Toast) => {
  const [visible, setVisible] = useState(true);
  const timer = setTimeout(() => {
    // props.close();
    setVisible(false);
  }, 3000);

  return (
    <div
      className={`duration-2000 m-6 rounded-lg bg-blue-500 p-4 text-white shadow-md transition ease-in-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={style}
    >
      {content}
    </div>
  );
};
