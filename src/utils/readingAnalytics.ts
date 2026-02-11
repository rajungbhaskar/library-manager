import { Book } from '../types';

export interface StreakMetrics {
    longestStreak: number;
    currentStreak: number;
}

export interface ConsistencyMetric {
    score: number;
    label: string;
}

export interface MomentumMetric {
    currentMonthCount: number;
    previousMonthCount: number;
    diff: number;
    trend: 'up' | 'down' | 'flat';
}

/**
 * Calculates reading streaks based on book start and completion dates.
 * 
 * Rules:
 * - Completed: Covers range [startDate, completionDate]
 * - Reading: Covers range [startDate, TODAY]
 * - Streaks are consecutive days of coverage.
 */
export function calculateReadingStreak(books: Book[]): StreakMetrics {
    const activeBooks = books.filter(b =>
        (b.status === 'Completed' && b.startDate && b.completionDate) ||
        (b.status === 'Reading' && b.startDate)
    );

    if (activeBooks.length === 0) {
        return { longestStreak: 0, currentStreak: 0 };
    }

    const coveredDates = new Set<string>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    activeBooks.forEach(book => {
        const start = new Date(book.startDate!);
        let end: Date;

        if (book.status === 'Completed') {
            end = new Date(book.completionDate!);
        } else {
            // For Reading books, assume coverage up to today
            end = new Date(today);
        }

        // Basic validation
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return;

        // Expand range to dates
        const current = new Date(start);
        current.setHours(0, 0, 0, 0); // Normalize time

        // Safety brake: prevent infinite loops if dates are wild (e.g. 1970 to 2050)
        // Let's cap at 365 * 10 days involved per book to be safe, though unlikely to be hit
        let safetyCounter = 0;
        const MAX_DAYS = 5000;

        while (current <= end) {
            coveredDates.add(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);

            safetyCounter++;
            if (safetyCounter > MAX_DAYS) break;
        }
    });

    const sortedDates = Array.from(coveredDates).sort();
    if (sortedDates.length === 0) return { longestStreak: 0, currentStreak: 0 };

    // Calculate Longest Streak
    let maxStreak = 0;
    let currentRun = 0;

    for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
            currentRun = 1;
        } else {
            const prev = new Date(sortedDates[i - 1]);
            const curr = new Date(sortedDates[i]);
            const diffTime = Math.abs(curr.getTime() - prev.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentRun++;
            } else {
                currentRun = 1;
            }
        }
        if (currentRun > maxStreak) maxStreak = currentRun;
    }

    // Calculate Current Streak (Backwards from Today)
    let streakToday = 0;
    const todayStr = today.toISOString().split('T')[0];

    // Check if today is in the set
    if (coveredDates.has(todayStr)) {
        streakToday = 1;
        let dayCheck = new Date(today);
        dayCheck.setDate(dayCheck.getDate() - 1);

        while (true) {
            const checkStr = dayCheck.toISOString().split('T')[0];
            if (coveredDates.has(checkStr)) {
                streakToday++;
                dayCheck.setDate(dayCheck.getDate() - 1);
            } else {
                break;
            }
        }
    } else {
        // Check if yesterday was active (streak might be active but user hasn't read TODAY yet? 
        // User requirements imply: "For Reading: Coverage = startedOn → TODAY". 
        // So if they are reading a book, TODAY is covered automatically.
        // Thus if they have a 'Reading' book started <= today, current streak should include today.
        // So this else block might not be hit if they have a 'Reading' book.
        // It would be hit if they only have 'Completed' books ending yesterday.

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (coveredDates.has(yesterdayStr)) {
            streakToday = 0;
            // Actually, usually "Current Streak" implies validation for today. 
            // But strict apps say 0 if not done today. 
            // However, the prompt says "For Reading: Coverage = start -> TODAY".
            // This means if a book is "Reading", today IS covered.
            // If only "Completed" books exist, and last one finished yesterday, streak is technically 0?
            // Or preserved? 
            // "Goal: Add behavioral streak... Coverage = startedOn -> TODAY for Reading"
            // This implies minimal effort to keep streak alive is having status="Reading".
            // So if today isn't covered, it means no book is "Reading" and last completed < today.
            // So 0 is correct.
        }
    }

    return {
        longestStreak: maxStreak,
        currentStreak: streakToday
    };
}

