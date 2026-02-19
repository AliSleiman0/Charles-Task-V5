'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import type { EventStatus } from '@/types/database';

const statuses: EventStatus[] = ['upcoming', 'attending', 'maybe', 'declined'];

export default function EventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [showFilters, setShowFilters] = useState(false);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (location) params.set('location', location);
    
    router.push(`/events?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    setLocation('');
    router.push('/events');
  };

  const hasFilters = search || status || startDate || endDate || location;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            placeholder="Search events..."
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary flex items-center space-x-2 ${showFilters ? 'bg-gray-200' : ''}`}
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </button>
        <button onClick={applyFilters} className="btn-primary">
          Search
        </button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="card">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input-field"
              >
                <option value="">All Statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Filter by location"
                className="input-field"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <X className="h-4 w-4" />
                <span>Clear filters</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {search && (
            <span className="badge bg-primary-100 text-primary-800">
              Search: {search}
            </span>
          )}
          {status && (
            <span className="badge bg-primary-100 text-primary-800">
              Status: {status}
            </span>
          )}
          {startDate && (
            <span className="badge bg-primary-100 text-primary-800">
              From: {startDate}
            </span>
          )}
          {endDate && (
            <span className="badge bg-primary-100 text-primary-800">
              To: {endDate}
            </span>
          )}
          {location && (
            <span className="badge bg-primary-100 text-primary-800">
              Location: {location}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
