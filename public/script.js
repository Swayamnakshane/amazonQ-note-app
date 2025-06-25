class NotesApp {
    constructor() {
        this.notes = [];
        this.currentNote = null;
        this.isEditing = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadNotes();
    }

    initializeElements() {
        // UI Elements
        this.newNoteBtn = document.getElementById('newNoteBtn');
        this.notesList = document.getElementById('notesList');
        this.searchInput = document.getElementById('searchInput');
        this.emptyState = document.getElementById('emptyState');
        this.noteForm = document.getElementById('noteForm');
        this.noteTitle = document.getElementById('noteTitle');
        this.noteContent = document.getElementById('noteContent');
        this.noteMeta = document.getElementById('noteMeta');
        this.saveBtn = document.getElementById('saveBtn');
        this.deleteBtn = document.getElementById('deleteBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.loadingIndicator = document.getElementById('loadingIndicator');
    }

    bindEvents() {
        this.newNoteBtn.addEventListener('click', () => this.createNewNote());
        this.saveBtn.addEventListener('click', () => this.saveNote());
        this.deleteBtn.addEventListener('click', () => this.deleteNote());
        this.cancelBtn.addEventListener('click', () => this.cancelEdit());
        this.searchInput.addEventListener('input', (e) => this.searchNotes(e.target.value));
        
        // Auto-save on content change (debounced)
        let saveTimeout;
        const autoSave = () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                if (this.isEditing && this.currentNote) {
                    this.saveNote(true); // Silent save
                }
            }, 2000);
        };
        
        this.noteTitle.addEventListener('input', autoSave);
        this.noteContent.addEventListener('input', autoSave);
    }

    async loadNotes() {
        try {
            this.showLoading(true);
            const response = await fetch('/api/notes');
            this.notes = await response.json();
            this.renderNotesList();
        } catch (error) {
            console.error('Error loading notes:', error);
            this.showError('Failed to load notes');
        } finally {
            this.showLoading(false);
        }
    }

    renderNotesList(filteredNotes = null) {
        const notesToRender = filteredNotes || this.notes;
        
        if (notesToRender.length === 0) {
            this.notesList.innerHTML = '<div class="empty-notes">No notes found</div>';
            return;
        }

        this.notesList.innerHTML = notesToRender
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .map(note => `
                <div class="note-item ${this.currentNote?.id === note.id ? 'active' : ''}" 
                     data-id="${note.id}">
                    <h3>${this.escapeHtml(note.title)}</h3>
                    <p>${this.escapeHtml(note.content.substring(0, 100))}${note.content.length > 100 ? '...' : ''}</p>
                    <div class="note-date">${this.formatDate(note.updatedAt)}</div>
                </div>
            `).join('');

        // Add click events to note items
        this.notesList.querySelectorAll('.note-item').forEach(item => {
            item.addEventListener('click', () => {
                const noteId = item.dataset.id;
                this.selectNote(noteId);
            });
        });
    }

    searchNotes(query) {
        if (!query.trim()) {
            this.renderNotesList();
            return;
        }

        const filtered = this.notes.filter(note => 
            note.title.toLowerCase().includes(query.toLowerCase()) ||
            note.content.toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderNotesList(filtered);
    }

    selectNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;

        this.currentNote = note;
        this.isEditing = true;
        this.showNoteEditor();
        this.populateEditor(note);
        this.renderNotesList(); // Re-render to update active state
    }

    createNewNote() {
        this.currentNote = null;
        this.isEditing = true;
        this.showNoteEditor();
        this.clearEditor();
        this.noteTitle.focus();
    }

    showNoteEditor() {
        this.emptyState.style.display = 'none';
        this.noteForm.style.display = 'flex';
    }

    hideNoteEditor() {
        this.emptyState.style.display = 'flex';
        this.noteForm.style.display = 'none';
        this.isEditing = false;
        this.currentNote = null;
    }

    populateEditor(note) {
        this.noteTitle.value = note.title;
        this.noteContent.value = note.content;
        this.updateNoteMeta(note);
        this.deleteBtn.style.display = 'inline-block';
    }

    clearEditor() {
        this.noteTitle.value = '';
        this.noteContent.value = '';
        this.noteMeta.textContent = '';
        this.deleteBtn.style.display = 'none';
    }

    updateNoteMeta(note) {
        const created = this.formatDate(note.createdAt);
        const updated = this.formatDate(note.updatedAt);
        this.noteMeta.textContent = `Created: ${created} | Last updated: ${updated}`;
    }

    async saveNote(silent = false) {
        const title = this.noteTitle.value.trim();
        const content = this.noteContent.value.trim();

        if (!title || !content) {
            if (!silent) this.showError('Title and content are required');
            return;
        }

        try {
            if (!silent) this.showLoading(true);

            let response;
            if (this.currentNote) {
                // Update existing note
                response = await fetch(`/api/notes/${this.currentNote.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, content })
                });
            } else {
                // Create new note
                response = await fetch('/api/notes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, content })
                });
            }

            if (!response.ok) {
                throw new Error('Failed to save note');
            }

            const savedNote = await response.json();
            
            if (this.currentNote) {
                // Update existing note in array
                const index = this.notes.findIndex(n => n.id === this.currentNote.id);
                this.notes[index] = savedNote;
            } else {
                // Add new note to array
                this.notes.push(savedNote);
            }

            this.currentNote = savedNote;
            this.renderNotesList();
            this.updateNoteMeta(savedNote);
            this.deleteBtn.style.display = 'inline-block';

            if (!silent) this.showSuccess('Note saved successfully');
        } catch (error) {
            console.error('Error saving note:', error);
            if (!silent) this.showError('Failed to save note');
        } finally {
            if (!silent) this.showLoading(false);
        }
    }

    async deleteNote() {
        if (!this.currentNote) return;

        if (!confirm('Are you sure you want to delete this note?')) return;

        try {
            this.showLoading(true);
            
            const response = await fetch(`/api/notes/${this.currentNote.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete note');
            }

            // Remove note from array
            this.notes = this.notes.filter(n => n.id !== this.currentNote.id);
            this.renderNotesList();
            this.hideNoteEditor();
            this.showSuccess('Note deleted successfully');
        } catch (error) {
            console.error('Error deleting note:', error);
            this.showError('Failed to delete note');
        } finally {
            this.showLoading(false);
        }
    }

    cancelEdit() {
        if (this.currentNote) {
            this.populateEditor(this.currentNote);
        } else {
            this.hideNoteEditor();
        }
    }

    // Utility methods
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading(show) {
        this.loadingIndicator.style.display = show ? 'flex' : 'none';
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 1001;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .empty-notes {
        padding: 2rem;
        text-align: center;
        color: #7f8c8d;
        font-style: italic;
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NotesApp();
});
