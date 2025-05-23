/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router-dom";
import DropOffApi from "../../../api/dropOffApi";
import { useEffect, useState } from "react";
import { IUser } from "../../../types";
import { toast } from "react-toastify"; // For notifications

interface DropOffLocation {
  address: string;
  name: string;
  _id: string;
}

interface RecyclingPoint {
  campaign: any;
  createdAt: string;
  description: string;
  dropOffLocation: DropOffLocation;
  itemType: string;
  pointsEarned: number;
  status: string;
  updatedAt: string;
  user: IUser;
  __v: number;
  _id: string;
  receiptImage?: { url: string };
}

const AdminDropOffs = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RecyclingPoint[]>([]);

  const fetchData = async () => {
    setLoading(true); // Set loading true at the start of fetch
    DropOffApi.adminGetDropOffs()
      .then((res) => {
        console.log(res.data.data.docs);
        setData(res.data.data.docs);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to fetch drop-offs.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveDropOff = async (dropOffId: string) => {
    // Simulate API call
    console.log(`Attempting to approve dropOff ID: ${dropOffId}`);
    try {
      await DropOffApi.adminApproveDropOff(dropOffId).then((res) => {
        console.log(res.data);
      });

      setData((prevData) =>
        prevData.map((item) =>
          item._id === dropOffId ? { ...item, status: "Approved" } : item
        )
      );

      toast.success("Drop-off approved successfully!");
    } catch (error) {
      console.error("Failed to approve drop-off:", error);
      toast.error("Failed to approve drop-off.");
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">All Drop-Offs</h1>
        <div>
          <Link
            to="/admin/dropoff-locations" // Changed from create-location to view locations
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-5 rounded-lg flex items-center transition-colors shadow-md hover:shadow-lg"
          >
            Manage Locations
          </Link>
        </div>
      </div>

      {loading && (
        <p className="text-center text-slate-600 py-10">Loading drop-offs...</p>
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
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No drop-offs
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No drop-offs have been recorded yet.
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
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  Location
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
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  Status
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
              {data.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {item.user
                      ? `${item.user.firstName} ${item.user.lastName}`
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {item.dropOffLocation?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 capitalize">
                    {item.itemType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        item.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : item.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-800"
                      } capitalize`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      to={`/admin/dropoffs/${item._id}`}
                      className="text-sky-600 hover:text-sky-800 p-1"
                      title="View Details"
                    >
                      View Details
                    </Link>
                    {item.status === "Pending" && (
                      <button
                        onClick={() => handleApproveDropOff(item._id)}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded-md text-xs transition-colors shadow-sm hover:shadow-md"
                        title="Approve Drop-off"
                      >
                        Approve
                      </button>
                    )}
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

export default AdminDropOffs;
