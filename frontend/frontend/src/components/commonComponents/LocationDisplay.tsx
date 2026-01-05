import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapPin } from 'lucide-react';

type LocationDisplayProps = {
  latitude: number;
  longitude: number;
  locationName: string;
  hostelName: string;
};

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const LocationDisplay: React.FC<LocationDisplayProps> = ({
  latitude,
  longitude,
  locationName,
  hostelName
}) => {
  const position: [number, number] = [latitude, longitude];

  return (
    <div className="relative">
      <div className="bg-blue-50 border border-blue-200 rounded-t-lg p-3">
        <div className="flex items-center gap-2 text-blue-800">
          <MapPin className="w-4 h-4" />
          <p className="text-sm font-medium">Hostel Location</p>
        </div>
      </div>

      <div className="relative">
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: '300px', width: '100%' }}
          className="z-10"
          scrollWheelZoom={false}
          dragging={true}
          touchZoom={true}
          doubleClickZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          />
          <Marker position={position}>
            <Popup>
              <div className="text-sm">
                <p className="font-medium">{hostelName}</p>
                <p className="text-xs text-gray-600 mt-1">{locationName}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {latitude?.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="bg-gray-50 border-t border-gray-200 rounded-b-lg p-3">
        <p className="text-sm text-gray-700">{locationName}</p>
        <p className="text-xs text-gray-500 mt-1">
          Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
      </div>
    </div>
  );
};

export default LocationDisplay;