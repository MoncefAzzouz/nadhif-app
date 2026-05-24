'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icons in Leaflet with Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
}

function LocationMarker({ latitude, longitude, onChange }: LocationPickerProps) {
  const map = useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    // If we have external lat/lng updates, fly to them if map is mounted
    if (latitude && longitude) {
      map.setView([latitude, longitude], map.getZoom(), { animate: false });
    }
  }, [latitude, longitude, map]);

  return latitude && longitude ? (
    <Marker position={[latitude, longitude]} icon={customIcon} />
  ) : null;
}

export default function LocationPicker({ latitude, longitude, onChange }: LocationPickerProps) {
  // Default to Algiers if no coordinates are provided
  const defaultCenter: [number, number] = [36.7538, 3.0588]; 

  return (
    <div className="h-[250px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner z-0 relative">
      <MapContainer
        center={latitude && longitude ? [latitude, longitude] : defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker latitude={latitude} longitude={longitude} onChange={onChange} />
      </MapContainer>
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 shadow-md pointer-events-none z-[1000] border border-slate-100">
        Click to pin location
      </div>
    </div>
  );
}
