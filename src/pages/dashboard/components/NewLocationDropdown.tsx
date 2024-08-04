/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Accordion from "@radix-ui/react-accordion";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { toast } from "react-toastify";
import LocationApi from "../../../api/locationApi";
import { BiChevronDown } from "react-icons/bi";
import Utils from "../../../utils";
// import Autocomplete from "react-google-autocomplete";
import { FaSearchLocation } from "react-icons/fa";
import axios from "axios";

const GOOGLE_API_KEY = import.meta.env.VITE_APP_GOOGLE_API_KEY;

interface AddressComponent {
  longText: string;
  shortText: string;
  types: string[];
  languageCode: string;
}

interface Location {
  latitude: number;
  longitude: number;
}

interface Place {
  id: string;
  formattedAddress: string;
  addressComponents: AddressComponent[];
  location: Location;
  googleMapsUri: string;
  displayName: {
    text: string;
  };
}

const NewLocationDropdown = ({ fetchNotifications }: any) => {
  const [loading, setLoading] = useState(false);

  const [showDropdown, setShowDropdown] = useState("");

  const [query, setQuery] = useState("");

  const [googleApiResults, setGoogleApiResults] = useState<Place[]>();

  const callGoogleApi = async (query) => {
    const options = {
      method: "post",
      url: "https://places.googleapis.com/v1/places:searchText?alt=json",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask":
          "places.id,places.formattedAddress,places.displayName,places.addressComponents,places.googleMapsUri,places.location,nextPageToken",
      },
      data: {
        textQuery: query,
        pageSize: 5,
      },
    };

    const response = await axios(options);
    setGoogleApiResults(response.data.places);

    console.log(response);
    return;
  };

  // on click of a google api result
  const handleGoogleApiResultClick = (place: Place) => {
    console.log(place);
    setGoogleApiResults([]);

    setAddress(place.formattedAddress);

    // setLocationName(`${place.displayName.text} - ${place.formattedAddress}`);
    setQuery(`${place.displayName.text} - ${place.formattedAddress}`);

    setAddress(`${place.displayName.text} - ${place.formattedAddress}`);

    const findCountry = place.addressComponents.find((c: any) =>
      c.types.includes("country")
    );

    if (!findCountry) {
      toast.error("Country not found");
      return;
    }

    console.log(findCountry);

    const city =
      place.addressComponents[place.addressComponents.indexOf(findCountry) - 2]
        .longText;

    const state =
      place.addressComponents[place.addressComponents.indexOf(findCountry) - 1]
        .longText;

    setCountry(findCountry.longText);
    setState(state);
    setCity(city);

    setLat(place.location.latitude);
    setLng(place.location.longitude);
  };

  // const [googleResults, setGoogleResults] = useState();
  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("United States");
  const [city, setCity] = useState("");

  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);

  const us_states = Utils.us_states;

  const addLocation = () => {
    // if (!locationName || !address || !state || !country || !city) {
    //   toast.error("Please fill all fields");
    //   return;
    // }

    const newLocation = {
      name: locationName,
      address,
      state,
      country,
      city,
      latitude: lat,
      longitude: lng,
      googleApiResults,
    };

    console.log(newLocation);
    setLoading(true);
    LocationApi.createLocation(newLocation)
      .then((res) => {
        console.log(res);
        toast.success("Location added successfully");
        setLoading(false);
        setShowDropdown("");
        fetchNotifications();
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error adding location");
        setLoading(false);
      });
  };

  // listen to input changes and call google api after 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      callGoogleApi(query);
    }, 1000);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <Accordion.Root
        type="single"
        collapsible
        value={showDropdown}
        onValueChange={(value) => setShowDropdown(value)}
      >
        <Accordion.Item
          key="1"
          className="border-b border-gray-200"
          value="item-1"
        >
          <Accordion.Trigger className="w-full">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Add New Location</h3>
              <p className="text-3xl">
                <BiChevronDown className="text-red-500 cursor-pointer" />
              </p>
            </div>
          </Accordion.Trigger>

          <Accordion.Content className="bg-white p-2">
            <form className="w-full">
              <div className="flex flex-col">
                <div className="mt-6">
                  <label className="text-sm font-medium">Location Name</label>
                  <input
                    type="text"
                    name="name"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Enter name"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                  />
                </div>

                <div className="">
                <label className="text-sm font-medium">Location</label>

                  <div className="flex items-center">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Enter location"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    <FaSearchLocation
                      onClick={() => callGoogleApi(query)}
                      className="text-2xl text-gray-400 cursor-pointer -ml-8"
                    />
                  </div>

                  <div className="mt-4 absolute bg-white">
                    {googleApiResults &&
                      googleApiResults.map((place: Place) => (
                        <div
                          key={place.id}
                          onClick={() => handleGoogleApiResultClick(place)}
                        >
                          <p className="cursor-pointer bg-white shadow-md p-2 text-sm mb-2">
                            {place.displayName.text}
                            <span>{place.formattedAddress}</span>
                          </p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* <div className="mt-2">
                  <label className="text-sm font-medium">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Enter address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div> */}

                {/* city  */}
                <div className="mt-2">
                  <label className="text-sm font-medium">City</label>
                  <input
                    type="text"
                    name="city"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Enter city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div className="mt-2">
                  <label className="text-sm font-medium">State</label>

                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  >
                    <option value="">Select State</option>
                    {us_states.map((state, index) => (
                      <option key={index} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-2">
                  <label className="text-sm font-medium">Country</label>
                  <input
                    type="text"
                    name="country"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Enter country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={true}
                  />
                </div>
                <button
                  disabled={loading}
                  className="w-full text-darkgreen border-darkgreen border-2 rounded-lg p-2 mt-4 flex justify-center items-center"
                  onClick={() => addLocation()}
                >
                    {loading ? "Adding location..." : "Add Location"}
                  
                  <FaPlus className="text-white" />
                </button>
              </div>
            </form>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
};

export default NewLocationDropdown;
