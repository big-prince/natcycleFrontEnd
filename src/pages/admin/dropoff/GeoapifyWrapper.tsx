/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  GeoapifyGeocoderAutocomplete,
  GeoapifyContext,
} from "@geoapify/react-geocoder-autocomplete";
import "@geoapify/geocoder-autocomplete/styles/minimal.css";
import { NormalizedPlaceData } from "../../../types";

// Define the allowed types for Geoapify's geocoder
type GeocoderType = "street" | "city" | "country" | "amenity" | "postcode";

interface GeoapifyWrapperProps {
  apiKey: string;
  initialValue?: string;
  onPlaceSelect: (data: NormalizedPlaceData | null) => void;
  placeholder?: string;
  filterByCountryCode?: string[];
  type?: GeocoderType;
}

const GeoapifyWrapper: React.FC<GeoapifyWrapperProps> = ({
  apiKey,
  initialValue,
  onPlaceSelect,
  placeholder = "Start typing an address...",
  type = "street",
}) => {
  const handleGeoapifyPlaceSelect = (selectedGeoapifyPlace: any) => {
    if (selectedGeoapifyPlace && selectedGeoapifyPlace.properties) {
      const { properties } = selectedGeoapifyPlace;
      const normalizedData: NormalizedPlaceData = {
        address: properties.formatted || "",
        latitude: properties.lat?.toString() || "",
        longitude: properties.lon?.toString() || "",
        name:
          properties.name ||
          properties.address_line1 ||
          (properties.formatted && properties.formatted.split(",")[0]) ||
          "",
        city: properties.city || "",
        country: properties.country || "",
        postalCode: properties.postcode || "",
        providerRawData: selectedGeoapifyPlace,
      };
      onPlaceSelect(normalizedData);
    } else {
      onPlaceSelect(null);
    }
  };

  return (
    <GeoapifyContext apiKey={apiKey}>
      <GeoapifyGeocoderAutocomplete
        placeholder={placeholder}
        value={initialValue || ""}
        placeSelect={handleGeoapifyPlaceSelect}
        type={type}
      />
    </GeoapifyContext>
  );
};

export default GeoapifyWrapper;
