import React from 'react';
import { Navigation, MapPin, AlertTriangle } from 'lucide-react';
import type { Stop } from '../types';
import { calculateDistance } from '../utils/routeOptimization';

interface LocationServicesProps {
  stops: Stop[];
  onStopSelect: (stopId: string) => void;
}

export default function LocationServices({ stops, onStopSelect }: LocationServicesProps) {
  const [userLocation, setUserLocation] = React.useState<GeolocationCoordinates | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [nearbyStops, setNearbyStops] = React.useState<(Stop & { distance: number })[]>([]);

  const getUserLocation = React.useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      setUserLocation(position.coords);

      // Calculate distances to all stops
      const stopsWithDistances = stops.map(stop => ({
        ...stop,
        distance: calculateDistance(
          position.coords.latitude,
          position.coords.longitude,
          stop.latitude,
          stop.longitude
        ) || Infinity
      }));

      // Sort by distance and get the 3 nearest stops
      const nearest = stopsWithDistances
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);

      setNearbyStops(nearest);
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Please allow location access to find nearby stops');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information is unavailable');
            break;
          case err.TIMEOUT:
            setError('Location request timed out');
            break;
          default:
            setError('An unknown error occurred');
        }
      } else {
        setError('Failed to get your location');
      }
    } finally {
      setLoading(false);
    }
  }, [stops]);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
      <div className="flex items-start space-x-4">
        <div className="bg-blue-100 rounded-lg p-3">
          <Navigation className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            Find Nearby Stops
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Use your current location to find the closest shuttle stops
          </p>

          {error && (
            <div className="mt-3 flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          {userLocation && nearbyStops.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-3">
                Your location: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {nearbyStops.map(stop => (
                  <button
                    key={stop.id}
                    onClick={() => onStopSelect(stop.id)}
                    className="flex items-center p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <MapPin className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 text-sm">
                        {stop.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {stop.distance.toFixed(2)} km away
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!userLocation && (
            <button
              onClick={getUserLocation}
              disabled={loading}
              className="mt-3 inline-flex items-center px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Navigation className="h-4 w-4 mr-2 animate-spin" />
                  Getting your location...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 mr-2" />
                  Detect My Location
                </>
              )}
            </button>
          )}

          {userLocation && (
            <button
              onClick={getUserLocation}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700"
            >
              Refresh location
            </button>
          )}
        </div>
      </div>
    </div>
  );
}