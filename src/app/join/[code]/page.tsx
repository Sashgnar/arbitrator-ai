'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const currentUserId = 'opponent-user-id'; // TODO: Replace with actual auth

  useEffect(() => {
    validateInvitation();
  }, [code]);

  async function validateInvitation() {
    try {
      const res = await fetch('/api/invitations/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (data.valid) {
        setDisputeId(data.disputeId);
      } else {
        setError(data.reason || 'Invalid invitation');
      }
    } catch (err) {
      setError('Failed to validate invitation');
    } finally {
      setLoading(false);
    }
  }

  async function joinDispute() {
    if (!disputeId) return;

    setJoining(true);
    try {
      const res = await fetch('/api/invitations/consume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, userId: currentUserId }),
      });
      const data = await res.json();

      if (data.consumed) {
        router.push(`/disputes/${data.disputeId}`);
      } else {
        setError('Failed to join dispute');
      }
    } catch (err) {
      setError('Failed to join dispute');
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow p-8 max-w-md text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Join Dispute</h1>
        <p className="text-gray-600 mb-6">
          You have been invited to participate in a dispute resolution.
        </p>
        <button
          onClick={joinDispute}
          disabled={joining}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {joining ? 'Joining...' : 'Accept & Join Dispute'}
        </button>
      </div>
    </div>
  );
}
