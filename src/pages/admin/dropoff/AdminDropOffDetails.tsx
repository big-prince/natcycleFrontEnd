/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // Added useNavigate
import DropOffApi from "../../../api/dropOffApi";
import CoolLoading from "../../dashboard/components/Loading"; // Assuming this is a valid component
import { IUser } from "../../../types";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa"; // Added Icons
import { toast } from "react-toastify"; // For notifications

interface DropOffLocation {
  address: string;
  description: string;
  // location: Location; // Assuming Location type if needed, else simplify
  name: string;
  __v: number;
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
  receipt?: { url: string };
  itemQuantity?: number;
}

const AdminDropOffDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dropOff, setDropOff] = useState<RecyclingPoint | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDropOff = async () => {
    if (!id) {
      setError("Drop-off ID is missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    DropOffApi.getDropOffById(id)
      .then((res) => {
        console.log(res.data.data);
        setDropOff(res.data.data);
        setError(null);
      })
      .catch((err) => {
        console.log(err);
        setError(
          err.response?.data?.message || "Failed to fetch drop-off details."
        );
        toast.error(
          err.response?.data?.message || "Failed to fetch drop-off details."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDropOff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleApproveDropOff = async () => {
    if (!id) return;
    // Simulate API call
    console.log(`Attempting to approve dropOff ID: ${id} from details page`);
    try {
      // Placeholder for actual API call:
      // await DropOffApi.approveDropOff(id, { status: "approved" });
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (dropOff) {
        setDropOff({ ...dropOff, status: "approved" });
      }
      toast.success("Drop-off approved successfully!");
    } catch (error) {
      console.error("Failed to approve drop-off:", error);
      toast.error("Failed to approve drop-off.");
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        <CoolLoading />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-10 text-center text-red-600 bg-red-100 rounded-md">
        {error}
      </div>
    );
  }
  if (!dropOff) {
    return (
      <div className="p-10 text-center text-slate-500">Drop-off not found.</div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/admin/dropoffs")}
          className="mb-6 inline-flex items-center text-sm text-sky-600 hover:text-sky-800 font-medium"
        >
          <FaArrowLeft className="mr-2" />
          Back to All Drop-offs
        </button>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Drop-off Details
                </h1>
                <p className="text-sm text-slate-500">ID: {dropOff._id}</p>
              </div>
              {dropOff.status === "pending" && (
                <button
                  onClick={handleApproveDropOff}
                  className="mt-4 sm:mt-0 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors shadow-md"
                >
                  <FaCheckCircle className="mr-2" />
                  Approve Drop-off
                </button>
              )}
            </div>

            {/* Receipt Image Section */}
            {dropOff.receipt?.url && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-700 mb-3">
                  Receipt Image
                </h2>
                <img
                  src={dropOff.receipt.url}
                  alt="Receipt"
                  className="max-w-sm w-full h-auto object-contain rounded-lg border border-slate-200 shadow-sm"
                />
              </div>
            )}
            {!dropOff.receipt?.url && (
              <div className="mb-8 p-4 bg-slate-100 rounded-lg text-center text-slate-500">
                No receipt image uploaded for this drop-off.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* User Info Section */}
              <div className="col-span-1 md:col-span-2 border-b border-slate-200 pb-4 mb-2">
                <h2 className="text-xl font-semibold text-slate-700 mb-3">
                  User Information
                </h2>
                <div className="flex items-center space-x-4">
                  <img
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
                    src={
                      dropOff.user.profilePicture?.url ||
                      `https://ui-avatars.com/api/?name=${dropOff.user.firstName}+${dropOff.user.lastName}&background=random`
                    }
                    alt={`${dropOff.user.firstName} ${dropOff.user.lastName}`}
                  />
                  <div>
                    <p className="text-lg font-medium text-slate-800">
                      <Link
                        to={`/admin/users/${dropOff.user._id}`}
                        className="hover:underline"
                      >
                        {dropOff.user.firstName} {dropOff.user.lastName}
                      </Link>
                    </p>
                    <p className="text-sm text-slate-500">
                      {dropOff.user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Drop-off Details Section */}
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Material Type (Item Type)
                </p>
                <p className="text-lg text-slate-800 capitalize">
                  {dropOff.itemType}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Quantity</p>
                <p className="text-lg text-slate-800">
                  {dropOff.itemQuantity || "N/A"} units
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Description/Notes
                </p>
                <p className="text-lg text-slate-800">
                  {dropOff.description || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Points Earned
                </p>
                <p className="text-lg text-slate-800">{dropOff.pointsEarned}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Status</p>
                <span
                  className={`px-2.5 py-0.5 inline-flex text-sm leading-5 font-semibold rounded-full
                      ${
                        dropOff.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : dropOff.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-800"
                      } capitalize`}
                >
                  {dropOff.status}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Drop-off Date
                </p>
                <p className="text-lg text-slate-800">
                  {new Date(dropOff.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Location Details Section */}
              <div className="col-span-1 md:col-span-2 border-t border-slate-200 pt-6 mt-4">
                <h2 className="text-xl font-semibold text-slate-700 mb-3">
                  Location Details
                </h2>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Location Name
                  </p>
                  <p className="text-lg text-slate-800">
                    {dropOff.dropOffLocation?.name || "N/A"}
                  </p>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-slate-500">Address</p>
                  <p className="text-lg text-slate-800">
                    {dropOff.dropOffLocation?.address || "N/A"}
                  </p>
                </div>
                {dropOff.dropOffLocation?.description && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-slate-500">
                      Location Description
                    </p>
                    <p className="text-lg text-slate-800">
                      {dropOff.dropOffLocation.description}
                    </p>
                  </div>
                )}
              </div>

              {dropOff.campaign && (
                <div className="col-span-1 md:col-span-2 border-t border-slate-200 pt-6 mt-4">
                  <h2 className="text-xl font-semibold text-slate-700 mb-3">
                    Campaign Information
                  </h2>
                  <p className="text-sm font-medium text-slate-500">
                    Campaign Name
                  </p>
                  {/* Assuming campaign is an object with a name property. Adjust if it's just an ID. */}
                  <p className="text-lg text-slate-800">
                    {dropOff.campaign.name || dropOff.campaign || "N/A"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDropOffDetails;
