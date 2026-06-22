"use client";
import React from "react";
import { Pencil } from "lucide-react";

export default function FloatingActionButton() {
  return (
    <button
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-full shadow-lg flex items-center justify-center transition hover:scale-105"
      aria-label="New message"
      onClick={() => {
        // Could open a new message modal or navigate to compose
        window.location.href = "/dashboard/messages";
      }}
    >
      <Pencil className="w-5 h-5" />
    </button>
  );
}
