import { useEffect, useState } from 'react'
import dropOffLocationApi from '../../../api/dropOffLocationApi';
import { toast } from 'react-toastify';
import DropOffApi from '../../../api/dropOffApi';
import { useNavigate } from 'react-router-dom';

const ItemTypes = ['Plastic', 'Fabric', 'Glass', 'Paper', 'Others'];

interface Location {
  type: string;
  coordinates: number[];
}

export interface DropoffPoint {
  location: Location;
  _id: string;
  name: string;
  description: string;
  address: string;
  __v: number;
}

const CreateDropOff = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dropOffForm, setDropOffForm] = useState({
    location: "",
    description: "",
    itemType: "",
  });

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
    }

    console.log(data);

    try {
      const response = await dropOffLocationApi.getNearestDropOffLocations(data);
      console.log(response.data);
      setLocations(response.data.data);
      // toast.success("Locations fetched successfully");
    }
    catch (error) {
      console.log(error);
      toast.error("Error fetching locations");
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

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    setFile(file);
  };


  return (
    <div>
      <div className="container">
        <div className="row">
          <div className="col-md-6 offset-md-3 mt-6">
            <h2 className="text-xl font-bold mb-4">Create Drop Off</h2>

            <form onSubmit={handleDropOffFormSubmit}
              className='form'
            >
              <div className="form-group">
                <div className="flex justify-between items-center mb-2">
                  <p className='font-bold text-lg'>Get Locations</p>

                  <div>
                    <button className=" font-bold text-darkgreen" onClick={() => handleRefreshLocations()}>
                      Refresh Locations
                    </button>
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
                  className="form-control"
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
                  className="form-control"
                  value={dropOffForm.itemType}
                  onChange={handleDropOffFormChange}
                  required
                >
                  <option value="">Select Item Type</option>
                  {ItemTypes.map((itemType) => (
                    <option key={itemType} value={itemType}>
                      {itemType}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  name="description"
                  id="description"
                  className="form-control"
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
                      style={{ width: "100px", height: "100px" }}
                      className='rounded-lg'
                    />
                  </div>
                )
              }

              <button
                type="submit"
                className="button bg-green w-full mt-4"
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