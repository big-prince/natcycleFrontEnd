/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { AdvancedMarker } from "@vis.gl/react-google-maps";

type Poi = {
  key: string;
  location: google.maps.LatLngLiteral;
  type: string;
};

interface PoiMarkersProps {
  pois: Poi[];
  onCLick: (poi: Poi) => void;
  renderMarker?: (poi: Poi) => JSX.Element;
}

const PoiMarkers = ({ pois, onCLick, renderMarker }: PoiMarkersProps) => {
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);

  return (
    <>
      {pois.map((poi) => (
        <AdvancedMarker
          key={poi.key}
          position={poi.location}
          onClick={() => onCLick(poi)}
        >
          {renderMarker ? (
            renderMarker(poi)
          ) : (
            <div
              onMouseOver={() => setHoveredMarker(poi.key)}
              onMouseOut={() => setHoveredMarker(null)}
              className={`p-2 bg-blue-500 rounded-full text-white ${
                hoveredMarker === poi.key ? "scale-125 z-10" : ""
              } transition-transform duration-200`}
            >
              📍
            </div>
          )}
        </AdvancedMarker>
      ))}
    </>
  );
};

export default PoiMarkers;
