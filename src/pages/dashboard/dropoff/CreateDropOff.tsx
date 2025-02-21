/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import dropOffLocationApi from '../../../api/dropOffLocationApi';
import { toast } from 'react-toastify';
import DropOffApi from '../../../api/dropOffApi';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
    label: 'Fabric',
    value: 'fabric'
  },
  {
    label: 'Plastic Bottles',
    value: 'plastic'
  }
]

const CreateDropOff = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [campaignId] = useState(searchParams.get("campaignId") || "")
  const [campaignName] = useState(searchParams.get("campaignName") || "")


  const [loading, setLoading] = useState(false);
  const [dropOffForm, setDropOffForm] = useState({
    location: "",
    description: "",
    itemType: "",
  });

  useEffect(() => {
    if (dropOffForm.location) {
      const location = locations.find((location) => location._id === dropOffForm.location);
      if (location) {
        setDropOffForm({
          ...dropOffForm,
          itemType: location.itemType,
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

    if (!dropOffForm.location) {
      return toast.error("Please select a drop off location");
    }

    if (!file) {
      return toast.error("Please upload a photo");
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("location", dropOffForm.location);
    formData.append("description", dropOffForm.description);
    formData.append("itemType", dropOffForm.itemType);
    formData.append("file", file as Blob);

    if (campaignId) {
      formData.append("campaignId", campaignId);
    }

    DropOffApi.addDropOff(formData)
      .then((response) => {
        console.log(response.data);
        toast.success("Drop off created successfully");
        // setDropOffForm({
        //   location: "",
        //   description: "",
        //   itemType: "",
        // });
        navigate('/home');
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
    const userLocation = await getUserLocation() as { latitude: number, longitude: number };

    if (!userLocation) {
      return toast.error("Error getting user location");
    }

    const data = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      distance: 90000,
    }

    console.log(data);

    try {
      const response = await dropOffLocationApi.getNearestDropOffLocations(data);
      console.log(response.data);

      const locations = response.data.data;
      setLocations(locations);

      if (locations.length === 0) {
        toast.info("No locations found. Expanding 300km");
        const data = {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          distance: 300000,
        }

        const response = await dropOffLocationApi.getNearestDropOffLocations(data);
        const extendedKmLocations = response.data.data;

        console.log('300km', extendedKmLocations)
        setLocations(extendedKmLocations);

        if (extendedKmLocations.length === 0) {
          toast.info("No locations in 300km");
          setLoadingLocations(false);
          return;
        }
      }
      setLoadingLocations(false);
    }
    catch (error) {
      console.log(error);
      toast.error("Error fetching locations");
      setLoadingLocations(false);
    }
  };

  useEffect(() => {
    setLoading(false);
    getNearestDropOffLocations();
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
            <h2 className="mb-4 text-2xl font-bold text-darkgreen">Create Drop Off</h2>

            <div className='mb-2'>
              {
                campaignName && campaignId && (
                  <div>
                    <p className="px-4 py-4 mb-4 text-xl bg-black rounded-lg text-green">
                      Support Campaign: {campaignName}
                    </p>
                  </div>
                )
              }
            </div>

            <form onSubmit={handleDropOffFormSubmit}
              className='form'
            >
              <div className="form-group">
                <div className="flex justify-between items-center mb-2">
                  <p className='text-lg font-semibold'>Get Drop-Off Locations</p>

                  <div className="flex items-center">
                    <p className="text-sm font-medium cursor-pointer text-darkgreen" onClick={() => handleRefreshLocations()}>
                      Refresh Locations
                    </p>

                    <div className="flex items-center">
                      <MdOutlineRefresh className="text-darkgreen" />
                    </div>
                  </div>
                </div>

                {/* info */}
                <div className="info">
                  <p
                    className="text-xs text-gray-500"
                  >Click the refresh button to get the nearest drop off locations to you</p>
                </div>

                <select
                  name="location"
                  id="location"
                  className="input"
                  value={dropOffForm.location}
                  onChange={handleDropOffFormChange}
                >
                  <option value="">Select Drop Off Location</option>
                  {locations && locations.length > 0 &&
                    locations.map((location) => (
                      <option key={location._id} value={location._id}>
                        {location.name} - {location.address}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
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
                  {
                    itemTypesList.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))
                  }
                </select>
              </div>

              <div className="form-group">
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
                  Confirm Drop Off by uploading a photo
                </label>
                <input
                  type="file"
                  name="file"
                  id="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              {
                file && (
                  <div className="form-group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      style={{ width: "130px", height: "130px" }}
                      className='object-cover rounded-lg'
                    />
                  </div>
                )
              }

              <button
                type="submit"
                className="mt-4 w-full text-green button bg-darkgreen"
                disabled={loading}
              >
                {loading ? "Creating Drop Off..." : "Create Drop Off"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateDropOff