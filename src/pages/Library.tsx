import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { BookOpen, Plus, Search, Trash2 } from 'lucide-react';
import BookCard from '../components/BookCard';
import FilterBar from '../components/FilterBar';

import ShelfIcon from '../components/ShelfIcon';

const Library: React.FC = () => {
  const { books, deleteBook } = useLibrary();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter States
  const [filters, setFilters] = useState({
    author: '',
    status: '',
    language: ''
  });

  // Sort State
  const [sortConfig, setSortConfig] = useState<{
    key: 'purchaseDate' | 'price' | 'title';
    direction: 'asc' | 'desc';
  }>({
    key: 'title',
    direction: 'asc'
  });

  // Derived Lists for Dropdowns
  const authors = [...new Set(books.map(b => b.author))].sort();
  const languages = [...new Set(books.map(b => b.language).filter(Boolean))].sort();

  // Filter & Sort Logic
  const filteredBooks = books
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAuthor = filters.author ? book.author === filters.author : true;
      const matchesStatus = filters.status ? book.status === filters.status : true;
      const matchesLanguage = filters.language ? book.language === filters.language : true;

      return matchesSearch && matchesAuthor && matchesStatus && matchesLanguage;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.key) {
        case 'purchaseDate':
          comparison = (a.purchaseDate || '').localeCompare(b.purchaseDate || '');
          break;
        case 'price':
          comparison = (a.price || 0) - (b.price || 0);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

  const handleFilterChange = (key: 'author' | 'status' | 'language', value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (key: 'purchaseDate' | 'price' | 'title') => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      deleteBook(id);
    }
  };

  return (
    <div>
      <header className="library-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '2rem', fontWeight: '900', color: 'var(--color-text)', letterSpacing: '1px', lineHeight: 1, marginBottom: '0.5rem' }}>
            <span>My-s</span>
            <ShelfIcon size="1.2em" />
            <span>elf</span>
          </div>
          <p style={{ color: 'var(--color-text-muted)' }}>Where your books belong</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/add" className="btn btn-primary">
            <Plus size={20} style={{ marginRight: '0.5rem' }} /> Add Book
          </Link>
        </div>
      </header>

      <>
        <div className="search-container">
          <div className={`search-wrapper ${searchTerm ? 'active' : ''}`}>
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search your library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <Trash2 size={16} style={{ transform: 'rotate(45deg)' }} /> {/* Using Trash as X for now or add X icon */}
              </button>
            )}
          </div>
        </div>

        <FilterBar
          authors={authors}
          languages={languages}
          filters={filters}
          onFilterChange={handleFilterChange}
          sortConfig={sortConfig}
          onSortChange={handleSortChange}
        />

        {filteredBooks.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} color="var(--color-text-muted)" />
            <p>No books found matching your criteria.</p>
            {(searchTerm || filters.author || filters.status || filters.language) && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ author: '', status: '', language: '' });
                }}
                style={{ marginTop: '1rem' }}
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="book-grid">
            {filteredBooks.map(book => (
              <BookCard key={book.id} book={book} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </>

      <style>{`
        .library-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
        }
        
        /* New Search Styles */
        .search-container {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .search-wrapper {
          position: relative;
          width: 100%;
          max-width: 600px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 9999px; /* Pill shape */
          padding: 0.75rem 1rem 0.75rem 3rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
        }

        .search-wrapper:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .search-wrapper:focus-within {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 
            0 10px 15px -3px rgba(0, 0, 0, 0.1), 
            0 4px 6px -2px rgba(0, 0, 0, 0.05),
            0 0 0 2px var(--color-primary); /* Focus Ring */
          background: rgba(255, 255, 255, 0.95);
        }

        .search-icon {
          position: absolute;
          left: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted);
          pointer-events: none;
          transition: color 0.2s;
        }

        .search-wrapper:focus-within .search-icon {
          color: var(--color-primary);
        }

        .search-wrapper input {
          width: 100%;
          border: none;
          background: transparent;
          font-size: 1.1rem;
          color: var(--color-text);
          outline: none;
          padding: 0;
          margin: 0;
          height: 100%;
        }

        .search-wrapper input::placeholder {
           color: var(--color-text-muted);
           opacity: 0.7;
        }

        .clear-search-btn {
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
          margin-left: 0.5rem;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .clear-search-btn:hover {
          background-color: rgba(0,0,0,0.05);
          color: var(--color-danger);
        }

        .book-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); /* Adjusted minmax for card width */
          gap: var(--spacing-lg);
        }
        
        .empty-state {
          text-align: center;
          padding: var(--spacing-xl);
          color: var(--color-text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-md);
        }
      `}</style>
    </div>
  );
};

export default Library;
