import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, ZoomControl } from 'react-leaflet';
import { Map as MapIcon, Building, Navigation, Bus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Stop } from '../types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const stopIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const universityIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// University coordinates (Greater Noida)
const UNIVERSITY_CENTER: [number, number] = [28.4506, 77.5842];
const INITIAL_ZOOM = 15;

// Campus buildings and facilities
const CAMPUS_LOCATIONS = [
  {
    name: 'Main Academic Block',
    position: [28.4506, 77.5842],
    type: 'academic'
  },
  {
    name: 'Library',
    position: [28.4510, 77.5845],
    type: 'academic'
  },
  {
    name: 'Student Center',
    position: [28.4503, 77.5839],
    type: 'facility'
  },
  {
    name: 'Sports Complex',
    position: [28.4500, 77.5835],
    type: 'sports'
  },
  {
    name: 'Hostel Block A',
    position: [28.4512, 77.5848],
    type: 'residence'
  },
  {
    name: 'Hostel Block B',
    position: [28.4514, 77.5850],
    type: 'residence'
  },
  {
    name: 'Cafeteria',
    position: [28.4508, 77.5840],
    type: 'facility'
  }
];

export default function RouteMap() {
  const [stops, setStops] = React.useState<Stop[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [userLocation, setUserLocation] = React.useState<[number, number] | null>(null);

  React.useEffect(() => {
    async function fetchStops() {
      try {
        const { data, error } = await supabase
          .from('stops')
          .select('*')
          .order('name');

        if (error) throw error;
        setStops(data || []);
      } catch (error) {
        console.error('Error fetching stops:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStops();
  }, []);

  const getUserLocation = React.useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location');
      }
    );
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin text-blue-600">
            <MapIcon size={48} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <Building className="h-7 w-7 mr-3 text-blue-600" />
        University Campus Map
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Campus Information */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2 text-blue-600" />
              Campus Facilities
            </h3>
            <div className="space-y-2">
              {CAMPUS_LOCATIONS.map((location) => (
                <div
                  key={location.name}
                  className="bg-white p-3 rounded-lg shadow-sm border border-gray-100"
                >
                  <div className="font-medium text-gray-900">{location.name}</div>
                  <div className="text-sm text-gray-500 capitalize">{location.type}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="text-sm font-medium text-blue-900 flex items-center">
              <Navigation className="h-4 w-4 mr-2" />
              Map Navigation
            </h3>
            <ul className="mt-2 text-sm text-blue-700 space-y-1">
              <li>• Red marker: University buildings</li>
              <li>• Blue markers: Shuttle stops</li>
              <li>• Blue circle: Campus boundary</li>
              <li>• Click markers for details</li>
            </ul>
            <button
              onClick={getUserLocation}
              className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-600 bg-white hover:bg-blue-50"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Show My Location
            </button>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-4 text-white">
            <div className="flex items-center mb-3">
              <Bus className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-semibold">Shuttle Service</h3>
            </div>
            <p className="text-sm text-blue-100 mb-3">
              Regular shuttle service available at all marked stops during operating hours.
            </p>
            <div className="text-sm bg-white/10 rounded-lg p-3">
              <div className="font-medium mb-1">Operating Hours:</div>
              <div>Mon-Fri: 7:00 AM - 9:00 PM</div>
              <div>Sat-Sun: 8:00 AM - 6:00 PM</div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-3 bg-gray-50 rounded-xl overflow-hidden" style={{ height: '700px' }}>
          <MapContainer
            center={UNIVERSITY_CENTER}
            zoom={INITIAL_ZOOM}
            zoomControl={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="bottomright" />

            {/* Campus boundary */}
            <Circle
              center={UNIVERSITY_CENTER}
              radius={500}
              pathOptions={{
                color: '#3B82F6',
                fillColor: '#3B82F6',
                fillOpacity: 0.1
              }}
            />

            {/* Campus buildings */}
            {CAMPUS_LOCATIONS.map((location) => (
              <Marker
                key={location.name}
                position={location.position as [number, number]}
                icon={universityIcon}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-medium text-gray-900">{location.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{location.type}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Shuttle stops */}
            {stops.map((stop) => (
              <Marker
                key={stop.id}
                position={[stop.latitude, stop.longitude]}
                icon={stopIcon}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-medium text-gray-900">{stop.name}</h4>
                    <p className="text-sm text-gray-600">Shuttle Stop</p>
                    <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                      Location: {stop.latitude.toFixed(6)}, {stop.longitude.toFixed(6)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* User location */}
            {userLocation && (
              <Marker position={userLocation}>
                <Popup>
                  <div className="p-2">
                    <h4 className="font-medium text-gray-900">Your Location</h4>
                    <p className="text-sm text-gray-600">
                      {userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}