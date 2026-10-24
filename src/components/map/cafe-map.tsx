"use client";

// Leaflet touches `window`, so this module is only ever loaded lazily on the
// client (see ./index.tsx).

import Link from "next/link";
import { CircleMarker, MapContainer, Popup, TileLayer, useMapEvents } from "react-leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";

export interface MapCafe {
  id: string;
  name: string;
  neighborhood: string;
  lat: number;
  lng: number;
  matchaAvg: number | null;
  coffeeAvg: number | null;
  tastingCount: number;
}

const BOSTON: LatLngExpression = [42.3601, -71.0789];

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Green if matcha is the better-rated drink here, brown if coffee, hollow if untried. */
function markerStyle(cafe: MapCafe) {
  const tried = cafe.tastingCount > 0;
  const matchaWins = (cafe.matchaAvg ?? 0) >= (cafe.coffeeAvg ?? 0);
  const color = cssVar(matchaWins ? "--matcha" : "--coffee");
  return tried
    ? { color, fillColor: color, fillOpacity: 0.85, weight: 2 }
    : { color: cssVar("--muted"), fillColor: cssVar("--card"), fillOpacity: 1, weight: 2, dashArray: "3 3" };
}

function Tiles() {
  return (
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
  );
}

export function CafeMap({ cafes, height = 520 }: { cafes: MapCafe[]; height?: number }) {
  const bounds: LatLngBoundsExpression | undefined =
    cafes.length > 1 ? cafes.map((c) => [c.lat, c.lng] as [number, number]) : undefined;

  return (
    <MapContainer
      center={cafes.length === 1 ? [cafes[0].lat, cafes[0].lng] : BOSTON}
      zoom={cafes.length === 1 ? 15 : 12}
      bounds={bounds}
      boundsOptions={{ padding: [40, 40] }}
      scrollWheelZoom={false}
      style={{ height, width: "100%" }}
      className="rounded-[32px] border-8 border-card"
    >
      <Tiles />
      {cafes.map((cafe) => (
        <CircleMarker key={cafe.id} center={[cafe.lat, cafe.lng]} radius={9} pathOptions={markerStyle(cafe)}>
          <Popup>
            <div className="space-y-1">
              <Link href={`/cafes/${cafe.id}`} className="font-semibold text-matcha underline-offset-2 hover:underline">
                {cafe.name}
              </Link>
              <div className="text-xs">{cafe.neighborhood}</div>
              <div className="text-xs">
                {cafe.tastingCount === 0
                  ? "Not tried yet"
                  : `Matcha ${cafe.matchaAvg?.toFixed(1) ?? "–"} · Coffee ${cafe.coffeeAvg?.toFixed(1) ?? "–"}`}
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

function ClickToPick({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export function LocationPicker({
  value,
  onPick,
}: {
  value: { lat: number; lng: number } | null;
  onPick: (lat: number, lng: number) => void;
}) {
  return (
    <MapContainer
      center={value ? [value.lat, value.lng] : BOSTON}
      zoom={12}
      style={{ height: 280, width: "100%" }}
      className="rounded-[24px] border-4 border-card"
    >
      <Tiles />
      <ClickToPick onPick={onPick} />
      {value && (
        <CircleMarker
          center={[value.lat, value.lng]}
          radius={9}
          pathOptions={{ color: cssVar("--matcha"), fillColor: cssVar("--matcha"), fillOpacity: 0.85 }}
        />
      )}
    </MapContainer>
  );
}
