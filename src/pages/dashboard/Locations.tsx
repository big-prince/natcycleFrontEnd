import { useEffect, useState } from "react";
import LocationApi from "../../api/locationApi";
import AddLocation from "./components/AddLocation";
import Loading from "./components/Loading";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Locations = () => {
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [notify, setNotify] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    LocationApi.getLocations()
      .then((res) => {
        console.log(res.data);
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
  }, [notify]);

  const handleDelete = (id: string) => {
    LocationApi.deleteLocation(id)
      .then((res) => {
        console.log(res);
        setNotify(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <div className="flex justify-between items-center mt-6">
        <h2 className="text-2xl font-semibold">Locations</h2>

        <AddLocation setNotify={setNotify} />
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
                <p className="text-gray-700 text-sm">{location.state}</p>
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

        {loading && <Loading />}
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
