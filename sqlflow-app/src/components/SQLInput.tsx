import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface SQLInputProps {
  sqlCode: string;
  onSQLChange: (sql: string) => void;
}

const SQLInput: React.FC<SQLInputProps> = ({ sqlCode, onSQLChange }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onSQLChange(content);
      };
      reader.readAsText(file);
    }
  }, [onSQLChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.sql', '.txt'],
      'application/sql': ['.sql']
    },
    multiple: false
  });

  return (
    <div className="sql-input-container">
      <div className="file-upload-section">
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'active' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="dropzone-content">
            {isDragActive ? (
              <p>Drop the SQL file here...</p>
            ) : (
              <p>Drag & drop an SQL file here, or click to select one</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="text-input-section">
        <textarea
          value={sqlCode}
          onChange={(e) => onSQLChange(e.target.value)}
          placeholder="Or paste your SQL code here..."
          className="sql-textarea"
          rows={10}
        />
      </div>
    </div>
  );
};

export default SQLInput;