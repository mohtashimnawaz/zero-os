import React, { useState } from 'react';
import { useFileSystem } from '../contexts/FileSystemContext';

const Notes: React.FC = () => {
  const { notes, createNote, updateNote, deleteNote, loading } = useFileSystem();
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.title.trim() && newNote.content.trim()) {
      try {
        const tags = newNote.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
        await createNote(newNote.title.trim(), newNote.content.trim(), tags);
        setNewNote({ title: '', content: '', tags: '' });
        setShowNewNoteForm(false);
      } catch (error) {
        console.error('Failed to create note:', error);
      }
    }
  };

  const handleUpdateNote = async (noteId: string, title: string, content: string, tags: string[]) => {
    try {
      await updateNote(noteId, title, content, tags);
      setEditingNote(null);
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(noteId);
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp / BigInt(1000000))).toLocaleDateString();
  };

  return (
    <div className="page-header">
      <div className="row align-items-center mb-3">
        <div className="col">
          <h2 className="page-title">
            📝 Notes
          </h2>
          <div className="page-subtitle">
            <div className="row align-items-center">
              <div className="col-auto">
                <span className="text-muted">Your personal notes and thoughts</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-auto ms-auto">
          <div className="btn-list">
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
      </div>

      {/* Search */}
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <circle cx="10" cy="10" r="7"></circle>
                <path d="m21 21-6-6"></path>
              </svg>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {showNewNoteForm && (
        <div className="card mb-3">
          <div className="card-header">
            <h3 className="card-title">Create New Note</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateNote}>
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Note title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Content</label>
                <textarea
                  className="form-control"
                  rows={6}
                  placeholder="Write your note here..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Tags</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="tag1, tag2, tag3"
                  value={newNote.tags}
                  onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                />
                <div className="form-hint">Separate tags with commas</div>
              </div>
              <div className="btn-list">
                <button type="submit" className="btn btn-primary">
                  Create Note
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setShowNewNoteForm(false);
                    setNewNote({ title: '', content: '', tags: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center mb-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <div className="row row-cards">
        {filteredNotes.map((note) => (
          <div key={note.id} className="col-md-6 col-lg-4">
            <div className="card">
              <div className="card-body">
                {editingNote === note.id ? (
                  <EditNoteForm
                    note={note}
                    onSave={handleUpdateNote}
                    onCancel={() => setEditingNote(null)}
                  />
                ) : (
                  <>
                    <h3 className="card-title">{note.title}</h3>
                    <div className="text-muted mb-2">
                      {note.content.length > 150 
                        ? `${note.content.substring(0, 150)}...` 
                        : note.content
                      }
                    </div>
                    {note.tags.length > 0 && (
                      <div className="mb-3">
                        {note.tags.map((tag) => (
                          <span key={tag} className="badge bg-secondary me-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-muted small mb-2">
                      Created: {formatDate(note.created_at)}
                    </div>
                    <div className="btn-list">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setEditingNote(note.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                          <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1"></path>
                          <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z"></path>
                          <path d="M16 5l3 3"></path>
                        </svg>
                        Edit
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                          <path d="M4 7l16 0"></path>
                          <path d="M10 11l0 6"></path>
                          <path d="M14 11l0 6"></path>
                          <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
                          <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredNotes.length === 0 && !loading && (
          <div className="col-12">
            <div className="empty">
              <div className="empty-icon">
                📝
              </div>
              <p className="empty-title">
                {searchTerm ? 'No notes found' : 'No notes yet'}
              </p>
              <p className="empty-subtitle text-muted">
                {searchTerm 
                  ? 'Try adjusting your search terms.'
                  : 'Create your first note to get started organizing your thoughts.'
                }
              </p>
              {!searchTerm && (
                <div className="empty-action">
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowNewNoteForm(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M12 5l0 14"></path>
                      <path d="M5 12l14 0"></path>
                    </svg>
                    Create your first note
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface EditNoteFormProps {
  note: any;
  onSave: (id: string, title: string, content: string, tags: string[]) => void;
  onCancel: () => void;
}

const EditNoteForm: React.FC<EditNoteFormProps> = ({ note, onSave, onCancel }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState(note.tags.join(', '));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
    onSave(note.id, title, content, tagArray);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <textarea
          className="form-control"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="tag1, tag2, tag3"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>
      <div className="btn-list">
        <button type="submit" className="btn btn-primary btn-sm">
          Save
        </button>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default Notes;
