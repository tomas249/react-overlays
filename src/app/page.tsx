"use client";

import { toast } from "@/components/Modal";
import { useState } from "react";

export default function Home() {
  const [lastToast, setLastToast] = useState<any>(null);

  function open() {
    const myToast = toast((props) => (
      <div>
        <h1>hello: {props.id}</h1>
        <button
          className="rounded-lg bg-slate-500 px-4 py-2 hover:bg-slate-600"
          onClick={() => {
            myToast.delete();
          }}
        >
          Close
        </button>
      </div>
    ));

    setLastToast(myToast);
  }

  return (
    <div className="text-lg">
      <h1>Home</h1>
      <button
        onClick={open}
        className="rounded-lg bg-slate-500 px-4 py-2 hover:bg-slate-600"
      >
        Open modal
      </button>
      <button
        onClick={() => lastToast?.delete()}
        className="rounded-lg bg-slate-500 px-4 py-2 hover:bg-slate-600"
      >
        Close last modal
      </button>
    </div>
  );
}
