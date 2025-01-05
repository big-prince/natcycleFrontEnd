/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import LocationApi from "../../api/locationApi";
// import AddLocation from "./components/AddLocation";
import CoolLoading from "./components/Loading";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import NewLocationDropdown from "./components/NewLocationDropdown";
import { FaPlus } from "react-icons/fa6";

const Locations = () => {
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);

  const fetchNotifications = async () => {
    setLoading(true);
    LocationApi.getLocations()
      .then((res) => {
        // console.log(res.data);
        setLocations(res.data);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error fetching locations");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDelete = (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this location?");
    if (!confirm) return;

    LocationApi.deleteLocation(id)
      .then((_) => {
        fetchNotifications();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const [showDropdown, setShowDropdown] = useState("");

  return (
    <>
      <div className="flex justify-between mt-4 mb-2">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Locations</h2>
        </div>

        <div>
          <button
            className="font-bold text-black px-4 py-2 rounded-lg flex items-center"
            onClick={() => {
              setShowDropdown("item-1");
            }}
          >
            <FaPlus className="mr-2" />
            Add Location
          </button>
        </div>
      </div>

      <div>
        <NewLocationDropdown
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          fetchNotifications={fetchNotifications}
        />
      </div>

      <div>
        {locations.map((location: any) => (
          <div
            key={location._id}
            className="bg-white p-4 rounded-lg shadow-md mt-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold">{location.name}</h3>
                <p className="text-gray-500">{location.address}</p>

                <div className="flex">
                  <p className="text-zinc-800 text-sm mr-2">{location.city}</p>
                  <p className="text-gray-700 text-sm font-medium">
                    {location.state}
                  </p>
                </div>
              </div>
              <div>
                <button className="bg-primary text-white px-4 py-2 rounded-lg hidden">
                  Edit
                </button>
                <button
                  className="text-red-500 px-4 py-2 rounded-lg text-sm"
                  onClick={() => handleDelete(location._id)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}

        {loading && <CoolLoading />}
      </div>

      <div className="mt-6">
        <p className="text-xl font-semibold">Upcoming Pickup</p>
        <div className="bg-white p-4 rounded-lg mt-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Plastic Bottles</h1>
              <p>Today at 12:00 PM</p>
              <p>12 bottles</p>
            </div>
            <div>
              <p className="text-green-800 font-semibold">Completed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 text-center">
        <Link to="/pickup/all" className="text-darkgreen font-bold">
          See all
        </Link>
      </div>
    </>
  );
};

export default Locations;
