import React, { useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { BookOpen, TrendingUp, Clock, Zap, Flame, Activity, BarChart2 } from 'lucide-react';
import { calculateReadingStreak, calculateReadingConsistency, calculateMonthlyMomentum } from '../utils/readingAnalytics';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444']; // Indigo, Emerald, Amber, Red

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
            if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

            const durationMs = end.getTime() - start.getTime();
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

        return { avgSpeed, avgDuration, fastest, slowest };
    }, [books]);

    const streakMetrics = useMemo(() => calculateReadingStreak(books), [books]);
    const consistencyMetric = useMemo(() => calculateReadingConsistency(books), [books]);
    const momentumMetric = useMemo(() => calculateMonthlyMomentum(books), [books]);

    if (books.length === 0) {
        return (
            <div className="empty-state">
                <header className="page-header">
                    <h1 className="page-title">Insights</h1>
                    <p className="page-subtitle">Your reading habits, analyzed.</p>
                </header>
                <div className="empty-content">
                    <div className="icon-circle">
                        <BookOpen size={32} />
                    </div>
                    <p>Add books to unlock analytics.</p>
                </div>
                <style>{`
                    .empty-state { padding: 2rem; }
                    .page-header { margin-bottom: 2rem; }
                    .page-title { font-size: 2rem; font-weight: 800; color: #1e293b; margin-bottom: 0.25rem; letter-spacing: -0.03em; }
                    .page-subtitle { color: #64748b; font-size: 0.95rem; }
                    .empty-content { display: flex; flex-direction: column; alignItems: center; margin-top: 4rem; color: #94a3b8; }
                    .icon-circle { width: 64px; height: 64px; border-radius: 50%; background: #f1f5f9; display: flex; alignItems: center; justifyContent: center; margin-bottom: 1rem; color: #94a3b8; }
                `}</style>
            </div>
        )
    }

    return (
        <div className="insights-page">
            <header className="page-header">
                <h1 className="page-title">Insights</h1>
                <p className="page-subtitle">Your reading habits, analyzed.</p>
            </header>

            <div className="analytics-dashboard">

                {/* Reading Performance Section */}
                <section>
                    <h2 className="section-title">
                        <TrendingUp size={20} className="text-primary" />
                        Reading Performance
                    </h2>

                    {readingMetrics ? (
                        <div className="metrics-grid">
                            <div className="metric-card">
                                <div className="metric-icon bg-green-light">
                                    <Zap size={24} className="text-green" />
                                </div>
                                <div className="metric-content">
                                    <h3>Average Speed</h3>
                                    <p className="metric-value">{readingMetrics.avgSpeed} <span className="unit">pages/day</span></p>
                                </div>
                            </div>

                            <div className="metric-card">
                                <div className="metric-icon bg-amber-light">
                                    <Clock size={24} className="text-amber" />
                                </div>
                                <div className="metric-content">
                                    <h3>Avg. Completion</h3>
                                    <p className="metric-value">{readingMetrics.avgDuration} <span className="unit">days/book</span></p>
                                </div>
                            </div>

                            <div className="metric-card">
                                <div className="metric-icon bg-indigo-light">
                                    <TrendingUp size={24} className="text-primary" />
                                </div>
                                <div className="metric-content">
                                    <h3>Records</h3>
                                    <div className="micro-stats">
                                        <p><strong>🚀 {readingMetrics.fastest.title}</strong> ({readingMetrics.fastest.durationDays} days)</p>
                                        <p><strong>🐢 {readingMetrics.slowest.title}</strong> ({readingMetrics.slowest.durationDays} days)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Streak Metrics Card */}
                            {streakMetrics.longestStreak > 0 && (
                                <div className="metric-card">
                                    <div className="metric-icon bg-red-light">
                                        <Flame size={24} className="text-red" />
                                    </div>
                                    <div className="metric-content">
                                        <h3>Reading Streak</h3>
                                        <div className="split-stat">
                                            <div>
                                                <span className="label">CURRENT</span>
                                                <p className="metric-value small">{streakMetrics.currentStreak} <span className="unit">days</span></p>
                                            </div>
                                            <div className="divider-v"></div>
                                            <div>
                                                <span className="label">LONGEST</span>
                                                <p className="metric-value small">{streakMetrics.longestStreak} <span className="unit">days</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Consistency Score Card */}
                            <div className="metric-card">
                                <div className="metric-icon bg-blue-light">
                                    <Activity size={24} className="text-blue" />
                                </div>
                                <div className="metric-content">
                                    <h3>Consistency</h3>
                                    <p className="metric-value">{consistencyMetric.score}%</p>
                                    <p className="sub-text">{consistencyMetric.label}</p>
                                </div>
                            </div>

                            {/* Monthly Momentum Card */}
                            <div className="metric-card">
                                <div className="metric-icon bg-purple-light">
                                    <BarChart2 size={24} className="text-purple" />
                                </div>
                                <div className="metric-content">
                                    <h3>Momentum</h3>
                                    <div className="momentum-stat">
                                        <p className={`metric-value ${momentumMetric.trend}`}>
                                            {momentumMetric.diff > 0 ? '+' : ''}{momentumMetric.diff}%
                                        </p>
                                        <span className="unit">vs last month</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-metrics-state">
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
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="chart-card">
                        <h3>Top Authors by Value</h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={authorValueData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="chart-card full-width">
                        <h3>Purchases per Year</h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={yearData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="year" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis allowDecimals={false} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .insights-page {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                .page-header { margin-bottom: 1rem; }
                .page-title { font-size: 2rem; font-weight: 800; color: #1e293b; margin-bottom: 0.25rem; letter-spacing: -0.03em; }
                .page-subtitle { color: #64748b; font-size: 0.95rem; }

                .section-title {
                    font-size: 1.1rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #334155;
                }

                .analytics-dashboard {
                    display: flex;
                    flex-direction: column;
                    gap: 2.5rem;
                    padding-bottom: 3rem;
                }

                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                }

                .metric-card {
                    background: white;
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                    border: 1px solid #f1f5f9;
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    transition: transform 0.2s;
                }
                .metric-card:hover {
                    transform: translateY(-2px);
                }

                .metric-icon {
                    padding: 0.75rem;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 48px;
                    height: 48px;
                }
                .metric-content { flex: 1; }
                .metric-card h3 {
                    font-size: 0.75rem;
                    color: #64748b;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 0.25rem;
                }
                .metric-value {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #0f172a;
                    line-height: 1.2;
                }
                .metric-value.small { font-size: 1.25rem; }
                .unit { font-size: 0.85rem; font-weight: 500; color: #94a3b8; margin-left: 2px; }

                /* Colors */
                .text-primary { color: #6366f1; }
                .text-green { color: #10b981; }
                .text-amber { color: #f59e0b; }
                .text-red { color: #ef4444; }
                .text-blue { color: #3b82f6; }
                .text-purple { color: #a855f7; }
                
                .bg-green-light { background: #dcfce7; }
                .bg-amber-light { background: #fef3c7; }
                .bg-indigo-light { background: #e0e7ff; }
                .bg-red-light { background: #fee2e2; }
                .bg-blue-light { background: #dbeafe; }
                .bg-purple-light { background: #f3e8ff; }

                .micro-stats p { font-size: 0.85rem; color: #475569; margin-bottom: 2px; }
                .sub-text { font-size: 0.85rem; color: #94a3b8; margin-top: 2px; }

                .split-stat { display: flex; align-items: center; gap: 1rem; }
                .label { font-size: 0.65rem; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 2px; }
                .divider-v { width: 1px; height: 32px; background: #e2e8f0; }

                .momentum-stat { display: flex; align-items: baseline; gap: 0.5rem; }
                .metric-value.up { color: #10b981; }
                .metric-value.down { color: #ef4444; }

                .empty-metrics-state {
                    background: white;
                    padding: 2rem;
                    border-radius: 16px;
                    border: 2px dashed #e2e8f0;
                    text-align: center;
                    color: #94a3b8;
                    font-weight: 500;
                }

                .charts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 1.5rem;
                }

                .chart-card {
                    background: white;
                    border-radius: 20px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                    border: 1px solid #f1f5f9;
                    display: flex;
                    flex-direction: column;
                    height: 420px;
                }
                .chart-card.full-width { grid-column: 1 / -1; }
                .chart-card h3 {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 1.5rem;
                }
                .chart-container { flex: 1; width: 100%; min-height: 0; }

            `}</style>
        </div>
    );
};

export default Insights;
