import React, { useState } from 'react';
import { useFileSystem } from '../contexts/FileSystemContext';

const Notes: React.FC = () => {
  const { notes, createNote, updateNote, deleteNote, isLoading } = useFileSystem();
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      if (editingNote) {
        await updateNote(editingNote, formData.title, formData.content, tagsArray);
        setEditingNote(null);
      } else {
        await createNote(formData.title, formData.content, tagsArray);
        setShowNewNoteForm(false);
      }
      
      setFormData({ title: '', content: '', tags: '' });
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleEdit = (note: any) => {
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', '),
    });
    setEditingNote(note.id);
    setShowNewNoteForm(true);
  };

  const handleDelete = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(noteId);
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', tags: '' });
    setEditingNote(null);
    setShowNewNoteForm(false);
  };

  return (
    <div className="page-header">
      <div className="row align-items-center mb-3">
        <div className="col">
          <h2 className="page-title">📝 Notes</h2>
          <div className="page-subtitle">
            <span className="text-muted">{notes.length} notes</span>
          </div>
        </div>
        <div className="col-auto ms-auto">
          <button
            className="btn btn-primary"
            onClick={() => setShowNewNoteForm(!showNewNoteForm)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <path d="M12 5l0 14"></path>
              <path d="M5 12l14 0"></path>
            </svg>
            New Note
          </button>
        </div>
      </div>

      {showNewNoteForm && (
        <div className="card mb-3">
          <div className="card-header">
            <h3 className="card-title">
              {editingNote ? 'Edit Note' : 'Create New Note'}
            </h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Content</label>
                <textarea
                  className="form-control"
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Tags (comma-separated)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="work, personal, ideas"
                />
              </div>
              <div className="btn-list">
                <button type="submit" className="btn btn-primary">
                  {editingNote ? 'Update' : 'Create'} Note
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="text-center mb-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <div className="row row-cards">
        {notes.map((note) => (
          <div key={note.id} className="col-md-6 col-lg-4">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">{note.title}</h3>
                <div className="card-actions">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleEdit(note)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm ms-2"
                    onClick={() => handleDelete(note.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="card-body">
                <p className="text-muted">
                  {note.content.length > 200 
                    ? note.content.substring(0, 200) + '...' 
                    : note.content
                  }
                </p>
                {note.tags.length > 0 && (
                  <div className="mt-2">
                    {note.tags.map((tag, index) => (
                      <span key={index} className="badge bg-secondary me-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="card-footer">
                <small className="text-muted">
                  Created: {new Date(Number(note.created_at) / 1000000).toLocaleDateString()}
                </small>
              </div>
            </div>
          </div>
        ))}

        {notes.length === 0 && !isLoading && (
          <div className="col-12">
            <div className="empty">
              <div className="empty-icon">📝</div>
              <p className="empty-title">No notes yet</p>
              <p className="empty-subtitle text-muted">
                Create your first note to get started.
              </p>
              <div className="empty-action">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowNewNoteForm(true)}
                >
                  Create your first note
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
