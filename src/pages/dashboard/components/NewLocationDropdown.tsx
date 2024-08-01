/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Accordion from "@radix-ui/react-accordion";
import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { toast } from "react-toastify";
import LocationApi from "../../../api/locationApi";
import { BiChevronDown } from "react-icons/bi";
import Utils from "../../../utils";
import Autocomplete from "react-google-autocomplete";

import axios from "axios";

const GOOGLE_API_KEY = import.meta.env.VITE_APP_GOOGLE_API_KEY;

const NewLocationDropdown = ({fetchNotifications}: any) => {
  const [loading, setLoading] = useState(false);

  const [showDropdown, setShowDropdown] = useState('');

  const [query, setQuery] = useState("");
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
      },
    };

    const response = await axios(options);
    console.log(response);
    return;
  };

  const [googleResults, setGoogleResults] = useState();
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
      googleResults,
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

  const setLocation = (place: any) => {
    console.log(place);
    if (!place.address_components) return;
    setGoogleResults(place);

    setAddress(place.formatted_address);

    const findCountry = place.address_components.find((c: any) =>
      c.types.includes("country")
    );

    console.log(findCountry);

    const city =
      place.address_components[
        place.address_components.indexOf(findCountry) - 2
      ].long_name;

    const state =
      place.address_components[
        place.address_components.indexOf(findCountry) - 1
      ].long_name;

    setCountry(findCountry.long_name);
    setState(state);
    setCity(city);

    setLat(place.geometry.location.lat());
    setLng(place.geometry.location.lng());
  };

  return (
    <div>
      <div className="hidden">
        {/* query input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter location"
        />
        <button onClick={() => callGoogleApi(query)}>Search</button>
      </div>
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
              <h3 className="text-lg font-medium">Add Location</h3>
              <p className="text-3xl">
                <BiChevronDown className="text-red-500 cursor-pointer" />
              </p>
            </div>
          </Accordion.Trigger>

          <Accordion.Content className="">
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
                <div className="mt-2">
                  <label className="text-sm font-medium">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="w-full p-2 border border-gray-300 rounded-lg hidden"
                    placeholder="Enter address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />

                  <Autocomplete
                    apiKey={GOOGLE_API_KEY}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                    onPlaceSelected={(place) => {
                      // console.log(place);
                      setLocation(place);
                    }}
                    options={{
                      // types: ["(regions)"],
                      componentRestrictions: { country: "us" },
                      // fields: ["address_components", "geometry"],
                    }}
                    defaultValue="Select Location"
                  />
                </div>

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
                  disabled = {loading}
                  className="bg-black p-4 py-4 rounded-2xl flex items-center justify-between w-full mt-6 cursor-pointer"
                  onClick={() => addLocation()}
                >
                  <p className="text-lg font-semibold text-green">
                    {
                      loading ? "Adding location..." : "Add Location"
                    }
                  </p>
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
