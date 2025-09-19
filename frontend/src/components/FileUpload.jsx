import React, { useRef, useState } from "react";
import { formatBytes, iconFor } from "../utils/format";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";



export default function FileUpload() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [busy, setBusy] = useState(false);

  function onPick(e) {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setStatus({ type: "", msg: "" }); }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) { setFile(f); setStatus({ type: "", msg: "" }); }
  }

  async function onUpload() {
    if (!file || busy) return;
    try {
      setBusy(true);
      setStatus({ type: "", msg: "" });
      setProgress(0);

      // Use XMLHttpRequest for progress events
      const form = new FormData();
      form.append("file", file);

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${BASE_URL}/api/files`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(xhr));
        xhr.onerror = reject;
        xhr.send(form);
      });

      setStatus({ type: "success", msg: `Uploaded ${file.name}` });
      setFile(null);
      setProgress(100);
      window.dispatchEvent(new CustomEvent("files:changed"));
    } catch (err) {
      const code = err?.status || "";
      setStatus({ type: "error", msg: `Upload failed ${code ? `(${code})` : ""}` });
    } finally {
      setBusy(false);
      setTimeout(() => setProgress(0), 800);
    }
  }

  return (
    <div className="bg-white rounded-2xl border p-4">
      <div className="mb-3">
        <h4 className="font-semibold">Upload Files</h4>
        <p className="text-sm text-gray-500">PDF, images, audio, video…</p>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed p-6 grid place-items-center text-center cursor-pointer transition
          ${dragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
        onClick={() => inputRef.current?.click()}
        aria-label="Drop files here or click to browse"
      >
        <div className="space-y-1">
          <div className="text-3xl">⬆️</div>
          <p className="text-sm text-gray-600">
            Drag & drop a file here, or <span className="text-blue-600 underline">browse</span>
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          onChange={onPick}
          className="hidden"
        />
      </div>

      {/* Selected file preview */}
      {file && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border p-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-2xl">{iconFor(file.type)}</div>
            <div className="min-w-0">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{file.type || "unknown"} • {formatBytes(file.size)}</p>
            </div>
          </div>
          <button
            onClick={onUpload}
            disabled={busy}
            className={`px-3 py-2 rounded-lg text-sm text-white ${busy ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {busy ? "Uploading…" : "Upload"}
          </button>
        </div>
      )}

      {/* Progress */}
      {progress > 0 && (
        <div className="mt-3">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-2 bg-blue-600" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-1">{progress}%</p>
        </div>
      )}

      {/* Alerts */}
      {status.msg && (
        <div
          className={`mt-3 text-sm rounded-lg px-3 py-2 ${
            status.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
          role="status"
        >
          {status.msg}
        </div>
      )}
    </div>
  );
}

