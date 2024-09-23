/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, FormEvent } from "react";
import { FaChevronRight } from "react-icons/fa";
import LocationApi from "../../../api/locationApi";
import PickUpApi from "../../../api/pickUpApi";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const BookPickup = () => {
  const [searchParams] = useSearchParams();
  const [itemType] = useState(searchParams.get("item") || "plastic");

  // const recyclables = ["plastic", "fabric", "glass", "paper"];

  const [items, setItems] = useState({
    plastic: 0,
    fabric: 0,
    glass: 0,
    paper: 0,
  });

  const handleItemChange = (e: any) => {
    setItems({
      ...items,
      [e.target.name]: e.target.value,
    });
  };

  const [pickUpForm, setPickUpForm] = useState({
    itemType: itemType,
    location: "",
    date: "",
    timeStart: "",
    timeEnd: "",
    description: "",
  });

  const question = [
    "How many bottles do you want to recycle?",
    "How much fabric do you want to recycle? in kg",
    "How many glass do you want to recycle? in kg",
    "How many mixed items do you want to recycle?",
    "How many fabric do you want to recycle? in kg",
  ];

  const [itemQuestion, setItemQuestion] = useState(question[0]);

  if (itemQuestion) (
    console.log(itemQuestion)
  )

  useEffect(() => {
    switch (pickUpForm.itemType) {
      case "plastic":
        setItemQuestion(question[0]);
        break;
      case "fabric":
        setItemQuestion(question[1]);
        break;
      case "glass":
        setItemQuestion(question[2]);
        break;
      case "mixed":
        setItemQuestion(question[3]);
        break;
    }
  }, [itemType, pickUpForm.itemType]);

  const navigate = useNavigate();

  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const fetchLocations = async () => {
    setLoadingLocations(true);
    LocationApi.getLocations()
      .then((res) => {
        console.log(res.data);
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
    setPickUpForm({
      ...pickUpForm,
      itemType: itemType,
    });

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

    PickUpApi.createPickUp(pickUpForm)
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
    <div>
      <form onSubmit={bookPickup}>
        <h2 className="text-2xl font-bold mt-8 text-darkgreen">Book a Pickup</h2>

        <div className="mt-4">
          <label className="font-semibold pb-4">Enter Quantity of Items</label>
          {/* <select
            name="itemType"
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={pickUpForm.itemType}
          >
            {recyclables.map((recyclable) => (
              <option key={recyclable} value={recyclable}>
                {
                  recyclable.charAt(0).toUpperCase() +
                    recyclable.slice(1)
                }
              </option>
            ))}
          </select> */}
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex items-center gap-2">
              <label className="font-medium">Glass</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-lg"
                name="glass"
                onChange={handleItemChange}
                required
                value={items.glass}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="font-medium">Plastic</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-lg"
                name="plastic"
                onChange={handleItemChange}
                required
                value={items.plastic}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="font-medium">Fabric</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-lg"
                name="fabric"
                onChange={handleItemChange}
                required
                value={items.fabric}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="font-medium">Paper</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-lg"
                name="paper"
                onChange={handleItemChange}
                required
                value={items.paper}
              />
            </div>
          </div>
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
