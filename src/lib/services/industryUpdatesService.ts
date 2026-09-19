import { IndustryUpdate, IndustryUpdateCategory } from '../../types';
import { INITIAL_INDUSTRY_UPDATES } from '../data/industryUpdatesData';

const STORAGE_KEY = 'castkerala_industry_updates_v1';
const LAST_FETCHED_KEY = 'castkerala_industry_updates_last_fetched';

export interface FetchUpdatesOptions {
  category?: IndustryUpdateCategory | 'all';
  searchQuery?: string;
  urgentOnly?: boolean;
}

export interface FetchUpdatesResult {
  updates: IndustryUpdate[];
  lastUpdated: string;
  sourceCount: number;
}

export function getStoredUpdates(): IndustryUpdate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INDUSTRY_UPDATES));
      return INITIAL_INDUSTRY_UPDATES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_INDUSTRY_UPDATES;
  } catch (err) {
    console.error('Failed to read industry updates from storage', err);
    return INITIAL_INDUSTRY_UPDATES;
  }
}

export function saveStoredUpdates(updates: IndustryUpdate[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updates));
  } catch (err) {
    console.error('Failed to save industry updates to storage', err);
  }
}

export async function fetchIndustryUpdates(options: FetchUpdatesOptions = {}): Promise<FetchUpdatesResult> {
  // Simulate network latency (200ms - 400ms) for realistic live asynchronous fetching
  await new Promise(resolve => setTimeout(resolve, 250));

  let items = getStoredUpdates();

  // If items is empty for any reason, re-seed
  if (!items || items.length === 0) {
    items = INITIAL_INDUSTRY_UPDATES;
    saveStoredUpdates(items);
  }

  // Filter by category
  if (options.category && options.category !== 'all') {
    items = items.filter(u => u.category === options.category);
  }

  // Filter by urgent
  if (options.urgentOnly) {
    items = items.filter(u => u.urgent);
  }

  // Filter by search query
  if (options.searchQuery && options.searchQuery.trim()) {
    const q = options.searchQuery.toLowerCase().trim();
    items = items.filter(u => 
      u.title.toLowerCase().includes(q) ||
      u.summary.toLowerCase().includes(q) ||
      u.source_organization.toLowerCase().includes(q) ||
      u.official_reference_no.toLowerCase().includes(q) ||
      u.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  const now = new Date().toISOString();
  localStorage.setItem(LAST_FETCHED_KEY, now);

  return {
    updates: items,
    lastUpdated: now,
    sourceCount: new Set(items.map(u => u.source_organization_short)).size
  };
}

export function getLastFetchedTime(): string | null {
  try {
    return localStorage.getItem(LAST_FETCHED_KEY);
  } catch {
    return null;
  }
}
