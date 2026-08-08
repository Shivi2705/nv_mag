import { MapContainer, TileLayer, Marker, Polyline, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// default marker icons reference missing assets under Vite bundling; rebuild manually
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function PositionMap({ center, groundTruth, estimatedTrack, errorRadiusM = 25 }) {
  const c = center || [23.0225, 72.5714];

  return (
    <div className="h-full w-full rounded overflow-hidden border border-border">
      <MapContainer center={c} zoom={16} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {groundTruth && (
          <Marker position={groundTruth}>
            <Popup>Ground truth location</Popup>
          </Marker>
        )}
        {estimatedTrack && estimatedTrack.length > 1 && (
          <Polyline positions={estimatedTrack} pathOptions={{ color: "#00F0FF", weight: 2.5 }} />
        )}
        {estimatedTrack && estimatedTrack.length > 0 && (
          <>
            <Marker position={estimatedTrack[estimatedTrack.length - 1]}>
              <Popup>Estimated position (EKF)</Popup>
            </Marker>
            <Circle
              center={estimatedTrack[estimatedTrack.length - 1]}
              radius={errorRadiusM}
              pathOptions={{ color: "#FB7185", fillColor: "#FB7185", fillOpacity: 0.12, weight: 1 }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}
