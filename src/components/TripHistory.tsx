import React from 'react';
import { History } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Booking } from '../types';

interface ExtendedBooking extends Booking {
  routes: {
    name: string;
  };
  second_route?: {
    name: string;
  };
}

export default function TripHistory() {
  const [bookings, setBookings] = React.useState<ExtendedBooking[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchBookings() {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            routes:route_id (name),
            second_route:second_route_id (name)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin text-blue-600">
            <History size={48} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Trip History</h2>
      
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No trips found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">
                    Route: {booking.routes?.name}
                    {booking.second_route && (
                      <>
                        {' → '}
                        <span className="text-blue-600">{booking.second_route.name}</span>
                      </>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    Points: {booking.points_deducted}
                  </p>
                  {booking.total_wait_time && (
                    <p className="text-sm text-blue-600">
                      Transfer wait time: {booking.total_wait_time} mins
                    </p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    booking.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : booking.status === 'confirmed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {new Date(booking.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}