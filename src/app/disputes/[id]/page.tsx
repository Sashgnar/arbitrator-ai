'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

interface Argument {
  id: string;
  content: string;
  authorId: string;
  argumentNumber: number;
  isFinal: boolean;
  createdAt: string;
}

interface Dispute {
  id: string;
  title: string;
  description: string | null;
  status: string;
  creatorId: string;
  opponentId: string | null;
  createdAt: string;
}

export default function DisputePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [arguments_, setArguments] = useState<Argument[]>([]);
  const [loading, setLoading] = useState(true);
  const [newArgument, setNewArgument] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currentUserId = 'temp-user-id'; // TODO: Replace with actual auth

  useEffect(() => {
    fetchDispute();
    fetchArguments();
  }, [id]);

  async function fetchDispute() {
    try {
      const res = await fetch(`/api/disputes/${id}`);
      const data = await res.json();
      setDispute(data.dispute);
    } catch (error) {
      console.error('Failed to fetch dispute:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchArguments() {
    try {
      const res = await fetch(`/api/arguments?disputeId=${id}`);
      const data = await res.json();
      setArguments(data.arguments || []);
    } catch (error) {
      console.error('Failed to fetch arguments:', error);
    }
  }

  async function submitArgument(e: React.FormEvent) {
    e.preventDefault();
    if (!newArgument.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/arguments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeId: id,
          userId: currentUserId,
          content: newArgument,
        }),
      });
      const data = await res.json();
      if (data.argumentId) {
        setNewArgument('');
        fetchArguments();
      }
    } catch (error) {
      console.error('Failed to submit argument:', error);
    } finally {
      setSubmitting(false);
    }
  }

  async function finalizeArgument(argumentId: string) {
    try {
      await fetch(`/api/arguments/${argumentId}/finalize`, { method: 'POST' });
      fetchArguments();
    } catch (error) {
      console.error('Failed to finalize argument:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Dispute not found</p>
      </div>
    );
  }

  const myArguments = arguments_.filter(a => a.authorId === currentUserId);
  const opponentArguments = arguments_.filter(a => a.authorId !== currentUserId);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            &larr; Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{dispute.title}</h1>
          {dispute.description && (
            <p className="text-gray-600 mt-1">{dispute.description}</p>
          )}
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
            {dispute.status.replace('_', ' ')}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* My Arguments */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Arguments</h2>
            <div className="space-y-4 mb-4">
              {myArguments.length === 0 ? (
                <p className="text-gray-500 bg-white rounded-lg p-4 shadow">
                  No arguments yet. Submit your first argument below.
                </p>
              ) : (
                myArguments.map((arg) => (
                  <div key={arg.id} className="bg-white rounded-lg p-4 shadow">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-500">
                        Argument #{arg.argumentNumber}
                      </span>
                      {arg.isFinal ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Final
                        </span>
                      ) : (
                        <button
                          onClick={() => finalizeArgument(arg.id)}
                          className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200"
                        >
                          Finalize
                        </button>
                      )}
                    </div>
                    <p className="text-gray-800">{arg.content}</p>
                  </div>
                ))
              )}
            </div>

            {dispute.status === 'arguing' && (
              <form onSubmit={submitArgument} className="bg-white rounded-lg p-4 shadow">
                <textarea
                  value={newArgument}
                  onChange={(e) => setNewArgument(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mb-2"
                  rows={4}
                  placeholder="Write your argument..."
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Argument'}
                </button>
              </form>
            )}
          </div>

          {/* Opponent Arguments */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Opponent&apos;s Arguments</h2>
            <div className="space-y-4">
              {!dispute.opponentId ? (
                <p className="text-gray-500 bg-white rounded-lg p-4 shadow">
                  Waiting for opponent to join...
                </p>
              ) : opponentArguments.length === 0 ? (
                <p className="text-gray-500 bg-white rounded-lg p-4 shadow">
                  Opponent hasn&apos;t submitted any arguments yet.
                </p>
              ) : (
                opponentArguments.map((arg) => (
                  <div key={arg.id} className="bg-white rounded-lg p-4 shadow">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-500">
                        Argument #{arg.argumentNumber}
                      </span>
                      {arg.isFinal && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Final
                        </span>
                      )}
                    </div>
                    <p className="text-gray-800">{arg.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
