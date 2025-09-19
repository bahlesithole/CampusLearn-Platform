import React from "react";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="px-6 py-3 flex items-center gap-4">
        <input
          placeholder="Search topics, tutors, resources..."
          className="flex-1 rounded-2xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label="Search"
        />
        <button aria-label="User menu" className="w-9 h-9 rounded-full bg-blue-500 text-white">B</button>
      </div>
    </header>
  );
}
