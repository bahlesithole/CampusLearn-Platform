import React from "react";

export function StatCard({ title, status, progress }) {
  return (
    <div className="bg-white rounded-2xl border p-4" role="group" aria-label={`${title} progress`}>
      <div className="flex items-center justify-between">
        <p className="font-semibold">{title}</p>
        <span className="text-xs text-gray-500">{status}</span>
      </div>
      <div className="mt-4 h-2 rounded bg-gray-100 overflow-hidden">
        <div className="h-2 bg-gray-800" style={{ width: progress }} />
      </div>
    </div>
  );
}

export function TutorCard({ name, subject }) {
  return (
    <div className="bg-white rounded-2xl border p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 grid place-items-center">👤</div>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-xs text-gray-500">{subject}</p>
        </div>
      </div>
      <button className="px-3 py-1 rounded-full border text-sm">Contact</button>
    </div>
  );
}

export function ResourceCard({ title }) {
  return (
    <div className="bg-white rounded-2xl border p-3">
      <div className="aspect-[16/9] rounded-xl bg-gray-100 grid place-items-center">📘</div>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Resource</p>
          <p className="font-medium">{title}</p>
        </div>
        <button className="p-2 rounded-lg border" aria-label={`Download ${title}`}>⬇️</button>
      </div>
    </div>
  );
}
