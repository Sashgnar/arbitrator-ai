'use client';

import { useState, useEffect } from 'react';

interface Dispute {
  id: string;
  title: string;
  description: string | null;
  status: string;
  creatorId: string;
  opponentId: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchDisputes();
  }, []);

  async function fetchDisputes() {
    try {
      const res = await fetch('/api/disputes');
      const data = await res.json();
      setDisputes(data.disputes || []);
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createDispute(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, userId: 'temp-user-id' }),
      });
      const data = await res.json();
      if (data.disputeId) {
        setTitle('');
        setDescription('');
        setShowCreateForm(false);
        fetchDisputes();
      }
    } catch (error) {
      console.error('Failed to create dispute:', error);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_opponent': return 'bg-yellow-100 text-yellow-800';
      case 'arguing': return 'bg-blue-100 text-blue-800';
      case 'pending_resolution': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Arbitrator AI</h1>
          <p className="text-gray-600">AI-powered dispute resolution</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Disputes</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            New Dispute
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Create New Dispute</h3>
            <form onSubmit={createDispute}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="What is the dispute about?"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Provide context for the dispute..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : disputes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No disputes yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <a
                key={dispute.id}
                href={`/disputes/${dispute.id}`}
                className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {dispute.title}
                    </h3>
                    {dispute.description && (
                      <p className="text-gray-600 mt-1">{dispute.description}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(dispute.status)}`}>
                    {dispute.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-4">
                  Created: {new Date(dispute.createdAt).toLocaleDateString()}
                </p>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
