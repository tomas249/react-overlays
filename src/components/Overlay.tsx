"use client";

import { ReactNode, useCallback, useEffect, useRef } from "react";
import { createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";

type StoreItem<T> = T & {
  id: string;
  content: ReactNode;
  actions: {
    close: () => void;
    hide: () => void;
    show: () => void;
  };
};

type Store<T = {}> = StoreItem<T>[];

type OverlayContextProps = {
  render: (content: ReactNode) => void;
};

const OverlayContext = createContext({} as OverlayContextProps);

export function useOverlay() {
  return useContext(OverlayContext);
}

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [overlayContent, setOverlayContent] = useState<ReactNode>();

  const portalNodeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    console.log("create portal node");
    if (portalNodeRef.current) return;

    const placeholder = document.getElementById("content");
    if (!placeholder) return;

    const node = document.createElement("div");
    node.id = "overlay-portal" + Math.random().toString(36);
    portalNodeRef.current = node;

    placeholder.parentNode?.insertBefore(node, placeholder.nextSibling);

    return () => {
      if (!portalNodeRef.current) return;

      portalNodeRef.current.remove();
      portalNodeRef.current = null;
    };
  }, []);

  const render = useCallback((content: ReactNode) => {
    setOverlayContent(content);
  }, []);

  return (
    <>
      <OverlayContext.Provider value={{ render }}>
        {children}
      </OverlayContext.Provider>
      {portalNodeRef.current &&
        createPortal(overlayContent, portalNodeRef.current)}
    </>
  );
}

function getUpdatedRender(
  allModals: {
    id: string;
    content: ReactNode;
    props: {
      top: number;
      left: number;
      display: "block" | "none";
    };
    actions: {
      close: () => void;
    };
  }[]
) {
  if (
    allModals.length === 0 ||
    allModals.every((modal) => modal.props.display === "none")
  )
    return <></>;

  return (
    <Backdrop>
      {allModals.map((modal) => (
        <Modal key={modal.id} {...modal.props}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h1>Modal</h1>
            <button onClick={modal.actions.close}>close</button>
          </div>
          <hr />
          {modal.content}
        </Modal>
      ))}
    </Backdrop>
  );
}

export function useModal() {
  const { render } = useOverlay();
  const [store, setStore] = useState<
    Store<{
      props: {
        top: number;
        left: number;
        display: "block" | "none";
      };
    }>
  >([]);

  useEffect(() => {
    render(getUpdatedRender(store));
  }, [store, render]);

  function addModal(content: ReactNode) {
    const id = Math.random().toString(36);
    const modal = {
      id,
      content,
      actions: {
        close: () => deleteModal(id),
        hide: () => hideModal(id),
        show: () => showModal(id),
      },
    };
    setStore((prevStore) => [
      ...prevStore,
      {
        ...modal,
        props: {
          top: 20 * (prevStore.length + 1),
          left: 50,
          display: "block",
        },
      },
    ]);

    return id;
  }

  function deleteModal(id: string) {
    setStore((prevStore) => {
      const updatedStore = prevStore.filter((modal) => modal.id !== id);
      if (updatedStore.length === prevStore.length) {
        console.warn(
          `You tried to delete a modal with id "${id}" but it doesn't exist`
        );
      }
      return updatedStore;
    });
  }

  function hideModal(id: string) {
    setStore((prevStore) =>
      prevStore.map((modal) =>
        modal.id === id
          ? {
              ...modal,
              props: {
                ...modal.props,
                display: "none",
              },
            }
          : modal
      )
    );
  }

  function showModal(id: string) {
    setStore((prevStore) =>
      prevStore.map((modal) =>
        modal.id === id
          ? {
              ...modal,
              props: {
                ...modal.props,
                display: "block",
              },
            }
          : modal
      )
    );
  }

  return {
    render: (
      cb: (actions: {
        close: () => void;
        hide: () => void;
        show: () => void;
      }) => ReactNode
    ) => {
      const actions = {
        close: () => deleteModal(id),
        hide: () => hideModal(id),
        show: () => showModal(id),
      };
      const content = cb(actions);
      const id = addModal(content);
      return {
        id,
        actions,
      };
    },
    delete: deleteModal,
  };
}

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
`;

const Modal = styled.div<{
  top: number;
  left: number;
  display: "block" | "none";
}>`
  display: ${(p) => p.display};
  position: fixed;
  top: ${(p) => p.top}%;
  left: ${(p) => p.left}%;
  transform: translate(-50%, -50%);
  background-color: grey;
  padding: 1rem;
  border-radius: 0.5rem;
  z-index: 101;
`;
