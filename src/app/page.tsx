"use client";

import { toast } from "@/components/Store";
import { useEffect, useState } from "react";
import { create } from "zustand";

export default function Home() {
  async function open() {
    const myToast1 = toast.render(() => <div>Hello world</div>);
    const myToast2 = toast.render(() => <div>Hello world 22</div>);
    // const myToast3 = toast.open("Hello world 3");
    // console.log({ myToast1, myToast2, myToast3 });
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
      {/* <button
        onClick={() => actionRef.current?.delete({ data: 232 })}
        className="rounded-lg bg-slate-500 px-4 py-2 hover:bg-slate-600"
      >
        Close last modal
      </button> */}
    </div>
  );
}
