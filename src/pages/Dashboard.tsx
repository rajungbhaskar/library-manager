import React from 'react';
import { useLibrary } from '../context/LibraryContext';
import { useSettings } from '../context/SettingsContext';

const Dashboard: React.FC = () => {
    const { books } = useLibrary();
    const { settings } = useSettings();

    const totalBooks = books.length;
    const readingCount = books.filter(b => b.status === 'Reading').length;
    const completedCount = books.filter(b => b.status === 'Completed').length;
    const toReadCount = books.filter(b => b.status === 'To Read').length;

    const totalValue = books.reduce((acc, book) => acc + (Number(book.price) || 0), 0);

    const averagePrice = React.useMemo(() => {
        const purchasedBooks = books.filter(b => !b.isGifted);
        if (purchasedBooks.length === 0) return 0;
        const total = purchasedBooks.reduce((sum, book) => sum + (book.price || 0), 0);
        return (total / purchasedBooks.length).toFixed(2);
    }, [books]);

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Dashboard</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Overview of your collection</p>
            </header>

            <div className="stats-grid">
                <div className="card">
                    <h3>Total Books</h3>
                    <p className="stat-value">{totalBooks}</p>
                </div>
                <div className="card">
                    <h3>Currently Reading</h3>
                    <p className="stat-value">{readingCount}</p>
                </div>
                <div className="card">
                    <h3>Completed</h3>
                    <p className="stat-value">{completedCount}</p>
                </div>
                <div className="card">
                    <h3>To Read</h3>
                    <p className="stat-value">{toReadCount}</p>
                </div>
                <div className="card">
                    <h3>Total Value</h3>
                    <p className="stat-value">{settings.currency}{totalValue.toFixed(2)}</p>
                </div>
                <div className="card">
                    <h3>Average Price</h3>
                    <p className="stat-value">{settings.currency}{averagePrice}</p>
                </div>
            </div>

            <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-lg);
        }
        .card h3 {
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
          margin-bottom: var(--spacing-xs);
        }
        .stat-value {
          font-size: var(--font-size-2xl);
          font-weight: bold;
          color: var(--color-primary);
        }
      `}</style>
        </div>
    );
};

export default Dashboard;
