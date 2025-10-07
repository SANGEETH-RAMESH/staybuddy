
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Hostel } from '../../interface/Hostel';
import { MapPin } from 'lucide-react';

interface LocationPickerProps {
  onLocationSelect: (location: string, lat: number, lng: number) => void;
  selectedLocation?: string;
  initialLatitude?: number;
  initialLongitude?: number;
  hostels?:Hostel[]
};
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const LocationMarker = ({
  onSelect,
  initialPosition,
}: {
  onSelect: (lat: number, lng: number, address: string) => void;
  initialPosition: { lat: number; lng: number } | null;
}) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(initialPosition);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    if (initialPosition && initialPosition.lat !== 0 && initialPosition.lng !== 0) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });
      setIsGeocoding(true);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`
        );
        const data = await res.json();
        const address = data.display_name || 'Unknown location';
        onSelect(lat, lng, address);
      } catch (err) {
        console.log(err)
        onSelect(lat, lng, 'Unknown location');
      } finally {
        setIsGeocoding(false);
      }
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>
        <div className="text-sm">
          <p className="font-medium">Selected Location</p>
          <p className="text-xs text-gray-600 mt-1">
            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </p>
        </div>
      </Popup>
    </Marker>
  ) : null;
};



const HostelMarkers = ({ hostels }: { hostels: Hostel[] }) => {
    const hostelIcon = L.divIcon({
      html: `
      <div style="
        background-color: #3B82F6;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        🏠
      </div>
    `,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    return (
      <>
        {hostels.map((hostel) => {
          if (!hostel.latitude || !hostel.longitude) return null;

          return (
            <Marker
              key={hostel._id}
              position={[hostel.latitude, hostel.longitude]}
              icon={hostelIcon}
            >
              <Popup>
                <div className="text-sm max-w-xs">
                  <div className="font-medium text-gray-900 mb-1">{hostel.hostelname}</div>
                  <div className="text-xs text-gray-600 mb-2">{hostel.address}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-medium">₹{hostel.bedShareRoom}/month</span>
                    {hostel.rating && (
                      <span className="text-yellow-500 text-xs">★ {hostel.rating}</span>
                    )}
                  </div>
                  {hostel.photos && (
                    <img
                      src={hostel.photos}
                      alt={hostel.hostelname}
                      className="w-full h-20 object-cover rounded mt-2"
                    />
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </>
    );
  };


const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  selectedLocation,
  initialLatitude = 0,
  initialLongitude = 0,
  hostels = [],
}) => {
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const initialPosition = (initialLatitude !== 0 && initialLongitude !== 0)
    ? { lat: initialLatitude, lng: initialLongitude }
    : null;

  useEffect(() => {
    if (initialPosition) {
      setCurrentPosition(initialPosition);
    }
  }, [initialLatitude, initialLongitude]);

  const mapCenter: [number, number] = initialPosition
    ? [initialPosition.lat, initialPosition.lng]
    : [10.8505, 76.2711];

  const mapZoom = initialPosition ? 15 : 7;

  return (
    <div className="relative">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-t-lg p-3">
        <div className="flex items-center gap-2 text-blue-800">
          <MapPin className="w-4 h-4" />
          <p className="text-sm font-medium">
            {initialPosition
              ? "Current location shown. Click anywhere on the map to change location"
              : "Click anywhere on the map to select location"
            }
          </p>
        </div>
      </div>

      {/* Map */}
      <div className="relative">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '400px', width: '100%' }}
          className="z-10"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          />
          <LocationMarker
            initialPosition={initialPosition}
            onSelect={(lat, lng, address) => {
              setCurrentPosition({ lat, lng });
              setIsGeocoding(false);
              onLocationSelect(address, lat, lng);
            }}
          />
          <HostelMarkers hostels={hostels} />
        </MapContainer>

        {/* Loading overlay for geocoding */}
        {isGeocoding && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
            <div className="flex items-center gap-2 text-[#31AFEF]">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#31AFEF] border-t-transparent"></div>
              <span className="text-sm">Getting location...</span>
            </div>
          </div>
        )}
      </div>

      {/* Current coordinates display */}
      {(selectedLocation || initialPosition) && (currentPosition || initialPosition) && (
        <div className="bg-gray-50 border-t border-gray-200 rounded-b-lg p-2">
          <p className="text-xs text-gray-600">
            Coordinates: {(currentPosition || initialPosition)?.lat.toFixed(6)}, {(currentPosition || initialPosition)?.lng.toFixed(6)}
          </p>
          {selectedLocation && (
            <p className="text-xs text-gray-700 mt-1">
              Location: {selectedLocation}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;