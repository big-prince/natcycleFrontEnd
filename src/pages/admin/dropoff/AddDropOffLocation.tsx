import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import dropOffLocationApi from '../../../api/dropOffLocationApi';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface LocationFormData {
  name: string;
  itemType: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
}

interface Place {
  addressComponents: {
    longText: string;
    shortText: string;
  }[];
  id: string;
  displayName: {
    text: string;
  };
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  googleMapsUri: string;
}

const GOOGLE_API_KEY = import.meta.env.VITE_APP_GOOGLE_API_KEY;

const AddDropOffLocation = () => {
  const navigate = useNavigate();
  const [loadingPage, setLoadingPage] = useState(false);

  const [searchParams] = useSearchParams();

  const [isEditing, setIsEditing] = useState(false);
  const [buttonText, setButtonText] = useState('Add Location');

  useEffect(() => {
    const locationId = searchParams.get('id');
    console.log(locationId);

    if (locationId) {
      setButtonText('Update Location');
      setLoadingPage(true);
      dropOffLocationApi.getDropOffLocationById(locationId)
        .then((res) => {
          setIsEditing(true);
          console.log(res.data.data);
          const data = res.data.data;
          setLoadingPage(false);
          setFormData({
            name: data.name,
            itemType: data.itemType,
            description: data.description,
            address: data.address,
            latitude: data.location.coordinates[1].toString(),
            longitude: data.location.coordinates[0].toString()
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [searchParams]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [googleApiResults, setGoogleApiResults] = useState<Place[]>([]);
  
  const handleGoogleResultSelect = (place) => {
    setFormData(prev => ({
     ...prev,
      name: place.displayName.text,
      address: place.formattedAddress,
      latitude: place.location.latitude,
      longitude: place.location.longitude
    }));
  };

  const callGoogleApi = async (query) => {
    if (!query) {
      toast.error('Please enter a location query');
      return;
    }

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

    if (!response.data.places) {
      toast.error('No results found');
      return;
    }

    console.log(response.data.places);
    setGoogleApiResults(response.data.places);

    setFormData(prev => ({
      ...prev,
      name: response.data.places[0].displayName.text,
      address: response.data.places[0].formattedAddress,
      latitude: response.data.places[0].location.latitude,
      longitude: response.data.places[0].location.longitude
    }));
    return;
  };

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

  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    itemType: '',
    description: '',
    address: '',
    latitude: '',
    longitude: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);

    const data = {
      ...formData,
      googleMapsUri: googleApiResults[0]?.googleMapsUri || '',
      googleMapId: googleApiResults[0]?.id || ''
    }

    setLoading(true);

    if (isEditing) {
      const locationId = searchParams.get('id');
      if (!locationId) {
        toast.error('Location ID not found');
        setLoading(false);
        return
      }
      dropOffLocationApi.updateDropOffLocation(locationId, data)
        .then(() => {
          toast.success('Location updated successfully');
          navigate('/admin/dropoff-locations');
        })
        .catch((error) => {
          toast.error(error.response.data.message || 'An error occurred');
          setLoading(false);
        });
      return;
    }

    dropOffLocationApi.addDropOffLocation(data)
      .then(() => {
        toast.success('Location added successfully');
        navigate('/admin/dropoff-locations');
      })
      .catch((error) => {
        toast.error(error.response.data.message || 'An error occurred');
        setLoading(false);
      });
  }

  if (loadingPage) {
    return <p>Loading...</p>
  }

  return (
    <div>
      <h1
        className='text-2xl font-bold'
      >
        {isEditing ? 'Edit Drop Off Location' : 'Add Drop Off Location'}
      </h1>

      <div className='mt-8 mb-4'>
        <label htmlFor="searchQuery"
          className='text-lg font-bold'
        >Search for Address</label>

        <div className="flex items-center">
          <input
            className='mt-0 mb-0 input'
            type="text"
            name="searchQuery"
            id="searchQuery"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search for address using Google Maps API'
          />
          <button
            className='block p-3 w-20 h-full text-white bg-black rounded-xl'
            onClick={() => callGoogleApi(searchQuery)}>Search</button>
        </div>
      </div>

      <div>
        <label htmlFor="googleApiResults"
          className='font-medium'
        >Location Search Results</label>
        <p className='text-sm font-bold text-darkgreen'>
          Found {googleApiResults.length} Locations
        </p>
        <select className='input' name="googleApiResults" id="googleApiResults" 
          onChange={(e) => handleGoogleResultSelect(googleApiResults.find((result) => result.formattedAddress === e.target.value))}
        >
          <option value="">Select Address</option>
          {
            googleApiResults.map((result) => (
              <option key={result.id} value={result.formattedAddress}>
                {result.formattedAddress}
              </option>
            ))
          }
        </select>
      </div>

      <form className='form'
        onSubmit={handleSubmit}
      >
        <div>
          <label htmlFor="name">Name</label>
          <input className='input' type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required />
        </div>
        <div>
          <label htmlFor="itemType">Item Type</label>
          <select className='input' name="itemType" id="itemType" value={formData.itemType} onChange={handleInputChange} required>
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
        <div>
          <label htmlFor="description">Description</label>
          <textarea className='input' name="description" id="description" value={formData.description} onChange={handleInputChange} required />
        </div>
        <div>
          <label htmlFor="address">Address</label>
          <input className='input' type="text" name="address" id="address" value={formData.address} onChange={handleInputChange} required />
        </div>
        <div>
          <label htmlFor="latitude">latitude</label>
          <input className='input' type="text" name="latitude" id="latitude" value={formData.latitude} onChange={handleInputChange} required />
        </div>
        <div>
          <label htmlFor="longitude">Longitude</label>
          <input className='input' type="text" name="longitude" id="longitude" value={formData.longitude} onChange={handleInputChange} required />
        </div>
        <button
          className='text-white bg-black button'
          type="submit">
          {
            loading ? 'Loading...' : buttonText
          }
        </button>
      </form>
    </div>
  )
}

export default AddDropOffLocation