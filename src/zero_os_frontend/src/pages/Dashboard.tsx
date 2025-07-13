import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useFileSystem } from '../contexts/FileSystemContext';

const Dashboard: React.FC = () => {
  const { files, notes, tasks, getStorageInfo } = useFileSystem();
  const [storageInfo, setStorageInfo] = useState<Record<string, bigint>>({});

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    const info = await getStorageInfo();
    setStorageInfo(info);
  };

  const formatBytes = (bytes: bigint) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0n) return '0 Bytes';
    const i = Math.floor(Math.log(Number(bytes)) / Math.log(1024));
    return Math.round(Number(bytes) / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const recentFiles = files.slice(0, 5);
  const recentNotes = notes.slice(0, 3);
  const pendingTasks = tasks.filter(task => !task.completed).slice(0, 5);

  return (
    <div className="page-header d-print-none">
      <div className="container-xl">
        <div className="row g-2 align-items-center">
          <div className="col">
            <h2 className="page-title">
              Dashboard
            </h2>
          </div>
        </div>
      </div>
      <div className="page-body">
        <div className="container-xl">
          <div className="row row-deck row-cards">
            {/* Storage Stats */}
            <div className="col-sm-6 col-lg-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="subheader">Total Files</div>
                    </div>
                    <div className="h1 mb-3">{Number(storageInfo.file_count || 0n)}</div>
                    <div className="d-flex mb-2">
                      <div>Storage Used</div>
                      <div className="ms-auto">
                        <span className="text-green d-inline-flex align-items-center lh-1">
                          {formatBytes(storageInfo.total_file_size || 0n)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="col-sm-6 col-lg-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="subheader">Notes</div>
                    </div>
                    <div className="h1 mb-3">{Number(storageInfo.note_count || 0n)}</div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="col-sm-6 col-lg-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="subheader">Tasks</div>
                    </div>
                    <div className="h1 mb-3">{Number(storageInfo.task_count || 0n)}</div>
                    <div className="d-flex mb-2">
                      <div>Pending</div>
                      <div className="ms-auto">
                        <span className="text-yellow d-inline-flex align-items-center lh-1">
                          {pendingTasks.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="col-sm-6 col-lg-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="subheader">Status</div>
                    </div>
                    <div className="h1 mb-3 text-green">Online</div>
                    <div className="d-flex mb-2">
                      <div>Blockchain</div>
                      <div className="ms-auto">
                        <span className="text-green d-inline-flex align-items-center lh-1">
                          ✓ Connected
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          
          <div className="row row-deck row-cards mt-4">
            {/* Recent Files */}
            <div className="col-md-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Recent Files</h3>
                  </div>
                  <div className="card-body">
                    {recentFiles.length === 0 ? (
                      <div className="text-muted">No files yet</div>
                    ) : (
                      <div className="list-group list-group-flush">
                        {recentFiles.map((file) => (
                          <div key={file.id} className="list-group-item">
                            <div className="d-flex">
                              <div className="flex-fill">
                                <div className="fw-bold">{file.name}</div>
                                <div className="text-muted">{formatBytes(file.size)}</div>
                              </div>
                              <div className="text-muted">
                                {file.is_folder ? '📁' : '📄'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Recent Notes */}
            <div className="col-md-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Recent Notes</h3>
                  </div>
                  <div className="card-body">
                    {recentNotes.length === 0 ? (
                      <div className="text-muted">No notes yet</div>
                    ) : (
                      <div className="list-group list-group-flush">
                        {recentNotes.map((note) => (
                          <div key={note.id} className="list-group-item">
                            <div className="fw-bold">{note.title}</div>
                            <div className="text-muted">{note.content.substring(0, 100)}...</div>
                            <div className="d-flex mt-2">
                              {note.tags.map((tag) => (
                                <span key={tag} className="badge bg-secondary me-1">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Pending Tasks */}
          <div className="row row-deck row-cards mt-4">
            <div className="col-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Pending Tasks</h3>
                  </div>
                  <div className="card-body">
                    {pendingTasks.length === 0 ? (
                      <div className="text-muted">No pending tasks</div>
                    ) : (
                      <div className="list-group list-group-flush">
                        {pendingTasks.map((task) => (
                          <div key={task.id} className="list-group-item">
                            <div className="d-flex">
                              <div className="flex-fill">
                                <div className="fw-bold">{task.title}</div>
                                <div className="text-muted">{task.description}</div>
                              </div>
                              <div className="text-muted">
                                <span className={`badge ${
                                  task.priority === 'high' ? 'bg-danger' : 
                                  task.priority === 'medium' ? 'bg-warning' : 'bg-info'
                                }`}>
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
