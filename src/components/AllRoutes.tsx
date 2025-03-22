import React from 'react';
import { Bus, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { calculateRouteDistance, calculateDistance } from '../utils/routeOptimization';
import type { Route, Stop } from '../types';

interface RouteWithStops extends Route {
  stops: Stop[];
  totalDistance: number;
}

export default function AllRoutes() {
  const [routes, setRoutes] = React.useState<RouteWithStops[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRoutes() {
      try {
        const { data: routesData, error: routesError } = await supabase
          .from('routes')
          .select('*')
          .order('name');

        if (routesError) throw routesError;

        const { data: routeStopsData, error: routeStopsError } = await supabase
          .from('route_stops')
          .select(`
            route_id,
            stop_id,
            stop_order,
            stops (*)
          `)
          .order('stop_order');

        if (routeStopsError) throw routeStopsError;

        // Group stops by route
        const stopsByRoute = routeStopsData.reduce((acc, rs) => {
          if (!acc[rs.route_id]) {
            acc[rs.route_id] = [];
          }
          acc[rs.route_id].push(rs.stops);
          return acc;
        }, {} as Record<string, Stop[]>);

        // Combine routes with their stops and calculate distances
        const routesWithStops = routesData.map(route => {
          const stops = stopsByRoute[route.id] || [];
          const totalDistance = parseFloat(calculateRouteDistance(stops).toFixed(2));
          return {
            ...route,
            stops,
            totalDistance
          };
        });

        setRoutes(routesWithStops);
      } catch (error) {
        console.error('Error fetching routes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRoutes();
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">All Available Routes</h2>
      
      <div className="space-y-8">
        {routes.map((route) => (
          <div key={route.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{route.name}</h3>
                <p className="text-gray-600">{route.description}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  Total Distance: <span className="font-medium text-blue-600">{route.totalDistance} km</span>
                </div>
                <div className="text-sm text-gray-500">
                  Estimated Time: <span className="font-medium">{route.estimated_time} mins</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">Peak Hours: {route.peak_hours.join(', ')}</div>
              
              <div className="relative">
                <div className="absolute left-4 inset-y-0 w-0.5 bg-blue-200"></div>
                <div className="space-y-4 pl-8">
                  {route.stops.map((stop, index) => (
                    <div key={stop.id} className="relative">
                      <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">{stop.name}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          📍 {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                        </div>
                        {index < route.stops.length - 1 && (
                          <div className="text-xs text-blue-600 mt-1">
                            {calculateDistance(
                              stop.latitude,
                              stop.longitude,
                              route.stops[index + 1].latitude,
                              route.stops[index + 1].longitude
                            ).toFixed(2)} km to next stop
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}