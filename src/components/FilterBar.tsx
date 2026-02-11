import React from 'react';
import { Filter, SortAsc, SortDesc } from 'lucide-react';

interface FilterBarProps {
    authors: string[];
    languages: string[];
    filters: {
        author: string;
        status: string;
        language: string;
    };
    onFilterChange: (key: 'author' | 'status' | 'language', value: string) => void;
    sortConfig: {
        key: 'purchaseDate' | 'price' | 'title';
        direction: 'asc' | 'desc';
    };
    onSortChange: (key: 'purchaseDate' | 'price' | 'title') => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
    authors,
    languages,
    filters,
    onFilterChange,
    sortConfig,
    onSortChange,
}) => {
    return (
        <div className="filter-bar">
            <div className="filter-group">
                <div className="filter-item">
                    <label>Author</label>
                    <select
                        value={filters.author}
                        onChange={(e) => onFilterChange('author', e.target.value)}
                    >
                        <option value="">All Authors</option>
                        {authors.map((author) => (
                            <option key={author} value={author}>
                                {author}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-item">
                    <label>Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => onFilterChange('status', e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="To Read">To Read</option>
                        <option value="Reading">Reading</option>
                        <option value="Completed">Completed</option>
                        <option value="Dropped">Dropped</option>
                    </select>
                </div>

                <div className="filter-item">
                    <label>Language</label>
                    <select
                        value={filters.language}
                        onChange={(e) => onFilterChange('language', e.target.value)}
                    >
                        <option value="">All Languages</option>
                        {languages.map((lang) => (
                            <option key={lang} value={lang}>
                                {lang}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="sort-group">
                <label>Sort By</label>
                <div className="sort-controls">
                    <select
                        value={sortConfig.key}
                        onChange={(e) => onSortChange(e.target.value as any)}
                    >
                        <option value="purchaseDate">Purchase Date</option>
                        <option value="price">Price</option>
                        <option value="title">Title</option>
                    </select>
                    <button
                        className="sort-direction-btn"
                        onClick={() => onSortChange(sortConfig.key)}
                        title="Toggle Direction"
                    >
                        {sortConfig.direction === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
                    </button>
                </div>
            </div>

            <style>{`
                .filter-bar {
                    background: #fff;
                    padding: var(--spacing-md);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--color-border);
                    margin-bottom: var(--spacing-lg);
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--spacing-lg);
                    align-items: flex-end;
                    justify-content: space-between;
                }

                .filter-group {
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--spacing-md);
                }

                .filter-item, .sort-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .filter-item label, .sort-group label {
                    font-size: 0.75rem;
                    color: var(--color-text-muted);
                    font-weight: 600;
                    text-transform: uppercase;
                }

                select {
                    padding: 0.5rem;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-sm);
                    background-color: var(--color-background);
                    color: var(--color-text);
                    min-width: 140px;
                    cursor: pointer;
                }

                select:focus {
                    outline: none;
                    border-color: var(--color-primary);
                }

                .sort-controls {
                    display: flex;
                    gap: 8px;
                }

                .sort-direction-btn {
                    padding: 0.5rem;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-sm);
                    background: var(--color-background);
                    color: var(--color-text);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .sort-direction-btn:hover {
                    background-color: var(--color-background-hover, #f3f4f6);
                }
            `}</style>
        </div>
    );
};

export default FilterBar;
