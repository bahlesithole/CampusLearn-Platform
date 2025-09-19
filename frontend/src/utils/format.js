// src/utils/format.js
export function formatBytes(bytes = 0) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B","KB","MB","GB","TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function iconFor(type = "") {
  if (type.startsWith("image")) return "🖼️";
  if (type.startsWith("video")) return "🎬";
  if (type.startsWith("audio")) return "🎵";
  if (type.includes("pdf")) return "📕";
  if (type.includes("zip")) return "🗜️";
  return "📄";
}
