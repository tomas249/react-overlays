"use client";

import { toast } from "@/components/Modal";
import { useRef, useState } from "react";

export default function Home() {
  const actionRef = useRef<any>(null);

  async function open() {
    const myToast = await toast<{ data: number }>((props) => (
      <div>
        <h1>hello: {props.id}</h1>
        <button
          className="rounded-lg bg-slate-500 px-4 py-2 hover:bg-slate-600"
          onClick={() => {
            props.delete({ data: 232 });
          }}
        >
          Close
        </button>
      </div>
    ));

    console.log(myToast);
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
        onClick={() => actionRef.current?.delete({ data: 232 })}
        className="rounded-lg bg-slate-500 px-4 py-2 hover:bg-slate-600"
      >
        Close last modal
      </button>
    </div>
  );
}
