/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import thingsMatchApi from "../../../api/thingsMatchApi";
import { TMItem } from "./TMItems";
import {
  FiLoader,
  FiAlertCircle,
  FiArrowLeft,
  FiImage,
  FiMapPin,
  FiTag,
  FiUser,
  FiInfo,
  FiCalendar,
  FiHeart,
  FiEye,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import { toast } from "react-toastify";

const TMItemDetails: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const location = useLocation(); // Get location object

  // Attempt to get item data from location state first
  const passedItemData = (location.state as { itemData?: TMItem })?.itemData;

  const [item, setItem] = useState<TMItem | null>(passedItemData || null);
  const [loading, setLoading] = useState(!passedItemData); // Only load if data wasn't passed
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If item data was passed via state and matches the itemId, no need to fetch
    if (passedItemData && passedItemData._id === itemId) {
      setItem(passedItemData);
      setLoading(false);
      return;
    }

    // Fallback: if no item data in state, or ID mismatch, or direct navigation
    if (!itemId) {
      setError("Item ID is missing.");
      setLoading(false);
      toast.error("Item ID is missing in URL.");
      navigate("/admin/thingsmatch/items");
      return;
    }

    const fetchItem = async () => {
      setLoading(true); // Ensure loading is true if we are fetching
      setError(null);
      try {
        const response = await thingsMatchApi.getItemById(itemId);
        if (response.data && response.data.data && response.data.data.item) {
          setItem(response.data.data.item);
        } else if (response.data && response.data.item) {
          setItem(response.data.item);
        } else if (response.data) {
          setItem(response.data);
        } else {
          throw new Error("Item data not found in response");
        }
      } catch (err: any) {
        console.error("Error fetching item details:", err);
        setError(
          err.response?.data?.message ||
            `Failed to fetch item details for ID: ${itemId}`
        );
        toast.error(
          err.response?.data?.message || "Failed to fetch item details."
        );
        setItem(null); // Clear item on error
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId, navigate, passedItemData]); // Add passedItemData to dependencies

  // ... (DetailRow, loading, error, and JSX structure for displaying item details remain the same) ...
  const DetailRow: React.FC<{
    icon?: React.ElementType;
    label: string;
    value?: string | number | null;
    children?: React.ReactNode;
  }> = ({ icon: Icon, label, value, children }) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-slate-500 flex items-center">
        {Icon && <Icon className="mr-2 h-5 w-5 text-slate-400" />}
        {label}
      </dt>
      <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">
        {children || value || "N/A"}
      </dd>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <FiLoader className="animate-spin text-sky-500 text-4xl" />
        <span className="ml-3 text-slate-700">Loading Item Details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <FiAlertCircle className="text-red-500 text-5xl mb-4 mx-auto" />
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate("/admin/thingsmatch/items")}
          className="mt-4 px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600"
        >
          Back to Items List
        </button>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-6 text-center">
        <p>Item not found.</p>
        <button
          onClick={() => navigate("/admin/thingsmatch/items")}
          className="mt-4 px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600"
        >
          Back to Items List
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-full">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
      >
        <FiArrowLeft className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
        Back
      </button>
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">
            {item.name}
          </h1>
          <p className="text-sm text-slate-500 mb-4">Item ID: {item._id}</p>
        </div>

        <div className="border-t border-slate-200 px-6 py-5">
          <dl className="divide-y divide-slate-200">
            <DetailRow
              icon={FiInfo}
              label="Description"
              value={item.description}
            />
            <DetailRow icon={FiTag} label="Category" value={item.category} />
            <DetailRow icon={FiCheckCircle} label="Status">
              <span
                className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  item.status === "available"
                    ? "bg-green-100 text-green-800"
                    : item.status === "reserved"
                    ? "bg-yellow-100 text-yellow-800"
                    : item.status === "given_away"
                    ? "bg-blue-100 text-blue-800"
                    : item.status === "expired"
                    ? "bg-red-100 text-red-800"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {item.status.replace("_", " ")}
              </span>
            </DetailRow>
            <DetailRow
              icon={FiEye}
              label="Discovery Status"
              value={item.discoveryStatus}
            />
            <DetailRow
              icon={FiHeart}
              label="Interest Count"
              value={item.interestCount}
            />

            {item.userDetails && (
              <DetailRow
                icon={FiUser}
                label="Listed By"
                value={`${item.userDetails.name} (${item.userDetails.email})`}
              />
            )}
            {!item.userDetails && (
              <DetailRow icon={FiUser} label="User ID" value={item.userId} />
            )}

            <DetailRow
              icon={FiMapPin}
              label="Location Address"
              value={item.location.address}
            />
            <DetailRow
              icon={FiMapPin}
              label="Coordinates"
              value={item.location.coordinates.join(", ")}
            />

            <DetailRow
              icon={FiCalendar}
              label="Created At"
              value={new Date(item.createdAt).toLocaleString()}
            />
            <DetailRow
              icon={FiClock}
              label="Last Updated At"
              value={new Date(item.updatedAt).toLocaleString()}
            />

            <DetailRow icon={FiImage} label="Item Images">
              {item.itemImages && item.itemImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                  {item.itemImages.map((img) => (
                    <a
                      key={img._id}
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <img
                        src={img.url}
                        alt={`Item image ${img.public_id}`}
                        className="w-full h-32 object-cover rounded-md shadow-sm group-hover:shadow-lg transition-shadow"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No images available.</p>
              )}
            </DetailRow>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default TMItemDetails;
