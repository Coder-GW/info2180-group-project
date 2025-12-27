document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('notesList')) return;
    
    initNotes();
});

function initNotes() {
    const contactId = new URLSearchParams(window.location.search).get('id');

    if (!contactId) {
        console.error('No contact ID found for notes');
        return;
    }

    loadNotes(contactId);
    
    const addNoteBtn = document.getElementById('addNoteBtn');
    const noteTextarea = document.getElementById('noteTextarea');

    if (addNoteBtn) {
        addNoteBtn.addEventListener('click', () => addNewNote(contactId));
    }

    if (noteTextarea) {
        noteTextarea.addEventListener('keydown', e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                addNewNote(contactId);
            }
        });
    }
}

async function loadNotes(contactId) {
    try {
        const notesList = document.getElementById('notesList');
        if (!notesList) return;
        
        // Show loading state
        notesList.innerHTML = '<div class="loading-notes">Loading notes...</div>';
        
        // Fetch notes
        const data = await window.App.ajaxRequest(`api/notes.php?contact_id=${contactId}`);
        
        // Clear loading state
        notesList.innerHTML = '';
        
        // Check for notes
        if (!data.notes || data.notes.length === 0) {
            notesList.innerHTML = '<div class="no-notes">No notes yet. Add the first note!</div>';
            return;
        }
        
        // Display
        data.notes.forEach(note => {
            const noteElement = createNoteElement(note);
            notesList.appendChild(noteElement);
        });
        
    } catch (error) {
        console.error('Error loading notes:', error);
        const notesList = document.getElementById('notesList');
        if (notesList) {
            notesList.innerHTML = '<div class="error-loading">Error loading notes</div>';
        }
    }
}

function createNoteElement(note) {
    const noteDiv = document.createElement('div');
    noteDiv.className = 'note-item';
    
    const noteHeader = document.createElement('div');
    noteHeader.className = 'note-header';
    noteHeader.innerHTML = `
        <strong>${note.user_name || 'Unknown User'}</strong>
        <span class="note-date">${window.App.formatDate(note.created_at)}</span>
    `;
    
    const noteContent = document.createElement('div');
    noteContent.className = 'note-content';
    noteContent.textContent = note.comment;
    
    noteDiv.append(noteHeader, noteContent);
    return noteDiv;
}

async function addNewNote(contactId) {
    const noteTextarea = document.getElementById('noteTextarea');
    const addNoteBtn = document.getElementById('addNoteBtn');
    const notesList = document.getElementById('notesList');

    if (!noteTextarea || !addNoteBtn) return;

    try {
        const comment = noteTextarea.value.trim();

        if (!comment) {
            window.App.showNotification('Please enter a note', 'error');
            return;
        }

        if (comment.length > 1000) {
            window.App.showNotification(
                'Note is too long (max 1000 characters)',
                'error'
            );
            return;
        }

        addNoteBtn.textContent = 'Adding...';
        addNoteBtn.disabled = true;

        const response = await window.App.ajaxRequest(
            'api/add-note.php',
            'POST',
            {
                contact_id: contactId,
                comment: comment
            }
        );

        if (!response.success) {
            throw new Error(response.message || 'Failed to add note');
        }

        noteTextarea.value = '';

        if (notesList) {
            const newNoteElement = createNoteElement(response.note);

            const noNotesElement = notesList.querySelector('.no-notes');
            if (noNotesElement) {
                noNotesElement.remove();
            }

            notesList.insertBefore(newNoteElement, notesList.firstChild);
        }

        window.App.showNotification('Note added successfully!', 'success');
    } catch (error) {
        console.error('Error adding note:', error);
        window.App.showNotification(`Error: ${error.message}`, 'error');
    } finally {
        addNoteBtn.textContent = 'Add Note';
        addNoteBtn.disabled = false;
    }
}