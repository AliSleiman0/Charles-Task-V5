'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Clock, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { formatDateShort, getStatusColor } from '@/lib/utils';
import { updateEventStatus, deleteEvent } from '@/app/actions/events';
import type { Event, EventStatus } from '@/types/database';
import toast from 'react-hot-toast';

interface EventCardProps {
  event: Event;
  showActions?: boolean;
}

const statuses: EventStatus[] = ['upcoming', 'attending', 'maybe', 'declined'];

export default function EventCard({ event, showActions = true }: EventCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async (status: EventStatus) => {
    const result = await updateEventStatus(event.id, status);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Status updated');
    }
    setShowStatusMenu(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    setIsDeleting(true);
    const result = await deleteEvent(event.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Event deleted');
    }
    setIsDeleting(false);
    setShowMenu(false);
  };

  return (
    <div className={`card relative ${isDeleting ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-start">
        <Link href={`/events/${event.id}`} className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 hover:text-primary-600 transition-colors">
            {event.title}
          </h3>
        </Link>
        
        {showActions && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <MoreVertical className="h-5 w-5 text-gray-400" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border z-10">
                <Link
                  href={`/events/${event.id}/edit`}
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  <Pencil className="h-4 w-4" />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 text-sm text-red-600 w-full"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {event.description && (
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{event.description}</p>
      )}

      <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4" />
          <span>{formatDateShort(event.event_datetime)}</span>
        </div>
        {event.location && (
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={`badge ${getStatusColor(event.status)} cursor-pointer hover:opacity-80`}
          >
            {event.status}
          </button>
          
          {showStatusMenu && (
            <div className="absolute left-0 mt-1 w-32 bg-white rounded-lg shadow-lg border z-10">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                    status === event.status ? 'bg-gray-50 font-medium' : ''
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Click outside handler */}
      {(showMenu || showStatusMenu) && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => { setShowMenu(false); setShowStatusMenu(false); }}
        />
      )}
    </div>
  );
}
