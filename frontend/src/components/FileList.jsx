import React, { useEffect, useState, useCallback } from "react";
import { formatBytes, iconFor } from "../utils/format";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; 

export default function FileList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/files`);
      if (res.status === 404) {
        setFiles([]);
      } else if (res.ok) {
        const data = await res.json();
        setFiles(Array.isArray(data) ? data : []);
      } else {
        console.error("GET /api/files failed:", res.status);
        setFiles([]);
      }
    } catch (e) {
      console.error("Error fetching files:", e);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  // refresh after successful uploads
  useEffect(() => {
    const handler = () => fetchFiles();
    window.addEventListener("files:changed", handler);
    return () => window.removeEventListener("files:changed", handler);
  }, [fetchFiles]);

  return (
    <div className="bg-white rounded-2xl border p-4">
      <div className="mb-3">
        <h4 className="font-semibold">Uploaded Files</h4>
        <p className="text-sm text-gray-500">Latest uploads appear first.</p>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading files…</p>}

      {!loading && files.length === 0 && (
        <div className="text-center p-6 text-gray-500">
          <div className="text-4xl mb-2">📭</div>
          <p>No files uploaded yet.</p>
        </div>
      )}

      {!loading && files.length > 0 && (
        <ul className="divide-y">
          {files.slice().reverse().map((f) => {
            const id = f._id || f.id;
            const name = f.filename || "file";
            const type = f.contentType || "application/octet-stream";
            const size = f.length ? formatBytes(f.length) : "";
            const streamUrl   = `${BASE_URL}/api/files/${id}/stream`;
            const downloadUrl = `${BASE_URL}/api/files/${id}/download`;

            return (
              <li key={id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-2xl">{iconFor(type)}</div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{name}</p>
                    <p className="text-xs text-gray-500">
                      {type}{size ? ` • ${size}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(type.startsWith("video") || type.startsWith("audio")) && (
                    <a
                      href={streamUrl}
                      className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-50"
                      target="_blank" rel="noreferrer"
                    >
                      Open
                    </a>
                  )}
                  <a
                    href={downloadUrl}
                    className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                    download
                  >
                    Download
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

