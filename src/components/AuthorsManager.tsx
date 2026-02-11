import React, { useState, useRef } from 'react';
import { useLibrary, AuthorSortOrder } from '../context/LibraryContext';
import { Plus, Edit2, Trash2, X, Save, Upload, User, ArrowDownAZ, ArrowUpAZ, List } from 'lucide-react';

const AuthorsManager: React.FC = () => {
    const { authors, addAuthor, updateAuthor, deleteAuthor, authorSortOrder, setAuthorSortOrder } = useLibrary();
    const [newAuthorName, setNewAuthorName] = useState('');
    const [newAuthorPhoto, setNewAuthorPhoto] = useState<string | undefined>(undefined);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [editingPhoto, setEditingPhoto] = useState<string | undefined>(undefined);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    // authors is now already sorted from context
    const sortedAuthors = authors;

    const toggleSort = () => {
        setAuthorSortOrder(
            authorSortOrder === 'none' ? 'asc' :
                authorSortOrder === 'asc' ? 'desc' : 'none'
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setPhoto: (photo: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newAuthorName.trim()) {
            addAuthor(newAuthorName.trim(), newAuthorPhoto);
            setNewAuthorName('');
            setNewAuthorPhoto(undefined);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const startEditing = (id: string, name: string, photo?: string) => {
        setEditingId(id);
        setEditingName(name);
        setEditingPhoto(photo);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingName('');
        setEditingPhoto(undefined);
    };

    const saveEditing = (id: string) => {
        if (editingName.trim()) {
            updateAuthor(id, editingName.trim(), editingPhoto);
            setEditingId(null);
            setEditingName('');
            setEditingPhoto(undefined);
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this author?')) {
            deleteAuthor(id);
        }
    };

    return (
        <div className="authors-manager">
            <div className="authors-header">
                <h3>Manage Authors</h3>
                <button onClick={toggleSort} className="icon-btn sort-btn" title="Sort Authors">
                    {authorSortOrder === 'none' && <List size={18} />}
                    {authorSortOrder === 'asc' && <ArrowDownAZ size={18} />}
                    {authorSortOrder === 'desc' && <ArrowUpAZ size={18} />}
                </button>
            </div>

            <form onSubmit={handleAdd} className="add-author-form">
                <div className="input-group">
                    <input
                        type="text"
                        value={newAuthorName}
                        onChange={(e) => setNewAuthorName(e.target.value)}
                        placeholder="New Author Name"
                        className="author-input"
                    />
                    <div className="file-upload-wrapper">
                        <label htmlFor="new-author-photo" className="file-upload-label" title="Upload Photo">
                            {newAuthorPhoto ? (
                                <img src={newAuthorPhoto} alt="Preview" className="photo-preview-small" />
                            ) : (
                                <Upload size={18} />
                            )}
                        </label>
                        <input
                            id="new-author-photo"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, setNewAuthorPhoto)}
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={!newAuthorName.trim()}>
                    <Plus size={18} /> Add
                </button>
            </form>

            <div className="authors-list">
                {sortedAuthors.length === 0 ? (
                    <p className="empty-text">No authors added yet.</p>
                ) : (
                    sortedAuthors.map(author => (
                        <div key={author.id} className="author-item">
                            {editingId === author.id ? (
                                <div className="edit-mode">
                                    <div className="file-upload-wrapper">
                                        <label htmlFor={`edit-photo-${author.id}`} className="file-upload-label" title="Change Photo">
                                            {editingPhoto ? (
                                                <img src={editingPhoto} alt="Preview" className="photo-preview-small" />
                                            ) : (
                                                <Upload size={16} />
                                            )}
                                        </label>
                                        <input
                                            id={`edit-photo-${author.id}`}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, setEditingPhoto)}
                                            ref={editFileInputRef}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        className="edit-input"
                                        autoFocus
                                    />
                                    <div className="actions">
                                        <button onClick={() => saveEditing(author.id)} className="icon-btn save-btn">
                                            <Save size={16} />
                                        </button>
                                        <button onClick={cancelEditing} className="icon-btn cancel-btn">
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="author-info">
                                        {author.photo ? (
                                            <img src={author.photo} alt={author.name} className="author-avatar" />
                                        ) : (
                                            <div className="author-avatar-placeholder">
                                                <User size={16} />
                                            </div>
                                        )}
                                        <span className="author-name">{author.name}</span>
                                    </div>
                                    <div className="actions">
                                        <button onClick={() => startEditing(author.id, author.name, author.photo)} className="icon-btn edit-btn">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(author.id)} className="icon-btn delete-btn">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            <style>{`
                .authors-manager {
                    margin-top: 2rem;
                    background: var(--color-background);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                }
                .authors-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .authors-header h3 {
                    margin-bottom: 0;
                    font-size: 1.25rem;
                    font-weight: 600;
                }
                .add-author-form {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                    align-items: center;
                }
                .input-group {
                    display: flex;
                    flex: 1;
                    gap: 0.5rem;
                    align-items: center;
                }
                .author-input {
                    flex: 1;
                    padding: 0.5rem;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                }
                .file-upload-wrapper {
                    display: flex;
                    align-items: center;
                }
                .file-upload-label {
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    border: 1px dashed var(--color-border);
                    border-radius: 50%;
                    color: var(--color-text-muted);
                    overflow: hidden;
                    transition: all 0.2s;
                }
                .file-upload-label:hover {
                    border-color: var(--color-primary);
                    color: var(--color-primary);
                    background: var(--color-background-hover);
                }
                .photo-preview-small {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .authors-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    max-height: 300px;
                    overflow-y: auto;
                }
                .author-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem;
                    background: #f9fafb;
                    border-radius: var(--radius-md);
                    border: 1px solid transparent;
                }
                .author-item:hover {
                    border-color: var(--color-border);
                }
                .author-info {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .author-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 1px solid var(--color-border);
                }
                .author-avatar-placeholder {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--color-surface);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-text-muted);
                    border: 1px solid var(--color-border);
                }
                .author-name {
                    font-weight: 500;
                }
                .actions {
                    display: flex;
                    gap: 0.5rem;
                }
                .edit-mode {
                    display: flex;
                    gap: 0.5rem;
                    width: 100%;
                    align-items: center;
                }
                .edit-input {
                    flex: 1;
                    padding: 0.25rem 0.5rem;
                    border: 1px solid var(--color-primary);
                    border-radius: var(--radius-sm);
                }
                .save-btn { color: var(--color-success); }
                .cancel-btn { color: var(--color-text-muted); }
                .sort-btn { color: var(--color-text-muted); }
                .sort-btn:hover { color: var(--color-primary); background: var(--color-background-hover); }
                .empty-text { color: var(--color-text-muted); font-style: italic; }
            `}</style>
        </div>
    );
};

export default AuthorsManager;
