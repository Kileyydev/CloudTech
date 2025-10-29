'use client';

import { MapContainer, TileLayer, Marker, Popup, type MapContainerProps } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ---------------------------------------------------------------------
// Fix Leaflet default marker icon (Next.js bundles break the default URLs)
// ---------------------------------------------------------------------
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Location {
  name: string;
  position: [number, number];
  isHeadquarters?: boolean;
}

interface MapComponentProps {
  mapCenter: [number, number];
  locations: Location[];
}

/**
 * Leaflet map that shows one or many pins.
 * Works in Next.js with `dynamic(..., { ssr: false })`.
 */
export default function MapComponent({ mapCenter, locations }: MapComponentProps) {
  return (
    <MapContainer
      center={mapCenter}
      zoom={12}
      style={{ height: '100%', width: '100%', borderRadius: '8px' }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {locations.map((loc) => (
        <Marker
          key={loc.name}
          position={loc.position}
          icon={loc.isHeadquarters ? createHqIcon() : defaultIcon}
        >
          <Popup>
            <strong>{loc.name}</strong>
            {loc.isHeadquarters && <br />}
            {loc.isHeadquarters && <small>Headquarters</small>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}


function createHqIcon() {
  return new L.Icon({
    iconUrl: '/images/hq-marker.png', // place in public/images/
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
}