/**
 * Calculates consistency score: % of days with reading activity in last 90 days.
 */
export function calculateReadingConsistency(books: Book[]): ConsistencyMetric {
    const activeBooks = books.filter(b =>
        (b.status === 'Completed' && b.startDate && b.completionDate) ||
        (b.status === 'Reading' && b.startDate)
    );

    if (activeBooks.length === 0) {
        return { score: 0, label: 'Needs Discipline' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(today.getDate() - 89); // Window of 90 days inclusive

    const activeDays = new Set<string>();

    activeBooks.forEach(book => {
        const start = new Date(book.startDate!);
        let end: Date;

        if (book.status === 'Completed') {
            end = new Date(book.completionDate!);
        } else {
            end = new Date(today);
        }

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return;

        // Intersection of [start, end] and [ninetyDaysAgo, today]
        const effectiveStart = start < ninetyDaysAgo ? ninetyDaysAgo : start;
        const effectiveEnd = end > today ? today : end;

        // If no overlap
        if (effectiveStart > effectiveEnd) return;

        const current = new Date(effectiveStart);
        current.setHours(0, 0, 0, 0);

        while (current <= effectiveEnd) {
            activeDays.add(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
        }
    });

    const score = Math.min(100, Math.round((activeDays.size / 90) * 100));
    let label = 'Needs Discipline';
    if (score >= 80) label = 'Highly Consistent';
    else if (score >= 50) label = 'Building Momentum';

    return { score, label };
}

/**
 * Calculates monthly momentum: Comparison of reading days current month vs last month.
 */
export function calculateMonthlyMomentum(books: Book[]): MomentumMetric {
    const activeBooks = books.filter(b =>
        (b.status === 'Completed' && b.startDate && b.completionDate) ||
        (b.status === 'Reading' && b.startDate)
    );

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Previous month logic handling year wrap
    const prevDate = new Date(today);
    prevDate.setMonth(today.getMonth() - 1);
    const prevMonth = prevDate.getMonth();
    const prevYear = prevDate.getFullYear();

    const currentMonthDays = new Set<string>();
    const prevMonthDays = new Set<string>();

    activeBooks.forEach(book => {
        const start = new Date(book.startDate!);
        let end: Date;

        if (book.status === 'Completed') {
            end = new Date(book.completionDate!);
        } else {
            end = new Date(today);
        }

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return;

        const current = new Date(start);
        current.setHours(0, 0, 0, 0);

        // Optimize: just jump to relevant months? 
        // Simple loop is safe enough given expected volume and safety brakes.
        while (current <= end) {
            const m = current.getMonth();
            const y = current.getFullYear();
            const dateStr = current.toISOString().split('T')[0];

            if (m === currentMonth && y === currentYear) {
                currentMonthDays.add(dateStr);
            } else if (m === prevMonth && y === prevYear) {
                prevMonthDays.add(dateStr);
            }
            current.setDate(current.getDate() + 1);
        }
    });

    const currentCount = currentMonthDays.size;
    const prevCount = prevMonthDays.size;

    let diff = 0;
    if (prevCount > 0) {
        diff = Math.round(((currentCount - prevCount) / prevCount) * 100);
    } else if (currentCount > 0) {
        // If previous month was 0 and current is > 0, we treat as 100% growth for simplicity
        // or effectively infinite. 100% is a safe "doubling+" metaphor.
        diff = 100;
    } else {
        diff = 0;
    }

    let trend: 'up' | 'down' | 'flat' = 'flat';
    if (diff > 0) trend = 'up';
    if (diff < 0) trend = 'down';

    return {
        currentMonthCount: currentCount,
        previousMonthCount: prevCount,
        diff,
        trend
    };
}
