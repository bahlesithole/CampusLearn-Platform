import React, { useState } from 'react';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({ uploadedBy: 'student123', module: 'WPR3781' });
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Upload successful! File ID: ${data.id}`);
      } else {
        setMessage(`❌ Upload failed: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Upload error');
    }
  };

  return (
    <div>
      <h1 className="title upload-title">Upload Content</h1>

      <div className="input-group upload-group">
        <label>Select a file to upload</label>
        <input type="file" onChange={handleFileChange} />
      </div>

      <button className="upload-btn" onClick={handleUpload}>Upload</button>

      {message && <div className="upload-content-box">{message}</div>}
    </div>
  );
};

export default FileUpload;
