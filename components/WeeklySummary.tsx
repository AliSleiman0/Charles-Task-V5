'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WeeklySummary() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/weekly-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setSummary(data.summary);
      }
    } catch (error) {
      toast.error('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold">AI Weekly Summary</h3>
            <p className="text-sm text-gray-500">Get an overview of your upcoming week</p>
          </div>
        </div>
        <button
          onClick={generateSummary}
          disabled={loading}
          className="btn-primary flex items-center space-x-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Calendar className="h-4 w-4" />
          )}
          <span>{loading ? 'Generating...' : 'Generate'}</span>
        </button>
      </div>

      {summary && (
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-primary-50 rounded-lg">
          <p className="text-gray-700">{summary}</p>
        </div>
      )}
    </div>
  );
}
