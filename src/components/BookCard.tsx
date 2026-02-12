import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, CheckCircle } from 'lucide-react';
import { Book } from '../types';

interface BookCardProps {
    book: Book;
    onDelete: (id: string) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onDelete }) => {

    // Generate a consistent pastel background based on book ID
    const getCardBackground = (id: string) => {
        const colors = [
            '#e8e8e1', // Light Grey (Mockup-ish)
            '#dcfce7', // Green tint
            '#fae8ff', // Pink tint
            '#e0e7ff', // Indigo tint
            '#ffedd5', // Orange tint
            '#ecfccb', // Lime tint
        ];
        const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        return colors[index];
    };

    const bgColor = getCardBackground(book.id || 'default');

    // Calculate Progress
    const progressPercentage = book.pages > 0 ? Math.round(((book.currentPage || 0) / book.pages) * 100) : 0;

    return (
        <div className="modern-book-card group">
            <Link to={`/edit/${book.id}`} className="card-link-wrapper">
                {/* Upper Colored Section */}
                <div className="card-header" style={{ backgroundColor: bgColor }}>
                    <div className="status-pill">
                        {book.status}
                    </div>
                    {book.rating && book.rating > 0 && (
                        <div className="rating-pill">
                            <span className="star">★</span> {book.rating}
                        </div>
                    )}

                    <div className="book-cover-container">
                        {book.coverImage ? (
                            <img src={book.coverImage} alt={book.title} className="book-cover-img" />
                        ) : (
                            <div className="book-cover-placeholder">
                                <span className="placeholder-text">{book.title.substring(0, 1)}</span>
                            </div>
                        )}
                        {/* Shadow element for 3D feel */}
                        <div className="cover-shadow"></div>
                    </div>
                </div>

                {/* Lower Info Section */}
                <div className="card-body">
                    <h3 className="book-title" title={book.title}>{book.title}</h3>
                    <p className="book-author">{book.author}</p>

                    {/* Progress / Footer Row */}
                    <div className="card-footer-row">
                        {book.status === 'Reading' ? (
                            <div className="progress-container">
                                <div className="progress-track">
                                    <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
                                </div>
                                <span className="progress-text">{progressPercentage}%</span>
                            </div>
                        ) : book.status === 'Completed' ? (
                            <div className="completed-tag">
                                <CheckCircle size={14} color="#10b981" />
                                <span>Finished {book.completionDate ? new Date(book.completionDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : ''}</span>
                            </div>
                        ) : (
                            <div className="pages-text">
                                {book.pages > 0 ? `${book.pages} PAGES` : 'To Read'}
                            </div>
                        )}
                    </div>
                </div>
            </Link>

            {/* Quick Actions (Appear on Hover) */}
            <div className="quick-actions">
                <button
                    className="action-icon-btn delete"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(book.id);
                    }}
                    title="Delete"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <style>{`
                .modern-book-card {
                    background: #ffffff;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                    transition: all 0.3s ease;
                    position: relative;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .modern-book-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }

                .card-link-wrapper {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    text-decoration: none;
                    color: inherit;
                }

                .card-header {
                    height: 220px;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem;
                }

                /* Status Pill */
                .status-pill {
                    position: absolute;
                    top: 1rem;
                    left: 1rem;
                    background: rgba(255, 255, 255, 0.9);
                    padding: 0.25rem 0.75rem;
                    border-radius: 999px;
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: #1e293b;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    z-index: 10;
                }

                /* Rating Pill */
                .rating-pill {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    padding: 0.25rem 0.6rem;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    z-index: 10;
                }
                .rating-pill .star {
                    color: #fbbf24;
                }

                /* Book Cover */
                .book-cover-container {
                    position: relative;
                    width: 120px;
                    height: 170px;
                    perspective: 1000px;
                    z-index: 5;
                }
                .book-cover-img, .book-cover-placeholder {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 4px 8px 8px 4px; /* Spine effect */
                    box-shadow: -1px 0 0 rgba(255,255,255,0.2) inset, 5px 5px 15px rgba(0,0,0,0.15); /* Soft shadow + Spine highlight */
                    background: #334155;
                    position: relative;
                    z-index: 2;
                }
                .book-cover-placeholder {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #475569 0%, #334155 100%);
                    color: white;
                }
                .placeholder-text {
                    font-size: 2rem;
                    font-family: serif;
                    opacity: 0.5;
                }
                
                /* Fake Shadow below book */
                .cover-shadow {
                    position: absolute;
                    bottom: 0;
                    left: 5%;
                    width: 90%;
                    height: 10px;
                    background: rgba(0,0,0,0.3);
                    filter: blur(8px);
                    z-index: 1;
                    transform: translateY(5px);
                }

                /* Info Body */
                .card-body {
                    padding: 1.25rem;
                    background: white;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .book-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 0.25rem;
                    line-height: 1.3;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .book-author {
                    font-size: 0.85rem;
                    color: #64748b;
                    margin-bottom: 1rem;
                }

                .card-footer-row {
                    margin-top: auto;
                    display: flex;
                    align-items: center;
                    font-size: 0.75rem;
                    color: #94a3b8;
                    font-weight: 500;
                }

                /* Progress Styling */
                .progress-container {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    width: 100%;
                }
                .progress-track {
                    flex: 1;
                    height: 4px;
                    background: #f1f5f9;
                    border-radius: 99px;
                    overflow: hidden;
                }
                .progress-fill {
                    height: 100%;
                    background: #6366f1;
                    border-radius: 99px;
                }
                .progress-text {
                    color: #6366f1;
                    font-weight: 700;
                }
                
                .completed-tag {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    color: #10b981;
                }
                
                .pages-text {
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    font-size: 0.7rem;
                }

                /* Hover Actions */
                .quick-actions {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    opacity: 0;
                    transform: translateY(-5px);
                    transition: all 0.2s;
                    z-index: 20;
                }
                .modern-book-card:hover .quick-actions {
                    opacity: 1;
                    transform: translateY(0);
                }
                .action-icon-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    transition: all 0.2s;
                }
                .action-icon-btn:hover {
                    color: #ef4444;
                    border-color: #ef4444;
                    background: #fef2f2;
                }
            `}</style>
        </div>
    );
};

export default BookCard;
