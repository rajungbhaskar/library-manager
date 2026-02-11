import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { Book } from '../types';
import { useSettings } from '../context/SettingsContext';
import { useLibrary } from '../context/LibraryContext';

interface BookCardProps {
    book: Book;
    onDelete: (id: string) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onDelete }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const { settings } = useSettings();
    const { updateBook, authors } = useLibrary();
    const [pageEditMode, setPageEditMode] = useState(false);
    const [tempPage, setTempPage] = useState(book.currentPage || 0);

    const handleStartReading = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateBook(book.id, {
            status: 'Reading',
            startDate: new Date().toISOString().split('T')[0]
        });
    };

    const handleMarkCompleted = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateBook(book.id, {
            status: 'Completed',
            completionDate: new Date().toISOString().split('T')[0]
        });
    };

    const getDuration = () => {
        if (!book.startDate || !book.completionDate) return null;
        const start = new Date(book.startDate);
        const end = new Date(book.completionDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays === 0 ? 1 : diffDays; // Minimum 1 day if completed same day
    };

    const handleRating = (r: number) => {
        updateBook(book.id, { rating: r });
    };

    const handlePageUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        let newPage = tempPage;
        if (newPage > book.pages) newPage = book.pages;
        if (newPage < 0) newPage = 0;

        updateBook(book.id, { currentPage: newPage });
        setPageEditMode(false);

        // Auto-complete if finished
        if (newPage === book.pages && book.status === 'Reading') {
            if (confirm('Mark as Completed?')) {
                updateBook(book.id, {
                    status: 'Completed',
                    currentPage: newPage,
                    completionDate: new Date().toISOString().split('T')[0]
                });
            }
        }
    };

    const progressPercentage = book.pages > 0 ? Math.round(((book.currentPage || 0) / book.pages) * 100) : 0;

    const handleFlip = (e: React.MouseEvent) => {
        // Prevent flip if clicking on actions (edit/delete)
        if ((e.target as HTMLElement).closest('.book-actions')) {
            return;
        }
        setIsFlipped(!isFlipped);
    };

    return (
        <div className="book-card-container" onClick={handleFlip}>
            <div className={`book-card-inner ${isFlipped ? 'flipped' : ''}`}>

                {/* Front Face */}
                <div className="book-card-face book-card-front">
                    {/* Status Ribbon - Top Left */}
                    <div className="status-ribbon-wrapper">
                        <div className="status-ribbon" style={{
                            backgroundColor:
                                book.status === 'Completed' ? '#10b981' : // Green
                                    book.status === 'Reading' ? '#f97316' :   // Orange
                                        '#ef4444'                                 // Red (Default/Dropped)
                        }}>
                            {book.status}
                        </div>
                    </div>

                    {/* Rating - Top Right (Front) */}
                    {(book.status === 'Completed' || book.status === 'Dropped') && (
                        <div className="front-rating-wrapper" onClick={(e) => e.stopPropagation()}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <span
                                    key={star}
                                    className={`star-small ${book.rating && book.rating >= star ? 'filled' : ''}`}
                                    onClick={() => handleRating(star)}
                                >★</span>
                            ))}
                        </div>
                    )}

                    {book.coverImage ? (
                        <div className="book-cover-large">
                            <img src={book.coverImage} alt={book.title} />
                        </div>
                    ) : (
                        <div className="book-cover-placeholder">
                            <div className="placeholder-text">{book.title.substring(0, 2).toUpperCase()}</div>
                        </div>
                    )}

                    {/* Notes Overlay */}
                    {book.notes && (
                        <div className="front-notes-overlay">
                            <div className="front-notes-content">
                                <span className="front-note-text">{book.notes}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Back Face */}
                <div className="book-card-face book-card-back">
                    <div className="book-header-back">
                        <h3 className="book-title-back">{book.title}</h3>
                        <div className="book-author-container">
                            {authors.find(a => a.name === book.author)?.photo && (
                                <img
                                    src={authors.find(a => a.name === book.author)?.photo}
                                    alt={book.author}
                                    className="author-avatar-small"
                                />
                            )}
                            <p className="book-author-back">by {book.author}</p>
                        </div>

                        <div className="book-actions-top">
                            <Link to={`/edit/${book.id}`} className="icon-btn-small edit-btn" title="Edit">
                                <Edit size={16} />
                            </Link>
                            <button className="icon-btn-small delete-btn" title="Delete" onClick={(e) => {
                                e.stopPropagation();
                                onDelete(book.id);
                            }}>
                                <Trash2 size={16} />
                            </button>
                        </div>

                        {/* Rating Display removed from here */}

                        {/* Progress Bar for Reading */}
                        {book.status === 'Reading' && (
                            <div className="progress-section" onClick={(e) => e.stopPropagation()}>
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
                                </div>
                                <div className="progress-text">
                                    {pageEditMode ? (
                                        <form onSubmit={handlePageUpdate} className="page-edit-form">
                                            <input
                                                type="number"
                                                value={tempPage}
                                                onChange={(e) => setTempPage(Number(e.target.value))}
                                                autoFocus
                                                onBlur={handlePageUpdate}
                                                min="0"
                                                max={book.pages}
                                            />
                                            <span>/ {book.pages}</span>
                                        </form>
                                    ) : (
                                        <span onClick={() => { setTempPage(book.currentPage || 0); setPageEditMode(true); }} className="clickable-page">
                                            {book.currentPage || 0} / {book.pages} ({progressPercentage}%)
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {book.status === 'To Read' && (
                            <button className="action-btn start-reading-btn" onClick={handleStartReading}>
                                <BookOpen size={14} /> Start Reading
                            </button>
                        )}
                        {book.status === 'Reading' && (
                            <button className="action-btn mark-completed-btn" onClick={handleMarkCompleted}>
                                <CheckCircle size={14} /> Mark Completed
                            </button>
                        )}
                    </div>

                    <div className="book-details-grid">
                        <div className="detail-item">
                            <span className="label">Language</span>
                            <span className="value">{book.language || '-'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Pages</span>
                            <span className="value">{book.pages || '-'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Publisher</span>
                            <span className="value">{book.publisher || '-'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Price</span>
                            <span className="value">
                                {book.isGifted ? (
                                    <span style={{
                                        backgroundColor: 'var(--color-primary)',
                                        color: 'white',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '0.6rem',
                                        fontWeight: 'bold'
                                    }}>GIFTED</span>
                                ) : (
                                    book.price ? `${settings.currency}${book.price}` : '-'
                                )}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Published</span>
                            <span className="value">{book.publishYearOnly ? book.publishDate : (book.publishDate ? new Date(book.publishDate).toLocaleDateString() : '-')}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">{book.isGifted ? 'Received' : 'Purchased'}</span>
                            <span className="value">{book.purchaseDate ? new Date(book.purchaseDate).toLocaleDateString() : '-'}</span>
                        </div>
                        {getDuration() && (
                            <div className="detail-item">
                                <span className="label"><Clock size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '2px' }} /> Duration</span>
                                <span className="value">{getDuration()} days</span>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            <style>{`
        .book-card-container {
          perspective: 1500px;
          height: 340px; /* Reduced by ~30% from 480px */
          cursor: pointer;
          position: relative; /* Ensure z-index works */
          z-index: 1;
        }

        /* Raise the clicked card so it opens ABOVE others */
        .book-card-container:has(.flipped) {
            z-index: 100;
        }

        .book-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.6s;
          transform-style: preserve-3d;
          box-shadow: var(--shadow-md);
          border-radius: var(--radius-lg);
        }

        .book-card-inner.flipped {
          transform: rotateY(180deg);
        }

                /* 
                   Adjust Back Face rotation to match the new flip direction.
                   If we rotate Inner by -180Y, the Back Face (which is usually at 180Y) needs to be at...
                   Initial: Front (0), Back (180).
                   Rotated -180: Front (-180, hidden), Back (0, visible).
                   So standard Back rotation of 180deg is correct.
                */

                .book-card-face {
                    position: absolute;
                width: 100%;
                height: 100%;
                -webkit-backface-visibility: hidden;
                backface-visibility: hidden;
                border-radius: var(--radius-lg);
                background-color: var(--color-background);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                background: #fff; /* Ensure default white background */
                border: 1px solid var(--color-border);
        }

                /* Front Face Styles */
                .book-card-front {
                    justify-content: center; /* Center placeholder */
                align-items: center;
                background-color: #f0f0f0; /* Default background */
        }

                .book-cover-large {
                    width: 100%;
                height: 100%; /* Full height */
                overflow: hidden;
                background-color: #fff;
        }

                .book-cover-large img {
                    width: 100%;
                height: 100%;
                object-fit: cover; /* Cover to fill without whitespace now that it's just image */
        }

                .book-cover-placeholder {
                    width: 100%;
                height: 100%;
                background-color: #e2e8f0;
                display: flex;
                align-items: center;
                justify-content: center;
        }

                .placeholder-text {
                    font-size: 3rem;
                    color: #94a3b8;
                    font-weight: bold;
                }

                .front-notes-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    background: transparent;
                    padding: 0 0.5rem 0.5rem 0.5rem;
                    display: flex;
                    align-items: flex-end;
                    justify-content: flex-start; /* Left-centric box alignment */
                    pointer-events: none; /* Allow clicks through empty space */
                }

                .front-notes-content {
                    background-color: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(4px);
                    padding: 0.4rem 0.5rem; /* Slightly reduced vertical padding */
                    border-radius: 6px;
                    display: flex;
                    align-items: flex-start;
                    justify-content: flex-start; /* Ensure left alignment of content */
                    text-align: left; /* Explicit text alignment */
                    font-size: 0.65rem; /* Reduced font size */
                    line-height: 1.2;   /* Compact line height */
                    max-height: 4.5em;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    width: auto; /* Allow box to shrink to content if short, or grow to max-width */
                    max-width: 100%; /* Ensure it doesn't overflow */
                    color: white;
                    pointer-events: auto; /* Re-enable clicks on the note itself */
                    margin-bottom: 4px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                }

                .status-ribbon-wrapper {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 85px;
                    height: 85px;
                    overflow: hidden;
                    pointer-events: none;
                }

                .status-ribbon {
                    position: absolute;
                    top: 15px;
                    left: -28px;
                    width: 120px;
                    /* Base color provided inline */
                    color: white;
                    text-align: center;
                    font-size: 0.65rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    padding: 6px 0; /* Slightly taller for fabric feel */
                    transform: rotate(-45deg);
                    /* Silk Sheen Effect */
                    background-image: linear-gradient(
                        to bottom,
                        rgba(255, 255, 255, 0) 0%,
                        rgba(255, 255, 255, 0.2) 40%,
                        rgba(255, 255, 255, 0) 45%,
                        rgba(0, 0, 0, 0.1) 100%
                    );
                    box-shadow: 0 4px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3);
                    text-shadow: 0 1px 2px rgba(0,0,0,0.4);
                }

                .front-note-text {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.8);
                    white-space: pre-wrap; /* Preserve line breaks */
                }

                .front-rating-wrapper {
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    z-index: 10;
                    display: flex;
                    gap: 1px;
                    background: rgba(0, 0, 0, 0.75);
                    padding: 4px 6px;
                    border-radius: 12px;
                    backdrop-filter: blur(2px);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }

                .star-small {
                    color: rgba(255, 255, 255, 0.4); 
                    cursor: pointer;
                    font-size: 0.9rem;
                    line-height: 1;
                    transition: all 0.2s;
                }

                .star-small.filled {
                    color: #fbbf24; /* Amber-400 */
                    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                }

                .star-small:hover {
                    transform: scale(1.2);
                    color: #fff;
                }             /* Back Face Styles */
                .book-card-back {
                    transform: rotateY(180deg);
                padding: var(--spacing-md);
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
        }

                .book-header-back {
                    text-align: left;
                margin-bottom: 0.5rem;
                border-bottom: 1px solid var(--color-border);
                padding-bottom: 0.5rem;
        }

                .book-title-back {
                    font-size: 1.1rem;
                font-weight: bold;
                margin: 0.25rem 0;
                color: var(--color-text);
                line-height: 1.2;
        }

                .book-author-back {
                    font-size: 0.75rem;
                    color: var(--color-text-muted);
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .book-author-container {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    justify-content: flex-start;
                    margin-bottom: 0.5rem;
                }

                .author-avatar-small {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 1px solid var(--color-border);
                }

                .book-details-grid {
                    display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 0.25rem;
                text-align: left;
                font-size: 0.75rem;
        }

                .detail-item {
                    display: flex;
                flex-direction: column;
        }

                .detail-item .label {
                    font-size: 0.65rem;
                color: var(--color-text-muted);
                text-transform: uppercase;
                font-weight: 600;
        }

                .detail-item .value {
                    color: var(--color-text);
        }

                .status-badge {
                    display: inline-block;
                font-size: 0.65rem;
                padding: 1px 6px;
                border-radius: 9999px;
                font-weight: 600;
        }

                .book-actions-top {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            display: flex;
            gap: 0.25rem;
            z-index: 10;
        }
        
        .icon-btn-small {
            background: none;
            border: none;
            padding: 4px;
            border-radius: 4px;
            color: var(--color-text-muted);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        
        .icon-btn-small:hover {
            background-color: rgba(0,0,0,0.05);
            color: var(--color-text);
        }
        
        .icon-btn-small.delete-btn:hover {
            color: var(--color-danger);
            background-color: rgba(239, 68, 68, 0.1);
        }



        .action-btn {
            width: 100%;
            margin-top: 0.5rem;
            padding: 0.4rem;
            border: none;
            border-radius: var(--radius-md);
            font-size: 0.75rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.4rem;
            cursor: pointer;
            transition: background 0.2s;
        }

        .start-reading-btn {
            background-color: var(--color-primary);
            color: white;
        }
        .start-reading-btn:hover {
             background-color: var(--color-primary-dark, #4f46e5); /* Fallback */
             filter: brightness(0.9);
        }

        .mark-completed-btn {
             background-color: var(--color-success);
             color: white;
        }
        .mark-completed-btn:hover {
             filter: brightness(0.9);
        }

        .full-width {
            grid-column: 1 / -1;
        }
        
        
        .notes-preview .value {
            font-style: italic;
            color: var(--color-text-muted);
        }

        /* Rating & Progress Styles */
        .rating-display {
            margin: 0.25rem 0;
            font-size: 1.25rem;
            color: #d1d5db; /* Gray-300 */
            line-height: 1;
        }
        .rating-display .star {
            cursor: pointer;
            transition: color 0.1s;
        }
        .rating-display .star.filled {
            color: #fbbf24; /* Amber-400 */
        }
        
        .progress-section {
            width: 100%;
            margin: 0.5rem 0;
        }
        .progress-bar-bg {
            width: 100%;
            height: 6px;
            background-color: #e5e7eb;
            border-radius: 9999px;
            overflow: hidden;
            margin-bottom: 4px;
        }
        .progress-bar-fill {
            height: 100%;
            background-color: var(--color-primary);
            border-radius: 9999px;
            transition: width 0.3s ease;
        }
        .progress-text {
            font-size: 0.7rem;
            color: var(--color-text-muted);
            font-weight: 500;
        }
        .clickable-page {
            cursor: pointer;
            border-bottom: 1px dashed var(--color-text-muted);
        }
        .clickable-page:hover {
            color: var(--color-primary);
            border-bottom-color: var(--color-primary);
        }
        .page-edit-form {
            display: inline-flex;
            align-items: center;
            gap: 2px;
        }
        .page-edit-form input {
            width: 50px;
            padding: 0 2px;
            font-size: 0.7rem;
            text-align: right;
            border: 1px solid var(--color-primary);
            border-radius: 2px;
        }
      `}</style>
        </div>
    );
};

export default BookCard;
