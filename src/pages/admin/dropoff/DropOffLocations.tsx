/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import dropOffLocationApi from "../../../api/dropOffLocationApi";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit, FaPlus, FaRegTrashAlt } from "react-icons/fa"; // Added icons
import { toast } from "react-toastify"; // For notifications

const DropOffLocations = () => {
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState([]);

  const fetchData = async () => {
    setLoading(true);
    dropOffLocationApi
      .getDropOffLocations()
      .then((res) => {
        console.log(res.data.data.docs);
        setData(res.data.data.docs);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to fetch drop-off locations.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this location? This action cannot be undone."
    );
    if (!confirmDelete) return;

    dropOffLocationApi
      .deleteDropOffLocation(id)
      .then((res) => {
        console.log(res.data);
        toast.success("Location deleted successfully!");
        fetchData(); // Refresh data after delete
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to delete location.");
      });
  };

  const navigate = useNavigate();
  const handleEdit = (id: string) => {
    navigate(`/admin/dropoffs/create-location?id=${id}`);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Drop-off Locations
        </h1>
        <div>
          <Link
            to="/admin/dropoffs/create-location"
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-5 rounded-lg flex items-center transition-colors shadow-md hover:shadow-lg"
          >
            <FaPlus className="mr-2" /> Add Location
          </Link>
        </div>
      </div>

      {loading && (
        <p className="text-center text-slate-600 py-10">Loading locations...</p>
      )}

      {!loading && data.length === 0 && (
        <div className="text-center py-10">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No drop-off locations
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a new drop-off location.
          </p>
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  #
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  Address
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  Item Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {data.map((location: any, index: number) => (
                <tr
                  key={location._id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {location.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {location.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 capitalize">
                    {location.itemType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(location._id)}
                      className="text-sky-600 hover:text-sky-800 p-1 flex items-center"
                      title="Edit Location"
                    >
                      <FaEdit className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(location._id)}
                      className="text-red-600 hover:text-red-800 p-1 flex items-center"
                      title="Delete Location"
                    >
                      <FaRegTrashAlt className="mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DropOffLocations;
