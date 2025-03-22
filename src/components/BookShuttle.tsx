import React from 'react';
import { MapPin, Clock, Bus, AlertTriangle, Navigation, Calendar, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { calculateDistance, calculateRouteDistance } from '../utils/routeOptimization';
import LocationServices from './LocationServices';
import type { Stop, Route, StopWithDistance } from '../types';

interface RouteWithStops extends Route {
  stops: Stop[];
  distance: number;
  isTransfer?: boolean;
  transferPoint?: Stop;
}

// University coordinates (Greater Noida)
const UNIVERSITY_LOCATION = {
  latitude: 28.4506,
  longitude: 77.5842,
  name: "University Campus"
};

export default function BookShuttle() {
  const [stops, setStops] = React.useState<Stop[]>([]);
  const [routes, setRoutes] = React.useState<Route[]>([]);
  const [routeStops, setRouteStops] = React.useState<Record<string, Stop[]>>({});
  const [loading, setLoading] = React.useState(true);
  const [fromStop, setFromStop] = React.useState('');
  const [toStop, setToStop] = React.useState('');
  const [departureTime, setDepartureTime] = React.useState('');
  const [availableRoutes, setAvailableRoutes] = React.useState<RouteWithStops[]>([]);

  React.useEffect(() => {
    async function fetchStopsAndRoutes() {
      try {
        const [stopsResponse, routesResponse, routeStopsResponse] = await Promise.all([
          supabase.from('stops').select('*').order('name'),
          supabase.from('routes').select('*').order('name'),
          supabase.from('route_stops')
            .select(`
              route_id,
              stop_id,
              stop_order,
              stops (*)
            `)
            .order('stop_order')
        ]);

        if (stopsResponse.error) throw stopsResponse.error;
        if (routesResponse.error) throw routesResponse.error;
        if (routeStopsResponse.error) throw routeStopsResponse.error;

        setStops(stopsResponse.data || []);
        setRoutes(routesResponse.data || []);

        const stopsByRoute = (routeStopsResponse.data || []).reduce((acc, rs) => {
          if (!acc[rs.route_id]) {
            acc[rs.route_id] = [];
          }
          if (rs.stops) {
            acc[rs.route_id].push(rs.stops);
          }
          return acc;
        }, {} as Record<string, Stop[]>);

        setRouteStops(stopsByRoute);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStopsAndRoutes();
  }, []);

  // Update available routes whenever from or to stop changes
  const updateAvailableRoutes = React.useCallback(() => {
    if (fromStop && toStop) {
      const fromStopData = stops.find(s => s.id === fromStop);
      const toStopData = stops.find(s => s.id === toStop);

      if (!fromStopData || !toStopData) return;

      // Find direct routes
      const directRoutes = routes.flatMap(route => {
        const routeStopsList = routeStops[route.id] || [];
        const hasFromStop = routeStopsList.some(stop => stop.id === fromStop);
        const hasToStop = routeStopsList.some(stop => stop.id === toStop);
        
        if (!hasFromStop || !hasToStop) return [];

        const fromIndex = routeStopsList.findIndex(stop => stop.id === fromStop);
        const toIndex = routeStopsList.findIndex(stop => stop.id === toStop);
        
        const relevantStops = routeStopsList.slice(
          Math.min(fromIndex, toIndex),
          Math.max(fromIndex, toIndex) + 1
        );
        
        const distance = calculateRouteDistance(relevantStops);
        if (distance === null) return [];

        return [{
          ...route,
          distance,
          stops: relevantStops
        }];
      });

      // Find transfer routes
      const transferRoutes = routes.flatMap(route1 => {
        const route1Stops = routeStops[route1.id] || [];
        return routes.flatMap(route2 => {
          const route2Stops = routeStops[route2.id] || [];
          
          // Find common stops between routes
          const transferStops = route1Stops.filter(stop1 =>
            route2Stops.some(stop2 => stop2.id === stop1.id)
          );

          return transferStops.flatMap(transferStop => {
            if (
              route1Stops.some(s => s.id === fromStop) &&
              route2Stops.some(s => s.id === toStop)
            ) {
              const route1Distance = calculateRouteDistance(
                route1Stops.slice(
                  route1Stops.findIndex(s => s.id === fromStop),
                  route1Stops.findIndex(s => s.id === transferStop.id) + 1
                )
              );

              const route2Distance = calculateRouteDistance(
                route2Stops.slice(
                  route2Stops.findIndex(s => s.id === transferStop.id),
                  route2Stops.findIndex(s => s.id === toStop) + 1
                )
              );

              if (route1Distance === null || route2Distance === null) return [];

              return [{
                ...route1,
                name: `${route1.name} → ${route2.name}`,
                description: `Transfer at ${transferStop.name}`,
                distance: route1Distance + route2Distance,
                stops: [
                  ...route1Stops.slice(
                    route1Stops.findIndex(s => s.id === fromStop),
                    route1Stops.findIndex(s => s.id === transferStop.id) + 1
                  ),
                  ...route2Stops.slice(
                    route2Stops.findIndex(s => s.id === transferStop.id) + 1,
                    route2Stops.findIndex(s => s.id === toStop) + 1
                  )
                ],
                isTransfer: true,
                transferPoint: transferStop,
                estimated_time: route1.estimated_time + route2.estimated_time,
                peak_hours: [...new Set([...route1.peak_hours, ...route2.peak_hours])]
              }];
            }
            return [];
          });
        });
      });

      const allRoutes = [...directRoutes, ...transferRoutes]
        .sort((a, b) => a.distance - b.distance);

      setAvailableRoutes(allRoutes);
    } else {
      setAvailableRoutes([]);
    }
  }, [fromStop, toStop, routes, routeStops, stops]);

  React.useEffect(() => {
    updateAvailableRoutes();
  }, [fromStop, toStop, updateAvailableRoutes]);

  const handleBookRoute = async (routeId: string, points: number) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase.from('bookings').insert({
        user_id: userData.user.id,
        route_id: routeId,
        start_stop_id: fromStop,
        end_stop_id: toStop,
        points_deducted: points,
        status: 'pending',
        booking_time: departureTime || new Date().toISOString()
      });

      if (error) throw error;

      setFromStop('');
      setToStop('');
      setDepartureTime('');
      setAvailableRoutes([]);

      alert('Booking successful!');
    } catch (error) {
      console.error('Error booking route:', error);
      alert('Failed to book route. Please try again.');
    }
  };

  const getSelectedStop = (stopId: string) => {
    return stops.find(stop => stop.id === stopId);
  };

  const getDistanceFromUniversity = (stop: Stop) => {
    return calculateDistance(
      UNIVERSITY_LOCATION.latitude,
      UNIVERSITY_LOCATION.longitude,
      stop.latitude,
      stop.longitude
    );
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin text-blue-600">
            <Bus size={48} />
          </div>
        </div>
      </div>
    );
  }

  const fromStopDetails = fromStop ? getSelectedStop(fromStop) : null;
  const toStopDetails = toStop ? getSelectedStop(toStop) : null;

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <Bus className="h-7 w-7 mr-3 text-blue-600" />
        Book Campus Shuttle
      </h2>

      {/* Location Services */}
      <LocationServices stops={stops} onStopSelect={setFromStop} />
      
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* From Stop Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Location
            </label>
            <div className="relative">
              <select
                className="block w-full pl-10 pr-4 py-3 border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                value={fromStop}
                onChange={(e) => setFromStop(e.target.value)}
              >
                <option value="">Select pickup location</option>
                {stops.map((stop) => {
                  const distance = getDistanceFromUniversity(stop);
                  return (
                    <option key={stop.id} value={stop.id}>
                      {stop.name} ({distance?.toFixed(2)} km from campus)
                    </option>
                  );
                })}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            {fromStopDetails && (
              <div className="mt-2 text-sm text-gray-500 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {fromStopDetails.latitude.toFixed(4)}, {fromStopDetails.longitude.toFixed(4)}
              </div>
            )}
          </div>

          {/* To Stop Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination
            </label>
            <div className="relative">
              <select
                className="block w-full pl-10 pr-4 py-3 border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                value={toStop}
                onChange={(e) => setToStop(e.target.value)}
              >
                <option value="">Select destination</option>
                {stops.map((stop) => {
                  const distance = getDistanceFromUniversity(stop);
                  return (
                    <option key={stop.id} value={stop.id} disabled={stop.id === fromStop}>
                      {stop.name} ({distance?.toFixed(2)} km from campus)
                    </option>
                  );
                })}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            {toStopDetails && (
              <div className="mt-2 text-sm text-gray-500 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {toStopDetails.latitude.toFixed(4)}, {toStopDetails.longitude.toFixed(4)}
              </div>
            )}
          </div>
        </div>

        {/* Available Routes */}
        {fromStop && toStop && (
          <>
            {/* Departure Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departure Time
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  className="block w-full pl-10 pr-4 py-3 border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Bus className="h-5 w-5 mr-2 text-blue-600" />
                Available Routes
              </h3>
              
              <div className="space-y-4">
                {availableRoutes.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                    <Bus className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No routes available for the selected stops</p>
                  </div>
                ) : (
                  availableRoutes.map((route) => (
                    <div
                      key={route.id}
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                            {route.name}
                            {route.isTransfer && (
                              <span className="ml-2 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                Transfer Required
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{route.description}</p>
                          
                          {route.isTransfer && (
                            <div className="mt-3 flex items-center text-sm text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Transfer point: {route.transferPoint?.name}
                            </div>
                          )}

                          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="bg-gray-50 px-3 py-2 rounded-lg">
                              <div className="text-xs text-gray-500">Distance</div>
                              <div className="font-medium text-gray-900">
                                {route.distance.toFixed(2)} km
                              </div>
                            </div>
                            <div className="bg-gray-50 px-3 py-2 rounded-lg">
                              <div className="text-xs text-gray-500">Duration</div>
                              <div className="font-medium text-gray-900">
                                {route.estimated_time} mins
                              </div>
                            </div>
                            <div className="bg-gray-50 px-3 py-2 rounded-lg">
                              <div className="text-xs text-gray-500">Peak Hours</div>
                              <div className="font-medium text-gray-900">
                                {route.peak_hours.join(', ')}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <div className="text-sm font-medium text-gray-900 mb-2">Route Details:</div>
                            <div className="relative">
                              <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-blue-200"></div>
                              <div className="space-y-3 ml-6">
                                {route.stops.map((stop, index) => {
                                  const nextStop = route.stops[index + 1];
                                  const distance = nextStop
                                    ? calculateDistance(
                                        stop.latitude,
                                        stop.longitude,
                                        nextStop.latitude,
                                        nextStop.longitude
                                      )
                                    : null;

                                  return (
                                    <div key={`${stop.id}-${index}`} className="relative">
                                      <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
                                      <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center">
                                            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="font-medium text-gray-900">
                                              {stop.name}
                                            </span>
                                          </div>
                                          {route.isTransfer && route.transferPoint?.id === stop.id && (
                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                              Transfer Point
                                            </span>
                                          )}
                                        </div>
                                        {distance !== null && index < route.stops.length - 1 && (
                                          <div className="mt-1 text-xs text-blue-600">
                                            {distance.toFixed(2)} km to next stop
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="ml-6 flex flex-col items-end">
                          <div className="text-2xl font-bold text-blue-600 mb-2">
                            {Math.ceil(route.estimated_time / 5)} points
                          </div>
                          <button
                            onClick={() => handleBookRoute(route.id, Math.ceil(route.estimated_time / 5))}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-all"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </form>
    </div>
  );
}