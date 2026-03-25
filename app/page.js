'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching notes:', error);
      setError('Failed to fetch notes. Have you set the environment variables?');
    } else {
      setNotes(data || []);
      setError(null);
    }
    setLoading(false);
  }

  async function addNote(e) {
    e.preventDefault();
    if (!newNote.trim()) return;

    const { error } = await supabase
      .from('notes')
      .insert([{ text: newNote }]);
    
    if (error) {
      console.error('Error inserting note:', error);
      setError('Failed to add note.');
    } else {
      setNewNote('');
      fetchNotes();
    }
  }

  function startEdit(note) {
    setEditingId(note.id);
    setEditText(note.text);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText('');
  }

  async function updateNote(id) {
    if (!editText.trim()) return;

    const { error } = await supabase
      .from('notes')
      .update({ text: editText })
      .eq('id', id);

    if (error) {
      console.error('Error updating note:', error);
      setError('Failed to update note.');
    } else {
      setEditingId(null);
      setEditText('');
      fetchNotes();
    }
  }

  async function deleteNote(id) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting note:', error);
      setError('Failed to delete note.');
    } else {
      fetchNotes();
    }
  }

  return (
    <main>
      <h1>Supabase Test App</h1>
      
      {error && <div className="error">{error}</div>}

      <form onSubmit={addNote} className="add-form">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Enter a new note..."
          required
        />
        <button type="submit" className="add-btn">Add Note</button>
      </form>

      {loading ? (
        <p className="loading">Loading notes...</p>
      ) : (
        <ul className="notes-list">
          {notes.map((note) => (
            <li key={note.id} className="note-card">
              {editingId === note.id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    required
                  />
                  <div className="action-buttons">
                    <button onClick={() => updateNote(note.id)} className="save-btn">Save</button>
                    <button onClick={cancelEdit} className="cancel-btn">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="note-content">
                    <p className="note-text">{note.text}</p>
                    <span className="date">
                      {new Date(note.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="action-buttons">
                    <button onClick={() => startEdit(note)} className="edit-btn">Edit</button>
                    <button onClick={() => deleteNote(note.id)} className="delete-btn">Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
          {notes.length === 0 && <li className="empty-state">No notes found.</li>}
        </ul>
      )}
    </main>
  );
}
