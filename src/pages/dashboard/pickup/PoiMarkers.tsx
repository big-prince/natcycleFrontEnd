import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

type Poi ={ key: string, location: google.maps.LatLngLiteral }

const PoiMarkers = (props: {pois: Poi[]}) => {
  return (
    <>
      {props.pois.map( (poi: Poi) => (
        <AdvancedMarker
          key={poi.key}
          position={poi.location}>
        <Pin background={'#204C27'} glyphColor={'#D3FF5D'} borderColor={'#C8ECEE'} />
        </AdvancedMarker>
      ))}
    </>
  );
};

export default PoiMarkers;
