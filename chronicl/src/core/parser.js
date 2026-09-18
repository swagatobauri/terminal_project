import { 
  startOfDay, endOfDay, subDays, subWeeks, 
  startOfWeek, endOfWeek, parse, isValid 
} from 'date-fns';

export function parseNaturalDate(input) {
  if (!input) return null;
  const str = input.toLowerCase().trim();
  const now = new Date();
  
  if (str === 'today') {
    return { from: startOfDay(now), to: endOfDay(now) };
  }
  if (str === 'yesterday') {
    const d = subDays(now, 1);
    return { from: startOfDay(d), to: endOfDay(d) };
  }
  if (str === 'this week') {
    return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfDay(now) };
  }
  if (str === 'last week') {
    const d = subWeeks(now, 1);
    return { from: startOfWeek(d, { weekStartsOn: 1 }), to: endOfWeek(d, { weekStartsOn: 1 }) };
  }
  
  // "X days ago"
  const daysAgoMatch = str.match(/^(\d+)\s+days?\s+ago$/);
  if (daysAgoMatch) {
    const d = subDays(now, parseInt(daysAgoMatch[1], 10));
    return { from: startOfDay(d), to: endOfDay(d) };
  }
  
  // "X weeks ago"
  const weeksAgoMatch = str.match(/^(\d+)\s+weeks?\s+ago$/);
  if (weeksAgoMatch) {
    const d = subWeeks(now, parseInt(weeksAgoMatch[1], 10));
    return { from: startOfWeek(d, { weekStartsOn: 1 }), to: endOfWeek(d, { weekStartsOn: 1 }) };
  }
  
  // "last tuesday", etc.
  const daysMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
  const lastDayMatch = str.match(/^last\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/);
  if (lastDayMatch) {
    const targetDay = daysMap[lastDayMatch[1]];
    let d = subDays(now, 1);
    while (d.getDay() !== targetDay) {
      d = subDays(d, 1);
    }
    return { from: startOfDay(d), to: endOfDay(d) };
  }
  
  // "jan 14", "january 14", "2025-01-14"
  // Try native date parsing first
  let parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return { from: startOfDay(parsed), to: endOfDay(parsed) };
  }
  
  return null;
}

export function getCommitsInRange(allLogs, from, to) {
  return allLogs
    .filter(c => {
      const d = new Date(c.date);
      return d >= from && d <= to;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // ascending
}

export function getMostActiveHour(commits) {
  if (!commits || commits.length === 0) return 'N/A';
  
  const hourCounts = {};
  for (const c of commits) {
    const h = new Date(c.date).getHours();
    hourCounts[h] = (hourCounts[h] || 0) + 1;
  }
  
  let maxHour = 0;
  let maxCount = 0;
  for (const [hour, count] of Object.entries(hourCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxHour = parseInt(hour, 10);
    }
  }
  
  const ampm = maxHour >= 12 ? 'PM' : 'AM';
  const displayHour = maxHour % 12 === 0 ? 12 : maxHour % 12;
  return `${displayHour} ${ampm}`;
}

export function getLongestStreak(allLogs) {
  if (!allLogs || allLogs.length === 0) return { days: 0, from: null, to: null };
  
  const dateSet = new Set(allLogs.map(c => new Date(c.date).toISOString().split('T')[0]));
  const sortedDates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));
  
  let longest = 0;
  let longestFrom = null;
  let longestTo = null;
  
  let currentStreak = 1;
  let currentFrom = sortedDates[0];
  let currentTo = sortedDates[0];
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffTime = Math.abs(prevDate - currDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
      currentFrom = sortedDates[i]; // moving backward
    } else {
      if (currentStreak > longest) {
        longest = currentStreak;
        longestFrom = currentFrom;
        longestTo = currentTo;
      }
      currentStreak = 1;
      currentFrom = sortedDates[i];
      currentTo = sortedDates[i];
    }
  }
  
  if (currentStreak > longest) {
    longest = currentStreak;
    longestFrom = currentFrom;
    longestTo = currentTo;
  }
  
  return { 
    days: longest, 
    from: longestFrom ? new Date(`${longestFrom}T12:00:00Z`) : null, 
    to: longestTo ? new Date(`${longestTo}T12:00:00Z`) : null 
  };
}

export function getCurrentStreak(allLogs) {
  if (!allLogs || allLogs.length === 0) return { days: 0, since: null };
  
  const dateSet = new Set(allLogs.map(c => new Date(c.date).toISOString().split('T')[0]));
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = subDays(today, 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (!dateSet.has(todayStr) && !dateSet.has(yesterdayStr)) {
    return { days: 0, since: null };
  }
  
  let currentStreak = 0;
  let d = dateSet.has(todayStr) ? today : yesterday;
  
  while (true) {
    const dStr = d.toISOString().split('T')[0];
    if (dateSet.has(dStr)) {
      currentStreak++;
      d = subDays(d, 1);
    } else {
      break;
    }
  }
  
  const sinceDate = subDays(d, -1);
  return { days: currentStreak, since: sinceDate };
}

export function getTopRepos(commits, limit = 5) {
  const counts = {};
  for (const c of commits) {
    counts[c.repo] = (counts[c.repo] || 0) + 1;
  }
  
  return Object.entries(counts)
    .map(([repo, count]) => ({ repo, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
