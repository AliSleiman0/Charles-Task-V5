'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, Clock, MapPin } from 'lucide-react';
import { createEvent, updateEvent } from '@/app/actions/events';
import type { Event, EventStatus, CreateEventInput } from '@/types/database';
import toast from 'react-hot-toast';

interface EventFormProps {
  event?: Event;
  mode: 'create' | 'edit';
}

const statuses: EventStatus[] = ['upcoming', 'attending', 'maybe', 'declined'];

export default function EventForm({ event, mode }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [location, setLocation] = useState(event?.location || '');
  const [eventDatetime, setEventDatetime] = useState(
    event?.event_datetime 
      ? new Date(event.event_datetime).toISOString().slice(0, 16)
      : ''
  );
  const [status, setStatus] = useState<EventStatus>(event?.status || 'upcoming');
  const [isPublic, setIsPublic] = useState(event?.is_public || false);

  const [timeSuggestion, setTimeSuggestion] = useState<any>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const input: CreateEventInput = {
      title,
      description: description || undefined,
      location: location || undefined,
      event_datetime: new Date(eventDatetime).toISOString(),
      status,
      is_public: isPublic,
    };

    try {
      if (mode === 'create') {
        const result = await createEvent(input);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success('Event created successfully!');
          router.push('/events');
        }
      } else if (event) {
        const result = await updateEvent({ ...input, id: event.id });
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success('Event updated successfully!');
          router.push(`/events/${event.id}`);
        }
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateDescription = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title first');
      return;
    }

    setAiLoading('description');
    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setDescription(data.description);
        toast.success('Description generated!');
      }
    } catch (error) {
      toast.error('Failed to generate description');
    } finally {
      setAiLoading(null);
    }
  };

  const suggestTime = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title first');
      return;
    }

    setAiLoading('time');
    try {
      const response = await fetch('/api/ai/suggest-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setTimeSuggestion(data);
        toast.success('Time suggestion received!');
      }
    } catch (error) {
      toast.error('Failed to suggest time');
    } finally {
      setAiLoading(null);
    }
  };

  const suggestLocation = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title first');
      return;
    }

    setAiLoading('location');
    try {
      const response = await fetch('/api/ai/suggest-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setLocationSuggestions(data.suggestions || []);
        toast.success('Location suggestions received!');
      }
    } catch (error) {
      toast.error('Failed to suggest locations');
    } finally {
      setAiLoading(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
          placeholder="Enter event title"
          required
        />
      </div>

      {/* Description with AI */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <button
            type="button"
            onClick={generateDescription}
            disabled={aiLoading === 'description'}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
          >
            {aiLoading === 'description' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>Generate with AI</span>
          </button>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field min-h-[100px]"
          placeholder="Describe your event..."
        />
      </div>

      {/* Date/Time with AI suggestion */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Date & Time *
          </label>
          <button
            type="button"
            onClick={suggestTime}
            disabled={aiLoading === 'time'}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
          >
            {aiLoading === 'time' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            <span>Suggest best time</span>
          </button>
        </div>
        <input
          type="datetime-local"
          value={eventDatetime}
          onChange={(e) => setEventDatetime(e.target.value)}
          className="input-field"
          required
        />
        {timeSuggestion && (
          <div className="mt-2 p-3 bg-primary-50 rounded-lg text-sm">
            <p className="font-medium text-primary-700">
              Suggested: {timeSuggestion.suggestedDay} at {timeSuggestion.suggestedTime}
            </p>
            <p className="text-primary-600 mt-1">{timeSuggestion.reason}</p>
          </div>
        )}
      </div>

      {/* Location with AI */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <button
            type="button"
            onClick={suggestLocation}
            disabled={aiLoading === 'location'}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
          >
            {aiLoading === 'location' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            <span>Suggest locations</span>
          </button>
        </div>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="input-field"
          placeholder="Enter location"
        />
        {locationSuggestions.length > 0 && (
          <div className="mt-2 space-y-2">
            {locationSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setLocation(suggestion.type)}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
              >
                <p className="font-medium">{suggestion.type}</p>
                <p className="text-gray-500">{suggestion.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as EventStatus)}
          className="input-field"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Public Toggle */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="isPublic"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
        />
        <label htmlFor="isPublic" className="text-sm text-gray-700">
          Make this event public (visible on your profile)
        </label>
      </div>

      {/* Submit */}
      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex items-center space-x-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{mode === 'create' ? 'Create Event' : 'Update Event'}</span>
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
