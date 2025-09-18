import React, { useEffect, useState } from 'react';

const FileList = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/files')
      .then(res => res.json())
      .then(data => setFiles(data))
      .catch(err => console.error(err));
  }, []);

  if (!files.length) {
    return <div className="upload-content-box">No files uploaded yet.</div>;
  }

  return (
    <div className="upload-content-box">
      {files.map(file => (
        <div key={file._id} style={{ marginBottom: '12px' }}>
          <p>{file.filename}</p>

          {file.contentType.startsWith('video') && (
            <video width="100%" controls style={{ marginBottom: '6px' }}>
              <source src={`http://localhost:5000/api/files/${file._id}/stream`} type={file.contentType} />
            </video>
          )}

          {file.contentType.startsWith('audio') && (
            <audio controls style={{ width: '100%', marginBottom: '6px' }}>
              <source src={`http://localhost:5000/api/files/${file._id}/stream`} type={file.contentType} />
            </audio>
          )}

          <a
            href={`http://localhost:5000/api/files/${file._id}/download`}
            download
            className="upload-btn"
            style={{ fontSize: '0.9rem', padding: '6px 12px', marginTop: '4px' }}
          >
            Download
          </a>
        </div>
      ))}
    </div>
  );
};

export default FileList;

