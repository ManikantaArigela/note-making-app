import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Pin, 
  Tag, 
  X, 
  FileText, 
  Sparkles,
  Loader
} from 'lucide-react';

// Card color presets that map directly to the CSS theme variables
const COLOR_PRESETS = [
  { name: 'Default', hex: '#1e1e2f', class: 'color-default' },
  { name: 'Indigo', hex: '#2d264d', class: 'color-indigo' },
  { name: 'Emerald', hex: '#142d22', class: 'color-emerald' },
  { name: 'Crimson', hex: '#3d1b24', class: 'color-crimson' },
  { name: 'Amber', hex: '#3d2b16', class: 'color-amber' },
  { name: 'Teal', hex: '#163135', class: 'color-teal' }
];

function App() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search bar query state
  const [searchQuery, setSearchQuery] = useState('');

  // Create Note Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#1e1e2f');
  const [tagsInput, setTagsInput] = useState('');
  const [pinned, setPinned] = useState(false);

  // Edit Modal State
  const [editingNote, setEditingNote] = useState(null); // stores the full note object being edited
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editTagsInput, setEditTagsInput] = useState('');
  const [editPinned, setEditPinned] = useState(false);

  // ==========================================
  // API INTEGRATION (CRUD OPERATIONS)
  // ==========================================

  // Fetch all notes (READ operation)
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notes');
      if (!response.ok) {
        throw new Error('Failed to load notes from database');
      }
      const data = await response.json();
      setNotes(data);
      setError(null);
    } catch (err) {
      console.error('Fetch notes error:', err);
      setError('Could not connect to the backend server. Make sure the backend is running!');
    } finally {
      setLoading(false);
    }
  };

  // Run fetchNotes when the component mounts
  useEffect(() => {
    fetchNotes();
  }, []);

  // Add a new note (CREATE operation)
  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Convert tag string (e.g. "work, life, notes") to structured array
    const tagsArray = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          color,
          pinned,
          tags: tagsArray
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save the note');
      }

      // Refresh list
      fetchNotes();
      
      // Reset form fields
      setTitle('');
      setContent('');
      setColor('#1e1e2f');
      setTagsInput('');
      setPinned(false);
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete a note (DELETE operation)
  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete the note');
      }

      // Update local state directly for responsive feel, or fetch again
      setNotes(notes.filter(note => note._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Open the edit modal with current note details loaded
  const openEditModal = (note) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditColor(note.color);
    setEditPinned(note.pinned);
    setEditTagsInput(note.tags.join(', '));
  };

  // Close the edit modal
  const closeEditModal = () => {
    setEditingNote(null);
  };

  // Save changes to note (UPDATE operation)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    const tagsArray = editTagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    try {
      const response = await fetch(`/api/notes/${editingNote._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          content: editContent.trim(),
          color: editColor,
          pinned: editPinned,
          tags: tagsArray
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save note edits');
      }

      // Refresh notes list & close modal
      fetchNotes();
      closeEditModal();
    } catch (err) {
      alert(err.message);
    }
  };

  // Toggle quick pin/unpin status (UPDATE operation)
  const handleTogglePin = async (note) => {
    try {
      const response = await fetch(`/api/notes/${note._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...note,
          pinned: !note.pinned
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update note pin');
      }

      // Refresh notes list
      fetchNotes();
    } catch (err) {
      alert(err.message);
    }
  };

  // ==========================================
  // SEARCH / FILTER LOGIC
  // ==========================================
  const filteredNotes = notes.filter(note => {
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="app-container">
      {/* HEADER SECTION */}
      <header>
        <div className="logo">
          <Sparkles size={28} className="logo-sparkle" style={{ color: '#7c4dff' }} />
          <h1>LuminalNotes</h1>
          <span>MERN Stack</span>
        </div>

        {/* SEARCH TOOLBAR */}
        <div className="toolbar">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search notes, body content, or tags..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* ERROR MESSAGE BANNER */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          padding: '1rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* NOTE CREATION COMPONENT (CREATE) */}
      <form className="note-creator" onSubmit={handleCreateNote}>
        <input 
          type="text" 
          placeholder="Take a note title..." 
          className="note-creator-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        
        <textarea 
          placeholder="Write your note body content..." 
          className="note-creator-body"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <input 
          type="text" 
          placeholder="Tags (separated by commas, e.g. Ideas, Work, Personal)" 
          className="note-creator-tags"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />

        <div className="note-creator-actions">
          {/* Note color picker */}
          <div className="color-picker">
            <span style={{ fontSize: '0.85rem', marginRight: '0.25rem', color: '#9ca3af' }}>Color:</span>
            {COLOR_PRESETS.map((preset) => (
              <div 
                key={preset.hex}
                className={`color-dot ${color === preset.hex ? 'active' : ''}`}
                style={{ backgroundColor: preset.hex }}
                onClick={() => setColor(preset.hex)}
                title={preset.name}
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {/* Note Pin toggle */}
            <button 
              type="button"
              className={`btn-pin ${pinned ? 'pinned' : ''}`}
              onClick={() => setPinned(!pinned)}
              title={pinned ? 'Pinned' : 'Pin Note'}
            >
              <Pin size={18} fill={pinned ? 'currentColor' : 'none'} />
            </button>

            {/* Submit note button */}
            <button type="submit" className="btn btn-primary">
              <Plus size={16} /> Add Note
            </button>
          </div>
        </div>
      </form>

      {/* LOADER SPINNER */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
          <Loader className="spinner" size={32} style={{ animation: 'spin 2s linear infinite', color: '#7c4dff' }} />
        </div>
      ) : (
        /* NOTES GRID SECTION (READ) */
        <div className="notes-grid">
          {filteredNotes.length === 0 ? (
            <div className="no-notes-message">
              <FileText size={48} />
              <p>{searchQuery ? 'No notes matched your search query.' : 'Create your first note above to get started!'}</p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              // Find matching color class
              const activeColorPreset = COLOR_PRESETS.find(p => p.hex === note.color) || COLOR_PRESETS[0];
              
              // Format dates nicely
              const formattedDate = new Date(note.updatedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div key={note._id} className={`note-card ${activeColorPreset.class}`}>
                  <div>
                    {/* Header: Title & Pin Toggle */}
                    <div className="note-header">
                      <h4 className="note-title">{note.title}</h4>
                      <button 
                        className={`btn-pin ${note.pinned ? 'pinned' : ''}`}
                        onClick={() => handleTogglePin(note)}
                        title={note.pinned ? 'Unpin note' : 'Pin note'}
                      >
                        <Pin size={15} fill={note.pinned ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    {/* Note Body */}
                    <p className="note-body">{note.content}</p>

                    {/* Note Tag Badges */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="note-tags-list">
                        {note.tags.map((tag, idx) => (
                          <span key={idx} className="tag-badge">
                            <Tag size={10} style={{ marginRight: '2px', display: 'inline' }} />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer: Date & CRUD controls */}
                  <div className="note-footer">
                    <span className="note-date">{formattedDate}</span>
                    <div className="note-card-actions">
                      {/* Update Note Action */}
                      <button 
                        className="icon-btn" 
                        onClick={() => openEditModal(note)}
                        title="Edit note"
                      >
                        <Edit2 size={14} />
                      </button>
                      {/* Delete Note Action */}
                      <button 
                        className="icon-btn icon-btn-delete" 
                        onClick={() => handleDeleteNote(note._id)}
                        title="Delete note"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* EDIT MODAL DIALOG (UPDATE POPUP) */}
      {editingNote && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Note</h3>
              <button className="icon-btn" onClick={closeEditModal}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="edit-title">Title</label>
                  <input 
                    id="edit-title"
                    type="text" 
                    className="form-control"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-content">Content</label>
                  <textarea 
                    id="edit-content"
                    className="form-control"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-tags">Tags (comma-separated)</label>
                  <input 
                    id="edit-tags"
                    type="text" 
                    className="form-control"
                    value={editTagsInput}
                    onChange={(e) => setEditTagsInput(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  {/* Edit color selector */}
                  <div className="color-picker">
                    <span style={{ fontSize: '0.85rem', color: '#9ca3af', marginRight: '0.25rem' }}>Color:</span>
                    {COLOR_PRESETS.map((preset) => (
                      <div 
                        key={preset.hex}
                        className={`color-dot ${editColor === preset.hex ? 'active' : ''}`}
                        style={{ backgroundColor: preset.hex }}
                        onClick={() => setEditColor(preset.hex)}
                        title={preset.name}
                      />
                    ))}
                  </div>

                  {/* Edit pin toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Pinned:</span>
                    <button 
                      type="button"
                      className={`btn-pin ${editPinned ? 'pinned' : ''}`}
                      onClick={() => setEditPinned(!editPinned)}
                    >
                      <Pin size={18} fill={editPinned ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeEditModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add spin animation locally for loader */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
