/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Dialog from "@radix-ui/react-dialog";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { FaMapLocationDot } from "react-icons/fa6";
import PoiMarkers from "../../dashboard/pickup/PoiMarkers";

type Poi = { key: string; location: google.maps.LatLngLiteral; type: string };

const PickupMap = ({ userPickups }: any) => {
  const GOOGLE_API_KEY = import.meta.env.VITE_APP_GOOGLE_API_KEY;

  const [markers, setMarkers] = useState([]);

  const newMarkers: Poi[] = userPickups?.map((address: any) => {
    return {
      key: "stuff",
      location: {
        lat: address.location?.latitude,
        lng: address.location?.longitude,
      },
      type: address.type,
    };
  });

  // filter out locations without lat and lng
  const data = newMarkers.filter((poi) => poi.location.lat && poi.location.lng);

  useEffect(() => {
    if (!userPickups) return;

    const newMarkers: Poi[] = userPickups?.map((address: any) => {
      return {
        key: "stuff",
        location: {
          lat: address.location?.latitude,
          lng: address.location?.longitude,
        },
      };
    });

    // filter out locations without lat and lng
    const data = newMarkers.filter(
      (poi) => poi.location.lat && poi.location.lng
    );

    console.log("newMarkers", data);

    setMarkers(data as any);
  }, [userPickups]);

  return (
    <div>
      <Dialog.Root>
        <Dialog.Trigger className="fixed bottom-28 right-10 bg-darkgreen p-4 rounded-2xl z-[200]">
          <FaMapLocationDot className="bottom-0 text-4xl cursor-pointer text-green" />
        </Dialog.Trigger>
        <Dialog.Overlay className="fixed inset-0 bottom-0 bg-black bg-opacity-50" />

        <Dialog.Content
          className="z-50"
          style={{
            zIndex: 100000,
          }}
        >
          <Dialog.Title>Dialog Title</Dialog.Title>
          <Dialog.Close>Close</Dialog.Close>

          <div
            className="map"
            style={{ width: "", height: "60vh", zIndex: 1000 }}
          >
            <APIProvider
              apiKey={GOOGLE_API_KEY}
              onLoad={() => console.log("loaded")}
            >
              {" "}
              <Map
                defaultZoom={5}
                // defaultCenter={{ lat: -33.860664, lng: 151.208138 }}
                // make united state
                defaultCenter={{ lat: 40.7128, lng: -74.006 }}
                mapId="bbc0380a31cc144a"
              >
                {markers && (
                  <PoiMarkers
                    pois={data}
                    onCLick={(poi) => console.log("Clicked on marker:", poi)}
                  />
                )}
              </Map>
            </APIProvider>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};

export default PickupMap;
