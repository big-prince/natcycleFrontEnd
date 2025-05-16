/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import dropOffLocationApi from "../../../api/dropOffLocationApi";
import { toast } from "react-toastify";
import DropOffApi from "../../../api/dropOffApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MdOutlineRefresh } from "react-icons/md";

interface Location {
  type: string;
  coordinates: number[];
}

export interface DropoffPoint {
  googleMapId: string;
  location: Location;
  _id: string;
  name: string;
  itemType: string;
  description: string;
  address: string;
  __v: number;
}

const itemTypesList = [
  {
    label: "Fabrics",
    value: "fabric",
  },
  {
    label: "Plastic Bottles",
    value: "plastic",
  },
  {
    label: "Food",
    value: "food",
  },
  {
    label: "Others",
    value: "others",
  },
];

const CreateDropOff = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [campaignId] = useState(searchParams.get("campaignId") || "");
  const [campaignName] = useState(searchParams.get("campaignName") || "");
  const typeFromQuery = searchParams.get("type") || "";

  const [loading, setLoading] = useState(false);
  const [dropOffForm, setDropOffForm] = useState({
    location: "",
    description: "",
    itemType: "",
    quantity: "",
  });

  // Set the initial itemType based on the query parameter
  useEffect(() => {
    if (dropOffForm.location) {
      const location = locations.find(
        (location) => location._id === dropOffForm.location
      );
      if (location) {
        setDropOffForm({
          ...dropOffForm,
          // itemType: location.itemType,
        });
      }
    }
  }, [dropOffForm.location]);

  const handleDropOffFormChange = (e: any) => {
    const { name, value } = e.target;

    setDropOffForm({
      ...dropOffForm,
      [name]: value,
    });
  };

  const handleDropOffFormSubmit = async (e: any) => {
    e.preventDefault();

    if (loadingLocations) {
      return toast.error("Please wait for locations to load");
    }

    // If no location is selected but locations are available, use the first one
    if (!dropOffForm.location && locations.length > 0) {
      setDropOffForm((prev) => ({
        ...prev,
        location: locations[0]._id,
      }));
      // Use the first location directly in form submission
      const locationToUse = locations[0]._id;

      if (!file) {
        return toast.error("Please upload a photo");
      }

      setLoading(true);
      console.log("FORM DATA with default location", {
        ...dropOffForm,
        location: locationToUse,
      });

      const formData = new FormData();
      formData.append("location", locationToUse);
      formData.append("description", dropOffForm.description);
      formData.append("itemQuantity", dropOffForm.quantity);
      formData.append("itemType", typeFromQuery);
      formData.append("file", file as Blob);

      if (campaignId) {
        formData.append("campaignId", campaignId);
      }

      DropOffApi.addDropOff(formData)
        .then((response) => {
          console.log(response.data);
          toast.success("Drop off created successfully");
          navigate("/home");
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
          toast.error("Error creating drop off");
        });

      return;
    }

    // Original code for when location is already selected
    if (!dropOffForm.location) {
      console.log(dropOffForm.location, "LOCATION");
      return toast.error("Please select a drop off location");
    }

    if (!file) {
      return toast.error("Please upload a photo");
    }

    setLoading(true);
    console.log("FORM DATA", dropOffForm);
    const formData = new FormData();
    formData.append("location", dropOffForm.location);
    formData.append("description", dropOffForm.description);
    formData.append("itemQuantity", dropOffForm.quantity);
    formData.append("itemType", typeFromQuery);
    formData.append("file", file as Blob);

    if (campaignId) {
      formData.append("campaignId", campaignId);
    }

    DropOffApi.addDropOff(formData)
      .then((response) => {
        console.log(response.data);
        toast.success("Drop off created successfully");
        navigate("/home");
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        toast.error("Error creating drop off");
      });
  };

  const [locations, setLocations] = useState<DropoffPoint[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) => reject(error)
      );
    });
  };

  // get nearest drop off locations using user's current location
  const getNearestDropOffLocations = async () => {
    setLoadingLocations(true);
    const userLocation = (await getUserLocation()) as {
      latitude: number;
      longitude: number;
    };

    if (!userLocation) {
      return toast.error("Error getting user location");
    }

    const data = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      distance: 0,
      itemType: typeFromQuery,
    };

    console.log(data, "GET LOCATION DATA");

    try {
      const response = await dropOffLocationApi.getNearestDropOffLocations(
        data
      );
      console.log(response.data);

      const locations = response.data.data;
      setLocations(locations);

      // Set the first location as default if available
      if (locations.length > 0) {
        setDropOffForm((prev) => ({
          ...prev,
          location: locations[0]._id,
          itemType: locations[0].itemType,
        }));
      }

      if (locations.length === 0) {
        console.log(locations.length, "LOCATION LENGTH");
        toast.info("No locations found. Expanding 300km");

        const data = {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          distance: 300000,
        };

        const response = await dropOffLocationApi.getNearestDropOffLocations(
          data
        );
        const extendedKmLocations = response.data.data;

        console.log("300km", extendedKmLocations);
        setLocations(extendedKmLocations);

        // Set the first location from expanded search as default if available
        if (extendedKmLocations.length > 0) {
          setDropOffForm((prev) => ({
            ...prev,
            location: extendedKmLocations[0]._id,
            itemType: extendedKmLocations[0].itemType,
          }));
        }

        if (extendedKmLocations.length === 0) {
          toast.info("No locations in 300km");
          setLoadingLocations(false);
          return;
        }
      }
      setLoadingLocations(false);
    } catch (error) {
      console.log(error);
      toast.error("Error fetching locations");
      setLoadingLocations(false);
    }
  };

  // get nearest drop off locations on component mount
  useEffect(() => {
    setLoading(false);
    getNearestDropOffLocations().then(() => {
      // Set the first location as default when locations are loaded
      if (locations.length > 0) {
        setDropOffForm((prev) => ({
          ...prev,
          location: locations[0]._id,
          itemType: locations[0].itemType,
        }));
      }
    });
  }, []);

  const handleRefreshLocations = () => {
    getNearestDropOffLocations();
  };

  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    setFile(file);
  };

  return (
    <div>
      <div className="container">
        <div className="row">
          <div className="mt-6 col-md-6 offset-md-3">
            {/* ITEM BAR */}
            <div className="flex justify-between mb-4">
              {itemTypesList.map((item) => (
                <p
                  key={item.label}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg cursor-pointer ${
                    item.value === typeFromQuery
                      ? "bg-darkgreen text-white"
                      : "bg-gray-200 text-darkgreen"
                  }`}
                  onClick={async () => {
                    // Set loading state
                    setLoadingLocations(true);

                    // Update the query parameter first
                    navigate(`/dropoff/create?type=${item.value}`);

                    // Reset all relevant states
                    setDropOffForm({
                      ...dropOffForm,
                      location: "",
                      // itemType: item.value,
                      quantity: "",
                    });
                    setFile(null);
                    setLocations([]);

                    // Get user location
                    try {
                      const userLocation = (await getUserLocation()) as {
                        latitude: number;
                        longitude: number;
                      };

                      if (!userLocation) {
                        setLoadingLocations(false);
                        return toast.error("Error getting user location");
                      }

                      // Prepare data with the selected item type
                      const data = {
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                        distance: 0,
                        itemType: item.value,
                      };

                      console.log(data, "GET LOCATION DATA FOR ITEM TYPE");

                      // Call API to get nearest drop-off locations for this item type
                      const response =
                        await dropOffLocationApi.getNearestDropOffLocations(
                          data
                        );
                      const locations = response.data.data;
                      setLocations(locations);

                      // Set the first location as default if available
                      if (locations.length > 0) {
                        setDropOffForm((prev) => ({
                          ...prev,
                          location: locations[0]._id,
                        }));
                      }

                      // If no locations found, expand search radius
                      if (locations.length === 0) {
                        toast.info("No locations found. Expanding 300km");
                        const expandedData = {
                          latitude: userLocation.latitude,
                          longitude: userLocation.longitude,
                          distance: 300000,
                          itemType: item.value,
                        };

                        const expandedResponse =
                          await dropOffLocationApi.getNearestDropOffLocations(
                            expandedData
                          );
                        const extendedKmLocations = expandedResponse.data.data;

                        console.log(
                          `300km locations for ${item.value}:`,
                          extendedKmLocations
                        );
                        setLocations(extendedKmLocations);

                        if (extendedKmLocations.length === 0) {
                          toast.info(
                            `No ${item.value} drop-off locations found within 300km`
                          );
                        }
                      }
                    } catch (error) {
                      console.error("Error fetching locations:", error);
                      toast.error(
                        `Error fetching ${item.value} drop-off locations`
                      );
                    } finally {
                      setLoadingLocations(false);
                    }
                  }}
                >
                  {item.value}
                </p>
              ))}
            </div>
            <h2 className="hidden mb-4 text-2xl font-bold text-darkgreen">
              Create Drop Off
            </h2>

            <div className="mb-2">
              {campaignName && campaignId && (
                <div>
                  <p className="px-4 py-4 mb-4 text-xl bg-black rounded-lg text-green">
                    Support Campaign: {campaignName}
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleDropOffFormSubmit} className="form">
              <div className="form-group">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-lg font-semibold">Drop-Off Locations</p>

                  <div className="flex items-center">
                    <p
                      className="text-sm font-medium cursor-pointer text-darkgreen"
                      onClick={() => handleRefreshLocations()}
                    >
                      Refresh
                    </p>

                    <div className="flex items-center">
                      <MdOutlineRefresh className="text-darkgreen" />
                    </div>
                  </div>
                </div>

                {/* info */}
                <div className=" hidden info">
                  <p className="text-xs text-gray-500">
                    Click the refresh button to get the nearest drop off
                    locations to you
                  </p>
                </div>

                <select
                  name="location"
                  id="location"
                  className="input"
                  value={dropOffForm.location}
                  onChange={handleDropOffFormChange}
                >
                  {locations.length === 0 && (
                    <option value="">Select Location</option>
                  )}
                  {locations &&
                    locations.length > 0 &&
                    locations.map((location) => (
                      <option key={location._id} value={location._id}>
                        {location.name} - {location.address}
                      </option>
                    ))}
                </select>
              </div>

              {/* item type select */}
              {/* <div className="hidden form-group">
                <label htmlFor="itemType">Item Type</label>
                <select
                  name="itemType"
                  id="itemType"
                  className="input"
                  value={dropOffForm.itemType}
                  onChange={handleDropOffFormChange}
                  required
                >
                  <option value="">Select Item Type</option>
                  {itemTypesList.map((item) => (
                    <option key={item.value} value={item.value}>
                      {typeFromQuery === item.value ? item.label : item.label}
                    </option>
                  ))}
                </select>
              </div> */}

              {/* special entry for item type */}
              {typeFromQuery === "others" && (
                <div className="form-group">
                  <label htmlFor="itemType">Item Type</label>
                  <input
                    type="text"
                    name="itemType"
                    id="itemType"
                    className="input"
                    placeholder="Enter item type"
                    onChange={handleDropOffFormChange}
                    required
                  />
                </div>
              )}

              {/* item quantity */}
              <div>
                <label htmlFor="quantity">
                  Quantity of{" "}
                  {dropOffForm.itemType === "fabrics" ||
                  dropOffForm.itemType === "plastic" ||
                  dropOffForm.itemType === "food"
                    ? `${dropOffForm.itemType} waste `
                    : "item"}
                </label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  className="input"
                  onChange={handleDropOffFormChange}
                />
              </div>

              <div className="hidden form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  name="description"
                  id="description"
                  className="input"
                  value={dropOffForm.description}
                  onChange={handleDropOffFormChange}
                ></textarea>
              </div>

              {/* file select with preview */}
              <div className="form-group">
                <label htmlFor="file">
                  Confirm your drop-off by uploading a receipt
                </label>
                <input
                  type="file"
                  name="file"
                  id="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              {file && (
                <div className="form-group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    style={{ width: "130px", height: "130px" }}
                    className="object-cover rounded-lg"
                  />
                </div>
              )}

              <button
                type="submit"
                className="mt-4 w-full text-green button bg-darkgreen"
                disabled={loading}
              >
                {loading ? "Loading..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDropOff;
