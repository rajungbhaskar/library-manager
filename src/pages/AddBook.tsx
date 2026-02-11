import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { Book } from '../types';
import { ArrowLeft, Upload, Settings as SettingsIcon } from 'lucide-react';

const AddBook: React.FC = () => {
    const { addBook, updateBook, books } = useLibrary();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);

    const [formData, setFormData] = useState<Omit<Book, 'id'>>({
        title: '',
        author: '',
        language: '',
        pages: 0,
        publisher: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        publishDate: '',
        publishYearOnly: false,
        coverImage: '',
        price: 0,
        status: 'To Read',
        startDate: '',
        completionDate: '',
        notes: '',
        currentPage: 0,
        rating: 0,
        isGifted: false,
    });

    useEffect(() => {
        if (id) {
            const bookToEdit = books.find(b => b.id === id);
            if (bookToEdit) {
                const { id: _, ...rest } = bookToEdit;
                setFormData(rest);
            }
        }
    }, [id, books]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updates = { ...prev, [name]: (name === 'pages' || name === 'price' || name === 'currentPage' || name === 'rating') ? Number(value) : value };

            // Auto-update logic
            if (name === 'status') {
                if (value === 'Completed') {
                    updates.currentPage = prev.pages;
                    updates.completionDate = new Date().toISOString().split('T')[0];
                } else if (value === 'To Read') {
                    updates.currentPage = 0;
                    updates.startDate = '';
                    updates.completionDate = '';
                } else if (value === 'Reading') {
                    if (!prev.startDate) updates.startDate = new Date().toISOString().split('T')[0];
                }
            }
            return updates;
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.src = reader.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.7 quality
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    setFormData(prev => ({ ...prev, coverImage: compressedDataUrl }));
                };
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (id) {
            updateBook(id, formData);
        } else {
            addBook(formData);
        }
        navigate('/library');
    };

    return (
        <div className="container">
            <header className="page-header">
                <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ marginRight: '1rem' }}>
                    <ArrowLeft size={20} />
                </button>
                <h1>{id ? 'Edit Book' : 'Add New Book'}</h1>
            </header>

            <form onSubmit={handleSubmit} className="card add-book-form">
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Book Title"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="author">Author</label>
                    <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <input
                                type="text"
                                id="author"
                                name="author"
                                value={formData.author}
                                onChange={(e) => {
                                    handleChange(e);
                                    setShowAuthorDropdown(true);
                                }}
                                onFocus={() => setShowAuthorDropdown(true)}
                                onBlur={() => setTimeout(() => setShowAuthorDropdown(false), 200)} // Delay to allow click
                                required
                                placeholder="Select or type Author Name"
                                autoComplete="off"
                            />
                            {showAuthorDropdown && (
                                <ul
                                    className="custom-dropdown"
                                    style={{ zIndex: 1000 }} // Ensure high z-index
                                    onMouseDown={(e) => {
                                        // Prevent input blur when clicking inside the dropdown (e.g. scrollbar)
                                        e.preventDefault();
                                    }}
                                >
                                    {/* Filter existing authors */}
                                    {useLibrary().authors
                                        .filter(a => a.name.toLowerCase().includes(formData.author.toLowerCase()))
                                        .map(author => (
                                            <li
                                                key={author.id}
                                                onMouseDown={() => {
                                                    setFormData(prev => ({ ...prev, author: author.name }));
                                                    setShowAuthorDropdown(false);
                                                }}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                                {author.photo ? (
                                                    <img src={author.photo} alt={author.name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                                        {author.name.charAt(0)}
                                                    </div>
                                                )}
                                                {author.name}
                                            </li>
                                        ))
                                    }
                                    {/* Also show books' authors that might not be in the 'authors' list explicitly */}
                                    {books.map(b => b.author)
                                        .filter(name => !useLibrary().authors.some(a => a.name === name)) // Only those NOT in authors list
                                        .filter((value, index, self) => self.indexOf(value) === index) // Unique
                                        .filter(name => name.toLowerCase().includes(formData.author.toLowerCase()))
                                        .map((authorName, index) => (
                                            <li
                                                key={`book-author-${index}`}
                                                onMouseDown={() => {
                                                    setFormData(prev => ({ ...prev, author: authorName }));
                                                    setShowAuthorDropdown(false);
                                                }}
                                            >
                                                {authorName}
                                            </li>
                                        ))
                                    }
                                    {/* Show "Create new" if typed name doesn't exist exact match */}
                                    {formData.author &&
                                        !useLibrary().authors.some(a => a.name.toLowerCase() === formData.author.toLowerCase()) &&
                                        !books.some(b => b.author.toLowerCase() === formData.author.toLowerCase()) && (
                                            <li className="new-entry" style={{ cursor: 'default' }} onMouseDown={(e) => e.preventDefault()}>
                                                Add "{formData.author}" as new author
                                            </li>
                                        )}
                                </ul>
                            )}
                        </div>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => {
                                navigate('/settings'); // Quick link to manage authors
                            }}
                            title="Manage Authors"
                        >
                            <SettingsIcon size={18} />
                        </button>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                        Type to search existing authors or enter a new name.
                    </p>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="language">Language</label>
                        <input
                            type="text"
                            id="language"
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            required
                            placeholder="e.g. English"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="pages">Pages</label>
                        <input
                            type="number"
                            id="pages"
                            name="pages"
                            value={formData.pages}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="publisher">Publisher</label>
                    <input
                        type="text"
                        id="publisher"
                        name="publisher"
                        value={formData.publisher}
                        onChange={handleChange}
                        required
                        placeholder="Publisher Name"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="purchaseDate">{formData.isGifted ? 'Received Date' : 'Purchase Date'}</label>
                        <input
                            type="date"
                            id="purchaseDate"
                            name="purchaseDate"
                            value={formData.purchaseDate}
                            onChange={handleChange}
                        />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                            <input
                                type="checkbox"
                                name="isGifted"
                                checked={formData.isGifted || false}
                                onChange={(e) => {
                                    const isGifted = e.target.checked;
                                    setFormData(prev => ({
                                        ...prev,
                                        isGifted,
                                        price: isGifted ? 0 : prev.price
                                    }));
                                }}
                            />
                            Gifted (Price: 0)
                        </label>
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xs)' }}>
                            <label htmlFor="publishDate" style={{ marginBottom: 0 }}>Publish Date</label>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="publishYearOnly"
                                    checked={formData.publishYearOnly || false}
                                    onChange={(e) => setFormData(prev => ({ ...prev, publishYearOnly: e.target.checked, publishDate: '' }))}
                                />
                                Year Only
                            </label>
                        </div>
                        {formData.publishYearOnly ? (
                            <input
                                type="number"
                                id="publishDate"
                                name="publishDate"
                                value={formData.publishDate}
                                onChange={handleChange}
                                placeholder="Year (YYYY)"
                                min="1000"
                                max="9999"
                            />
                        ) : (
                            <input
                                type="date"
                                id="publishDate"
                                name="publishDate"
                                value={formData.publishDate}
                                onChange={handleChange}
                            />
                        )}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="price">Price</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            disabled={formData.isGifted}
                            style={{ backgroundColor: formData.isGifted ? 'var(--color-background-muted)' : 'var(--color-background)' }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="status">Reading Status</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="To Read">To Read</option>
                            <option value="Reading">Reading</option>
                            <option value="Completed">Completed</option>
                            <option value="Dropped">Dropped</option>
                        </select>
                    </div>
                </div>

                {/* Progress and Rating Section */}
                {(formData.status === 'Reading' || formData.status === 'Dropped') && (
                    <div className="form-group">
                        <label htmlFor="currentPage">Current Page (of {formData.pages})</label>
                        <input
                            type="number"
                            id="currentPage"
                            name="currentPage"
                            value={formData.currentPage || 0}
                            onChange={handleChange}
                            min="0"
                            max={formData.pages}
                        />
                    </div>
                )}

                {(formData.status === 'Completed' || formData.status === 'Dropped') && (
                    <div className="form-group">
                        <label htmlFor="rating">Rating (1-5)</label>
                        <div className="rating-input">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className={`star-btn ${formData.rating && formData.rating >= star ? 'active' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                                >
                                    ★
                                </button>
                            ))}
                            <input type="hidden" name="rating" value={formData.rating || 0} />
                        </div>
                    </div>
                )}

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="startDate">Started On</label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={formData.startDate || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="completionDate">Finished On</label>
                        <input
                            type="date"
                            id="completionDate"
                            name="completionDate"
                            value={formData.completionDate || ''}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="notes">Notes / Highlights</label>
                    <textarea
                        id="notes"
                        name="notes"
                        rows={4}
                        value={formData.notes || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add your thoughts, quotes, or summary here..."
                        style={{
                            width: '100%',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--color-background)',
                            color: 'var(--color-text)',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                        }}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="coverImage">Cover Image</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '100px',
                            height: '140px',
                            border: '2px dashed var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            backgroundColor: 'var(--color-background)',
                            cursor: 'pointer',
                            position: 'relative'
                        }} onClick={() => document.getElementById('coverImage')?.click()}>
                            {formData.coverImage ? (
                                <img src={formData.coverImage} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                                    <Upload size={24} style={{ color: 'var(--color-text-muted)', marginBottom: '4px' }} />
                                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>Upload</span>
                                </div>
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <input
                                type="file"
                                id="coverImage"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => document.getElementById('coverImage')?.click()}
                            >
                                Choose Image
                            </button>
                            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                Recommended ratio: 2:3. Max size: 2MB.
                            </p>
                            {formData.coverImage && (
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                                    style={{ marginTop: '0.5rem', color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                                >
                                    Remove Image
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-outline" onClick={() => navigate('/library')}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                        {id ? 'Update Book' : 'Save Book'}
                    </button>
                </div>
            </form>

            <style>{`
        .page-header {
          display: flex;
          align-items: center;
          margin-bottom: var(--spacing-lg);
        }
        .add-book-form {
          max-width: 600px;
          margin: 0 auto;
        }
        .form-group {
          margin-bottom: var(--spacing-md);
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-md);
        }
        label {
          display: block;
          margin-bottom: var(--spacing-xs);
          font-weight: 500;
          color: var(--color-text-muted);
        }
        input, select {
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background-color: var(--color-background);
          color: var(--color-text);
          transition: border-color 0.2s;
        }
        input:focus, select:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-md);
          margin-top: var(--spacing-lg);
        }
        .custom-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--color-background);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            max-height: 200px;
            overflow-y: auto;
            z-index: 10;
            list-style: none;
            padding: 0;
            margin: 4px 0 0 0;
        }
        .custom-dropdown::-webkit-scrollbar {
             width: 6px;
        }
        .custom-dropdown::-webkit-scrollbar-thumb {
            background-color: var(--color-border);
            border-radius: 4px;
        }
        .custom-dropdown li {
            padding: 0.5rem 0.75rem;
            cursor: pointer;
            transition: background 0.2s;
        }
        .custom-dropdown li:hover {
            background-color: var(--color-background-hover, #f3f4f6);
        }
        .custom-dropdown li.new-entry {
            border-top: 1px solid var(--color-border);
            color: var(--color-primary);
            font-style: italic;
        }
        
        /* Rating Styles */
        .rating-input {
            display: flex;
            gap: 0.5rem;
        }
        .star-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--color-text-muted);
            cursor: pointer;
            transition: color 0.2s;
            padding: 0;
            line-height: 1;
        }
        .star-btn.active, .star-btn:hover {
            color: #fbbf24; /* Amber-400 */
        }
      `}</style>
        </div>
    );
};

export default AddBook;
