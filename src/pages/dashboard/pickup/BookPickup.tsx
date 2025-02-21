/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, FormEvent } from "react";
import { FaChevronRight } from "react-icons/fa";
import LocationApi from "../../../api/locationApi";
import PickUpApi from "../../../api/pickUpApi";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const itemTypesList = [
  {
    label: 'Metals',
    value: 'metals'
  },
  {
    label: 'Appliances',
    value: 'appliances'
  }
]
// metal and appliances item types
// const ItemTypes = ['Fridge', 'Iron', 'Microwave', 'Washing Machine', 'Others'];

const BookPickup = () => {
  const [searchParams] = useSearchParams();
  const [campaignId] = useState(searchParams.get("campaignId") || "")
  const [campaignName] = useState(searchParams.get("campaignName") || "")

  useEffect(() => {
    console.log('campaignId', campaignId);
    console.log('campaignName', campaignName);
  }, [campaignId, campaignName]);

  const [pickUpForm, setPickUpForm] = useState({
    location: "",
    date: "",
    timeStart: "",
    timeEnd: "",
    description: "",
    itemType: "",
  });

  const navigate = useNavigate();

  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const fetchLocations = async () => {
    setLoadingLocations(true);
    LocationApi.getLocations()
      .then((res) => {
        // console.log(res.data);
        setLocations(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoadingLocations(false);
      });
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleChange = (e: any) => {
    setPickUpForm({
      ...pickUpForm,
      [e.target.name]: e.target.value,
    });
  };

  const bookPickup = (e: FormEvent) => {
    if (loadingLocations) return;

    e.preventDefault();

    if (!pickUpForm.location) {
      return toast.error("Please select a location");
    }

    if (!pickUpForm.date) {
      return toast.error("Please select a date");
    }

    const payload = {
      ...pickUpForm,
      campaignId: campaignId || ""
    };
    console.log(payload);
    // return;

    PickUpApi.createPickUp(payload)
      .then((res) => {
        console.log(res);
        toast.success("Pickup booked successfully");
        navigate("/pickup/all");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="mb-20">
      <form onSubmit={bookPickup}>
        <h2 className="mt-8 text-2xl font-bold text-darkgreen">
          Book a Pickup
        </h2>

        {/* select location */}
        <div className="mt-4">
          <div className="flex justify-between">
            <label className="font-semibold">Select Location</label>
            <Link
              to="/locations"
              className="text-sm font-semibold text-darkgreen"
            >
              Add Location
            </Link>
          </div>
          <select
            name="location"
            onChange={handleChange}
            required
            className="input"
            value={pickUpForm.location}
          >
            <option value="">Select Location</option>
            {locations.map((location: any) => (
              <option key={location._id} value={location._id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4">
          <label className="font-semibold">Select Pickup Date</label>
          <input
            type="date"
            className="input"
            name="date"
            onChange={handleChange}
            required
            value={pickUpForm.date}
            // must  be future date
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* item type */}
        <div className="mt-4">
          <label className="font-semibold">Select Item Type</label>
          <select
            name="itemType"
            onChange={handleChange}
            required
            className="input"
            value={pickUpForm.itemType}
          >
            <option value="">Select Item Type</option>
            {
              itemTypesList.map((itemType: any) => (
                <option key={itemType.value} value={itemType.value}>
                  {itemType.label}
                </option>
              ))
            }
          </select>
        </div>

        <div className="mt-6">
          <label className="font-semibold">
            Details of  {pickUpForm.itemType.toUpperCase()}?
          </label>
          <textarea
            className="input"
            name="description"
            onChange={handleChange}
            required
            value={pickUpForm.description}
          />
        </div>

        <button
          type="submit"
          className="flex justify-between items-center p-4 py-4 mt-6 w-full bg-black rounded-2xl"
        >
          <p className="text-lg font-semibold text-green">Submit</p>
          <FaChevronRight className="text-white" />
        </button>
      </form>
    </div>
  );
};

export default BookPickup;
