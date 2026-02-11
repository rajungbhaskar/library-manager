import React, { useMemo } from 'react';

import { useLibrary } from '../context/LibraryContext';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { BookOpen, TrendingUp, Clock, Zap, Flame, Activity, BarChart2 } from 'lucide-react';
import { Book } from '../types';
import { calculateReadingStreak, calculateReadingConsistency, calculateMonthlyMomentum } from '../utils/readingAnalytics';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444']; // Primary, Success, Warning, Danger

const Insights: React.FC = () => {

    const { books } = useLibrary();

    // 1. Books by Status
    const statusData = useMemo(() => {
        const counts = books.reduce((acc, book) => {
            acc[book.status] = (acc[book.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.keys(counts).map((status) => ({
            name: status,
            value: counts[status],
        }));
    }, [books]);

    // 2. Value by Author (Top 5)
    const authorValueData = useMemo(() => {
        const values = books.reduce((acc, book) => {
            acc[book.author] = (acc[book.author] || 0) + (book.price || 0);
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(values)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [books]);

    // 3. Books Purchased per Year
    const yearData = useMemo(() => {
        const counts = books.reduce((acc, book) => {
            if (book.purchaseDate) {
                const year = new Date(book.purchaseDate).getFullYear().toString();
                if (!isNaN(Number(year))) {
                    acc[year] = (acc[year] || 0) + 1;
                }
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts)
            .map(([year, count]) => ({ year, count }))
            .sort((a, b) => a.year.localeCompare(b.year));
    }, [books]);

    // --- READING INTELLIGENCE v1 ---
    const readingMetrics = useMemo(() => {
        const completedBooks = books.filter(b =>
            b.status === 'Completed' &&
            b.pages > 0 &&
            b.startDate &&
            b.completionDate
        );

        if (completedBooks.length === 0) return null;

        const bookMetrics = completedBooks.map(book => {
            const start = new Date(book.startDate!);
            const end = new Date(book.completionDate!);

            // Basic validation to avoid negative dates or weirdness
            if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

            const durationMs = end.getTime() - start.getTime();
            // Minimum 1 day to avoid division by zero or unrealistic speeds
            const durationDays = Math.max(Math.ceil(durationMs / (1000 * 60 * 60 * 24)), 1);
            const pagesPerDay = book.pages / durationDays;

            return {
                title: book.title,
                durationDays,
                pagesPerDay
            };
        }).filter((m): m is { title: string; durationDays: number; pagesPerDay: number } => m !== null);

        if (bookMetrics.length === 0) return null;

        const totalSpeed = bookMetrics.reduce((sum, m) => sum + m.pagesPerDay, 0);
        const avgSpeed = Math.round(totalSpeed / bookMetrics.length);

        const totalDuration = bookMetrics.reduce((sum, m) => sum + m.durationDays, 0);
        const avgDuration = Math.round(totalDuration / bookMetrics.length);

        const sortedBySpeed = [...bookMetrics].sort((a, b) => a.durationDays - b.durationDays);
        const fastest = sortedBySpeed[0];
        const slowest = sortedBySpeed[sortedBySpeed.length - 1];

        return {
            avgSpeed,
            avgDuration,
            fastest,
            slowest
        };
    }, [books]);

    const streakMetrics = useMemo(() => {
        return calculateReadingStreak(books);
    }, [books]);

    const consistencyMetric = useMemo(() => {
        return calculateReadingConsistency(books);
    }, [books]);

    const momentumMetric = useMemo(() => {
        return calculateMonthlyMomentum(books);
    }, [books]);

    // 4. Average Book Price (Excluding Gifted)






    if (books.length === 0) {
        return (
            <div className="empty-state">
                <header style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Insights</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Analytics & Intelligence</p>
                </header>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4rem' }}>
                    <BookOpen size={48} color="var(--color-text-muted)" />
                    <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Add books to see analytics.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="insights-page">
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Insights</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Analytics & Intelligence</p>
            </header>

            <div className="analytics-dashboard">

                {/* Reading Performance Section */}
                <section>
                    <h2 style={{
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: '600',
                        marginBottom: 'var(--spacing-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <TrendingUp size={20} color="var(--color-primary)" />
                        Reading Performance
                    </h2>

                    {readingMetrics ? (
                        <div className="metrics-grid">
                            <div className="metric-card">
                                <div className="metric-icon" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                                    <Zap size={24} color="var(--color-success)" />
                                </div>
                                <div>
                                    <h3>Average Speed</h3>
                                    <p className="metric-value">{readingMetrics.avgSpeed} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>pages/day</span></p>
                                </div>
                            </div>

                            <div className="metric-card">
                                <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                                    <Clock size={24} color="var(--color-warning)" />
                                </div>
                                <div>
                                    <h3>Avg. Completion Time</h3>
                                    <p className="metric-value">{readingMetrics.avgDuration} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>days/book</span></p>
                                </div>
                            </div>

                            <div className="metric-card">
                                <div className="metric-icon" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                                    <TrendingUp size={24} color="var(--color-primary)" />
                                </div>
                                <div>
                                    <h3>Fastest & Slowest</h3>
                                    <div style={{ fontSize: '0.9rem' }}>
                                        <p style={{ marginBottom: '4px' }}><strong>🚀 {readingMetrics.fastest.title}</strong> ({readingMetrics.fastest.durationDays} days)</p>
                                        <p><strong>🐢 {readingMetrics.slowest.title}</strong> ({readingMetrics.slowest.durationDays} days)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Streak Metrics Card */}
                            {streakMetrics.longestStreak > 0 && (
                                <div className="metric-card">
                                    <div className="metric-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                                        <Flame size={24} color="var(--color-danger)" />
                                    </div>
                                    <div>
                                        <h3>Reading Streak</h3>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <div>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>CURRENT</span>
                                                <p className="metric-value" style={{ fontSize: '1.5rem' }}>{streakMetrics.currentStreak} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>days</span></p>
                                            </div>
                                            <div style={{ width: '1px', background: 'var(--color-border)', height: '40px' }}></div>
                                            <div>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>LONGEST</span>
                                                <p className="metric-value" style={{ fontSize: '1.5rem' }}>{streakMetrics.longestStreak} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>days</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Consistency Score Card */}
                            <div className="metric-card">
                                <div className="metric-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                                    <Activity size={24} color="#3b82f6" />
                                </div>
                                <div>
                                    <h3>Consistency Score</h3>
                                    <p className="metric-value">{consistencyMetric.score}%</p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{consistencyMetric.label}</p>
                                </div>
                            </div>

                            {/* Monthly Momentum Card */}
                            <div className="metric-card">
                                <div className="metric-icon" style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
                                    <BarChart2 size={24} color="#a855f7" />
                                </div>
                                <div>
                                    <h3>Monthly Momentum</h3>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                        <p className="metric-value" style={{ color: momentumMetric.trend === 'up' ? 'var(--color-success)' : momentumMetric.trend === 'down' ? 'var(--color-danger)' : 'var(--color-text)' }}>
                                            {momentumMetric.diff > 0 ? '+' : ''}{momentumMetric.diff}%
                                        </p>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>vs last month</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-metrics-state" style={{
                            background: 'var(--color-surface)',
                            padding: '2rem',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--color-border)',
                            textAlign: 'center',
                            color: 'var(--color-text-muted)'
                        }}>
                            <p>Complete a book with start & finish dates to unlock reading intelligence.</p>
                        </div>
                    )}


                </section>

                <div className="charts-grid">
                    <div className="chart-card">
                        <h3>Books by Status</h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="chart-card">
                        <h3>Top Authors by Value</h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={authorValueData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="chart-card full-width">
                        <h3>Purchases per Year</h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={yearData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="year" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="count" fill="var(--color-secondary, #10b981)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .analytics-dashboard {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
          padding-bottom: var(--spacing-xl);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: var(--spacing-lg);
        }

        .metric-card {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .metric-icon {
          background: rgba(99, 102, 241, 0.1);
          padding: var(--spacing-md);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .metric-card h3 {
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
          margin-bottom: var(--spacing-xs);
          font-weight: 500;
        }

        .metric-value {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          color: var(--color-text);
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: var(--spacing-lg);
        }

        .chart-card {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          height: 400px;
        }
        
        .chart-card.full-width {
            grid-column: 1 / -1;
        }

        .chart-card h3 {
          font-size: var(--font-size-lg);
          font-weight: 600;
          margin-bottom: var(--spacing-lg);
          color: var(--color-text);
        }

        .chart-container {
          flex: 1;
          width: 100%;
          min-height: 0; 
        }
      `}</style>
        </div >
    );
};

export default Insights;
