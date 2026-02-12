import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { Plus, Search, ChevronDown, LayoutGrid, ArrowDownAZ, ArrowUpAZ, ChevronLeft, ChevronRight, Moon } from 'lucide-react';
import BookCard from '../components/BookCard';

const Library: React.FC = () => {
  const { books, deleteBook } = useLibrary();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    language: ''
  });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'title',
    direction: 'asc'
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Derived Lists
  const languages = [...new Set(books.map(b => b.language).filter(Boolean))].sort();

  // Filter & Sort Logic
  const filteredBooks = books
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filters.status ? book.status === filters.status : true;
      const matchesLanguage = filters.language ? book.language === filters.language : true;
      return matchesSearch && matchesStatus && matchesLanguage;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortConfig.key === 'title') {
        comparison = a.title.localeCompare(b.title);
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

  // Pagination Logic
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const currentBooks = filteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSortToggle = () => {
    setSortConfig(prev => ({
      key: 'title',
      direction: prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      deleteBook(id);
    }
  };

  // Stats
  const totalBooks = books.length;
  const completedBooks = books.filter(b => b.status === 'Completed').length;
  const readingBooks = books.filter(b => b.status === 'Reading').length;

  return (
    <div className="library-page">
      <header className="library-header">
        <div>
          <h1 className="page-title">Your Library</h1>
          <p className="page-subtitle">Curate your personal digital sanctuary.</p>
        </div>
        <div className="header-actions">
          <button className="icon-btn theme-toggle">
            <Moon size={20} />
          </button>
          <Link to="/add" className="btn btn-primary add-book-btn">
            <Plus size={18} />
            <span>Add New Book</span>
          </Link>
        </div>
      </header>

      {/* Combined Search & Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-section">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by title, author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="divider"></div>

        <div className="filter-dropdown">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="To Read">To Read</option>
            <option value="Reading">Reading</option>
            <option value="Completed">Completed</option>
          </select>
          <ChevronDown size={14} className="dropdown-icon" />
        </div>

        <div className="divider"></div>

        <div className="filter-dropdown">
          <select
            value={filters.language}
            onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
            className="filter-select"
          >
            <option value="">All Languages</option>
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
          <ChevronDown size={14} className="dropdown-icon" />
        </div>

        <div className="divider"></div>

        <div className="view-controls">
          <button className="icon-btn active" title="Grid View">
            <LayoutGrid size={18} />
          </button>
          <button className="icon-btn" title="Sort A-Z" onClick={handleSortToggle}>
            {sortConfig.direction === 'asc' ? <ArrowDownAZ size={18} /> : <ArrowUpAZ size={18} />}
          </button>
        </div>
      </div>

      {/* Book Grid */}
      <div className="book-grid-container">
        {currentBooks.length === 0 ? (
          <div className="empty-state">
            <p>No books found.</p>
          </div>
        ) : (
          <div className="book-grid">
            {currentBooks.map(book => (
              <BookCard key={book.id} book={book} onDelete={handleDelete} />
            ))}

            {/* Add New Title Placeholder Card */}
            <Link to="/add" className="add-placeholder-card">
              <div className="add-icon-circle">
                <Plus size={24} />
              </div>
              <span>Add New Title</span>
            </Link>
          </div>
        )}
      </div>

      {/* Footer Stats & Pagination */}
      <footer className="library-footer">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-label">TOTAL BOOKS</span>
            <span className="stat-value">{totalBooks}</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-label">COMPLETED</span>
            <span className="stat-value text-green">{completedBooks}</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-label">CURRENT</span>
            <span className="stat-value text-orange">{readingBooks}</span>
          </div>
        </div>

        <div className="pagination">
          <button
            className="page-btn nav"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`page-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="page-btn nav"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </footer>

      <style>{`
                .library-page {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    gap: 2rem;
                    /* font-family: 'DM Sans', sans-serif; -- Assuming inherited font */
                }

                .library-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                }
                .page-title {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #1e293b;
                    margin-bottom: 0.25rem;
                    letter-spacing: -0.03em;
                }
                .page-subtitle {
                    color: #64748b;
                    font-size: 0.95rem;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .theme-toggle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: white;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .theme-toggle:hover {
                    color: #4f46e5;
                    border-color: #4f46e5;
                }
                .add-book-btn {
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.25rem;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4);
                    transition: all 0.2s;
                }
                .add-book-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 8px -1px rgba(99, 102, 241, 0.5);
                }

                /* Search Filter Bar */
                .search-filter-bar {
                    background: white;
                    border-radius: 99px; /* Pill shape */
                    padding: 0.5rem;
                    display: flex;
                    align-items: center;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                    border: 1px solid #e5e7eb;
                }

                .search-section {
                    display: flex;
                    align-items: center;
                    flex: 2;
                    padding-left: 1rem;
                }
                .search-icon {
                    color: #94a3b8;
                    margin-right: 0.5rem;
                }
                .search-input {
                    border: none;
                    outline: none;
                    width: 100%;
                    font-size: 0.95rem;
                    color: #1e293b;
                }
                .search-input::placeholder {
                    color: #cbd5e1;
                }

                .divider {
                    width: 1px;
                    height: 24px;
                    background-color: #e2e8f0;
                    margin: 0 0.5rem;
                }

                .filter-dropdown {
                    display: flex;
                    align-items: center;
                    position: relative;
                    padding: 0 1rem;
                    cursor: pointer;
                }
                .filter-select {
                    appearance: none;
                    border: none;
                    background: transparent;
                    font-size: 0.9rem;
                    color: #64748b;
                    font-weight: 500;
                    cursor: pointer;
                    padding-right: 1.5rem;
                    outline: none;
                }
                .dropdown-icon {
                    position: absolute;
                    right: 0.5rem;
                    color: #94a3b8;
                    pointer-events: none;
                }

                .view-controls {
                    display: flex;
                    gap: 0.5rem;
                    padding-left: 0.5rem;
                    padding-right: 0.5rem;
                }
                .icon-btn {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    color: #94a3b8;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .icon-btn:hover {
                    background: #f1f5f9;
                    color: #475569;
                }
                .icon-btn.active {
                    background: #e0e7ff;
                    color: #4f46e5;
                }

                /* Book Grid */
                .book-grid-container {
                    flex: 1;
                }
                .book-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 2rem;
                }

                .add-placeholder-card {
                    border: 2px dashed #cbd5e1;
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    cursor: pointer;
                    text-decoration: none;
                    transition: all 0.2s;
                    min-height: 340px; /* Match Match BookCard height */
                }
                .add-placeholder-card:hover {
                    border-color: #94a3b8;
                    background-color: #f8fafc;
                    color: #64748b;
                }
                .add-icon-circle {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 0.5rem;
                    color: inherit;
                }

                /* Footer */
                .library-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid #e2e8f0;
                    padding-top: 1.5rem;
                    margin-bottom: 1rem;
                }
                
                .stats-row {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                }
                .stat-item {
                    display: flex;
                    flex-direction: column;
                }
                .stat-label {
                    font-size: 0.65rem;
                    color: #94a3b8;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    margin-bottom: 2px;
                }
                .stat-value {
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: #1e293b;
                    line-height: 1;
                }
                .stat-value.text-green { color: #10b981; }
                .stat-value.text-orange { color: #f59e0b; }

                .stat-divider {
                    width: 1px;
                    height: 24px;
                    background-color: #e2e8f0;
                }

                .pagination {
                    display: flex;
                    gap: 0.5rem;
                }
                .page-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: 1px solid transparent;
                    background: white;
                    color: #64748b;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .page-btn:hover:not(:disabled) {
                    background: #f1f5f9;
                    color: #1e293b;
                }
                .page-btn.active {
                    background: #6366f1;
                    color: white;
                    box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.3);
                }
                .page-btn.nav {
                    background: #f8fafc;
                    border-color: #e2e8f0;
                }
                .page-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .empty-state {
                    text-align: center;
                    padding: 3rem;
                    color: #94a3b8;
                    grid-column: 1 / -1;
                }
            `}</style>
    </div>
  );
};

export default Library;
