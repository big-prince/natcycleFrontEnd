/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, FormEvent } from "react";
import { FaChevronRight } from "react-icons/fa";
import LocationApi from "../../../api/locationApi";
import PickUpApi from "../../../api/pickUpApi";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const BookPickup = () => {
  const [selectedRecyclables, setSelectedRecyclables] = useState<string[]>([]);

  const [searchParams] = useSearchParams();
  const [campaignId] = useState(searchParams.get("campaignId") || "")
  const [campaignName] = useState(searchParams.get("campaignName") || "")

  useEffect(() => {
    console.log('campaignId', campaignId);
    console.log('campaignName', campaignName);
  }, [campaignId, campaignName]);

  useEffect(() => {
    let getSelectedRecyclables = localStorage.getItem("selectedRecyclables");

    if (getSelectedRecyclables) {
      getSelectedRecyclables = JSON.parse(getSelectedRecyclables);
      console.log("__get___", getSelectedRecyclables);
    } else {
      return;
    }

    if (selectedRecyclables) {
      setSelectedRecyclables(getSelectedRecyclables as unknown as string[]);
    }
  }, []);

  const [items, setItems] = useState({
    plastic: 0,
    fabric: 0,
    glass: 0,
    paper: 0,
  });

  const handleItemChange = (e: any) => {
    setItems({
      ...items,
      [e.target.name]: parseInt(e.target.value),
    });
  };

  const [pickUpForm, setPickUpForm] = useState({
    // itemType: itemType,
    location: "",
    date: "",
    timeStart: "",
    timeEnd: "",
    description: "",
  });

  const itemAndQuestion = {
    plastic: "How many bottles do you want to recycle?",
    fabric: "How much fabric do you want to recycle? in kg",
    glass: "How many glass do you want to recycle? in kg",
    paper: "How many mixed items do you want to recycle?",
  };

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

    const payload = {
      ...pickUpForm,
      items,
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
        <h2 className="text-2xl font-bold mt-8 text-darkgreen">
          Book a Pickup
        </h2>

        {
          campaignName && (
            <div className="mt-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  To Support {campaignName}
                </h2>
              </div>
            </div>
          )
        }

        <div className="mt-4">
          {/* <label className="font-semibold pb-4">Enter Quantity of Items</label> */}

          {/* list of items */}
          <div className="grid grid-cols-4 gap-2">
            {selectedRecyclables.map((recyclable, index) => (
              <p
                key={index}
                className="font-medium bg-black text-white p-2 text-center rounded-full"
              >
                {recyclable.toUpperCase()}
              </p>
            ))}
          </div>

          {selectedRecyclables.map((recyclable, index) => (
            <div key={index} className="items-center gap-2 mt-4">
              <label className="font-medium">
                {/* {recyclable.toUpperCase()}  */}
                {itemAndQuestion[recyclable]}
              </label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-lg"
                name={recyclable}
                onChange={handleItemChange}
                required
                value={items[recyclable]}
                placeholder={itemAndQuestion[recyclable]}
              />
            </div>
          ))}
        </div>

        {/* select location */}
        <div className="mt-6">
          <div className="flex justify-between">
            <label className="font-semibold">Select Location</label>
            <Link
              to="/locations"
              className="text-darkgreen text-sm font-semibold"
            >
              Add Location
            </Link>
          </div>
          <select
            name="location"
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-lg"
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
        <div className="mt-6">
          <label className="font-semibold">Select Pickup Date</label>
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded-lg"
            name="date"
            onChange={handleChange}
            required
            value={pickUpForm.date}
            // must  be future date
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <p className="mt-4 text-sm font-medium">Select Available Time Range</p>
        {/* time input */}
        <div className="flex gap-2 justify-between">
          <div className="mt-0">
            <label className="text-sm">Start</label>
            <input
              type="time"
              className="w-full p-2 border border-gray-300 rounded-lg"
              name="timeStart"
              onChange={handleChange}
              required
              value={pickUpForm.timeStart}
            />
          </div>

          <div className="">
            <label className="text-sm">End</label>
            <input
              type="time"
              className="w-full p-2 border border-gray-300 rounded-lg"
              name="timeEnd"
              onChange={handleChange}
              required
              value={pickUpForm.timeEnd}
            />
          </div>
        </div>

        {/* how many bottles do you want to recycle */}
        {/* <div className="mt-6">
          <label className="text-sm">{itemQuestion}</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded-lg"
            name="description"
            onChange={handleChange}
            required
            value={pickUpForm.description}
          />
        </div> */}

        <button
          type="submit"
          className="bg-black p-4 py-4 rounded-2xl flex items-center justify-between w-full mt-6"
        >
          <p className="text-lg font-semibold text-green">Submit</p>
          <FaChevronRight className="text-white" />
        </button>
      </form>
    </div>
  );
};

export default BookPickup;
