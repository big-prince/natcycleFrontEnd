import React from "react";
import GeoapifyWrapper from "./GeoapifyWrapper";
import { NormalizedPlaceData } from "../../../types";

// Match the type definition with GeoapifyWrapper
type GeocoderType = "street" | "city" | "country" | "amenity" | "postcode";
export type AddressProviderType = "geoapify" | "google"; // Add more as needed

interface AddressAutocompleteProps {
  provider: AddressProviderType;
  apiKey: string;
  initialValue?: string;
  onPlaceSelect: (data: NormalizedPlaceData | null) => void;
  placeholder?: string;
  geoapifyOptions?: {
    filterByCountryCode?: string[];
    type?: GeocoderType;
  };
  // googleOptions?: { /* ... */ };
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  provider,
  apiKey,
  initialValue,
  onPlaceSelect,
  placeholder,
  geoapifyOptions,
}) => {
  switch (provider) {
    case "geoapify":
      return (
        <GeoapifyWrapper
          apiKey={apiKey}
          initialValue={initialValue}
          onPlaceSelect={onPlaceSelect}
          placeholder={placeholder}
          filterByCountryCode={geoapifyOptions?.filterByCountryCode}
          type={geoapifyOptions?.type}
        />
      );
    // case 'google':
    //   return (
    //     <GooglePlacesWrapper
    //       apiKey={apiKey}
    //       initialValue={initialValue}
    //       onPlaceSelect={onPlaceSelect}
    //       placeholder={placeholder}
    //       // Pass googleOptions
    //     />
    //   );
    default:
      console.error(`Address provider "${provider}" is not supported.`);
      return (
        <div className="text-red-500 p-2 bg-red-100 rounded">
          Error: Unsupported address provider.
        </div>
      );
  }
};

export default AddressAutocomplete;
