import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import dropOffLocationApi from "../../../api/dropOffLocationApi";
import { DropoffPoint } from "../dropoff/CreateDropOff";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import PoiMarkers from "../../dashboard/pickup/PoiMarkers";

type Poi = { key: string; location: google.maps.LatLngLiteral };

const Where = () => {
  const GOOGLE_API_KEY = import.meta.env.VITE_APP_GOOGLE_API_KEY;

  const [locations, setLocations] = useState<DropoffPoint[]>([]);
  const [markers, setMarkers] = useState<Poi[]>([]);
  // const [loadingLocations, setLoadingLocations] = useState(false);
  // const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<DropoffPoint | null>(
    null
  );

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // setUserLocation({ latitude, longitude });
          resolve({ latitude, longitude });
        },
        (error) => reject(error)
      );
    });
  };

  const [selectedItemType, setSelectedItemType] = useState<string | null>(null);

  // handle select item type if already selected remove
  const handleSelectItemType = (itemType: string) => {
    if (selectedItemType === itemType) {
      setSelectedItemType(null);

      getNearestDropOffLocations();
    } else {
      setSelectedItemType(itemType);

      getNearestDropOffLocations(itemType);
    }
  };

  const onMarkerCLick = (marker: Poi) => {
    console.log(marker);
    const location = locations.find(
      (location) => location.googleMapId === marker.key
    );
    if (!location) {
      return;
    }
    console.log(location);

    setSelectedLocation(location);
  };

  const getNearestDropOffLocations = async (itemType?: string) => {
    try {
      const userLocation = (await getUserLocation()) as {
        latitude: number;
        longitude: number;
      };

      const data = {
        latitude: userLocation.latitude || 0,
        longitude: userLocation.longitude || 0,
        distance: 0,
        itemType: itemType || "",
      };

      const response = await dropOffLocationApi.getNearestDropOffLocations(
        data
      );
      console.log(response.data, "locations where");

      setLocations(response.data.data);

      const newMarkers: Poi[] = response.data.data.map((location) => {
        return {
          key: location.googleMapId || "",
          location: {
            lat: location.location?.coordinates[0],
            lng: location.location?.coordinates[1],
          },
        };
      });

      console.log(newMarkers, "markers");

      setMarkers(newMarkers);
    } catch (error) {
      console.log(error);
      toast.error("Error fetching locations");
      // setLoadingLocations(false);
    }
  };

  useEffect(() => {
    getNearestDropOffLocations();
  }, []);

  return (
    <div className="relative h-full">
      <div
        className="absolute inset-0 top-0 right-0 bottom-0 left-0 z-20 map"
        style={{ width: "", height: "100vh" }}
      >
        {markers ? (
          <APIProvider
            apiKey={GOOGLE_API_KEY}
            onLoad={() => console.log("loaded")}
          >
            <Map
              defaultZoom={5}
              defaultCenter={{
                lat: 40.860664,
                lng: -100.208138,
              }}
              mapId="bbc0380a31cc144a"
            >
              {markers && <PoiMarkers pois={markers} onCLick={onMarkerCLick} />}
            </Map>
          </APIProvider>
        ) : (
          <div className="flex justify-center items-center h-full">
            Loading...
          </div>
        )}
      </div>

      <div className="relative top-0 right-0 bottom-0 left-0 z-40 px-2 pt-2 w-full">
        <div className="p-4 bg-white rounded-lg">
          <p className="text-xl font-bold md:text-2xl">
            Where to recycle, drop-off?
          </p>

          <div className="flex flex-wrap gap-2 mt-2 text-sm">
            <p
              className={`px-3 py-1 rounded-lg border font-medium ${
                selectedItemType === "food" ? "bg-green-500 text-white" : ""
              }`}
              onClick={() => handleSelectItemType("food")}
            >
              Fabrics
            </p>

            <p
              className={`px-3 py-1 rounded-lg border font-medium ${
                selectedItemType === "plastic" ? "bg-green-500 text-white" : ""
              }`}
              onClick={() => handleSelectItemType("plastic")}
            >
              Plastic Bottles
            </p>
          </div>

          <p className="mt-4 text-xs italic font-semibold text-darkgreen">
            Click on a marker to see more details
          </p>
        </div>
      </div>

      {selectedLocation ? (
        <div className="absolute top-[60vh] right-0 left-0 w-full  bottom-2 z-40 pt-4  px-2">
          <div className="p-4 bg-white rounded-lg">
            <p className="mb-1 text-xl font-bold">{selectedLocation?.name}</p>
            <p className="text-sm">{selectedLocation?.address}</p>
            <div>
              <p className="inline-block text-sm font-medium text-gray-700">
                Item Types:
              </p>

              <p className="inline-block px-2 my-2 ml-2 text-sm font-medium uppercase rounded-xl border-2 border-darkgreen">
                {selectedLocation?.itemType}
              </p>
            </div>
            <p className="text-sm font-medium">
              {selectedLocation?.description}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Where;
