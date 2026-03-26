'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [session, setSession] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (session) fetchNotes();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchNotes();
      } else {
        setNotes([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    
    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes'
        },
        (payload) => {
          console.log('Change received!', payload)
          fetchNotes()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session]);

  async function handleSignUp(e) {
    if (e) e.preventDefault();
    setAuthError(null);
    const { error } = await supabase.auth.signUp({
      email: authEmail,
      password: authPassword,
    });
    if (error) setAuthError(error.message);
    else alert('Signup successful! Please check your email for the login link or verify the account if needed.');
  }

  async function handleLogin(e) {
    if (e) e.preventDefault();
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });
    if (error) setAuthError(error.message);
  }

  async function handleGoogleLogin() {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) setAuthError(error.message);
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error logging out:', error);
  }

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

  if (authLoading) {
    return <main><p className="loading">Checking authentication...</p></main>;
  }

  if (!session) {
    return (
      <main>
        <h1>Supabase Test App</h1>
        <h2>Login / Sign Up</h2>
        {authError && <div className="error">{authError}</div>}
        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Email"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            required
          />
          <div className="auth-buttons">
            <button onClick={handleLogin} className="login-btn">Login</button>
            <button onClick={handleSignUp} className="signup-btn">Sign Up</button>
          </div>
        </form>
        <div className="oauth-section">
          <p>Or</p>
          <button onClick={handleGoogleLogin} className="google-btn">Login with Google</button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <h1>Supabase Test App</h1>
      
      <div className="user-info">
        <span>Logged in as: {session.user.email}</span>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

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
