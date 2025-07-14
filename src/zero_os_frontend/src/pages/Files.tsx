import React, { useState, useRef } from 'react';
import { useFileSystem } from '../contexts/FileSystemContext';

const Files: React.FC = () => {
  const { files, folders, uploadFile, createFolder, loading } = useFileSystem();
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [showNewFolderForm, setShowNewFolderForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleFileUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      try {
        await uploadFile(file, currentPath);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      try {
        await createFolder(newFolderName.trim(), currentPath);
        setNewFolderName('');
        setShowNewFolderForm(false);
      } catch (error) {
        console.error('Failed to create folder:', error);
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    dragCounter.current = 0;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const currentFiles = files.filter(file => !file.is_folder && (file.parent_folder === currentPath || (currentPath === '/' && !file.parent_folder)));
  const currentFolders = folders.filter(folder => folder.parent_folder === currentPath || (currentPath === '/' && !folder.parent_folder));

  return (
    <div className="page-header">
      <div className="row align-items-center mb-3">
        <div className="col">
          <h2 className="page-title">
            📁 Files
          </h2>
          <div className="page-subtitle">
            <div className="row align-items-center">
              <div className="col-auto">
                <span className="text-muted">Current path: {currentPath}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-auto ms-auto">
          <div className="btn-list">
            <button
              className="btn btn-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
                <path d="M12 11v6"></path>
                <path d="M9 14h6"></path>
              </svg>
              Upload Files
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={() => setShowNewFolderForm(!showNewFolderForm)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2"></path>
                <path d="M12 10v4"></path>
                <path d="M10 12h4"></path>
              </svg>
              New Folder
            </button>
          </div>
        </div>
      </div>

      {showNewFolderForm && (
        <div className="card mb-3">
          <div className="card-header">
            <h3 className="card-title">Create New Folder</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateFolder}>
              <div className="row g-2">
                <div className="col">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="col-auto">
                  <button type="submit" className="btn btn-primary">
                    Create
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary ms-2"
                    onClick={() => {
                      setShowNewFolderForm(false);
                      setNewFolderName('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div
        className={`card ${isDragging ? 'border-primary bg-primary-subtle' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="card-header">
          <h3 className="card-title">File System</h3>
        </div>
        <div className="card-body">
          {isDragging && (
            <div className="text-center text-primary mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
                <path d="M12 11v6"></path>
                <path d="M9 14h6"></path>
              </svg>
              <p>Drop files here to upload</p>
            </div>
          )}

          {loading && (
            <div className="text-center mb-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {/* Back navigation */}
          {currentPath !== '/' && (
            <div className="mb-3">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  const pathParts = currentPath.split('/').filter(p => p);
                  pathParts.pop();
                  setCurrentPath(pathParts.length > 0 ? '/' + pathParts.join('/') : '/');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M5 12l14 0"></path>
                  <path d="M5 12l6 6"></path>
                  <path d="M5 12l6 -6"></path>
                </svg>
                Back
              </button>
            </div>
          )}

          <div className="row row-cards">
            {/* Folders */}
            {currentFolders.map((folder) => (
              <div key={folder.id} className="col-sm-6 col-lg-4">
                <div className="card card-sm">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-auto">
                        <span className="bg-primary text-white avatar">
                          📁
                        </span>
                      </div>
                      <div className="col">
                        <div className="font-weight-medium">
                          {folder.name}
                        </div>
                        <div className="text-muted">
                          Folder
                        </div>
                      </div>
                      <div className="col-auto">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => setCurrentPath(currentPath === '/' ? `/${folder.name}` : `${currentPath}/${folder.name}`)}
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Files */}
            {currentFiles.map((file) => (
              <div key={file.id} className="col-sm-6 col-lg-4">
                <div className="card card-sm">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-auto">
                        <span className="bg-success text-white avatar">
                          📄
                        </span>
                      </div>
                      <div className="col">
                        <div className="font-weight-medium">
                          {file.name}
                        </div>
                        <div className="text-muted">
                          {file.size.toString()} bytes • {file.file_type}
                        </div>
                      </div>
                      <div className="col-auto">
                        <button className="btn btn-outline-primary btn-sm">
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty state */}
            {currentFiles.length === 0 && currentFolders.length === 0 && !loading && (
              <div className="col-12">
                <div className="empty">
                  <div className="empty-icon">
                    📁
                  </div>
                  <p className="empty-title">No files in this folder</p>
                  <p className="empty-subtitle text-muted">
                    Upload some files or create a folder to get started.
                  </p>
                  <div className="empty-action">
                    <button
                      className="btn btn-primary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                        <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
                        <path d="M12 11v6"></path>
                        <path d="M9 14h6"></path>
                      </svg>
                      Upload your first file
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFileUpload(e.target.files)}
      />
    </div>
  );
};

export default Files;
