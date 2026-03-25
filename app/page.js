'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <main>
      <h1>Supabase Test App</h1>
      
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <form onSubmit={addNote}>
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Enter a note..."
          required
        />
        <button type="submit">Add Note</button>
      </form>

      {loading ? (
        <p>Loading notes...</p>
      ) : (
        <ul>
          {notes.map((note) => (
            <li key={note.id}>
              {note.text}
              <span className="date">
                {new Date(note.created_at).toLocaleString()}
              </span>
            </li>
          ))}
          {notes.length === 0 && <li>No notes found.</li>}
        </ul>
      )}
    </main>
  );
}
