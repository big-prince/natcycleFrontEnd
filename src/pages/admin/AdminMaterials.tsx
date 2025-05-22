/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import materialApi from "../../api/materialApi";
import { toast } from "react-toastify";

// Define an interface for your Material data
export interface IMaterial {
  _id: string;
  category: "plastic" | "food" | "fabric" | "ewaste" | "glass" | "other";
  name: string;
  weight: number;
  cuValue: number;
  image?: {
    url: string;
    publicId?: string;
  };
  // Add any other relevant fields like description, dateAdded etc.
  description?: string;
  dateAdded?: string; // Or Date object
}

const AdminMaterials = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [materials, setMaterials] = useState<IMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [triggerFetch, setTriggerFetch] = useState(false);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const response = await materialApi.getAllMaterials();
        setMaterials(response.data.data.materials);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching materials:", err);
        setError(err.response?.data?.message || "Failed to fetch materials.");
        toast.error(
          err.response?.data?.message || "Failed to fetch materials."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [triggerFetch]);

  const handleViewDetails = (materialId: string) => {
    navigate(`/admin/materials/${materialId}`);
  };

  const handleEditMaterial = (materialId: string) => {
    navigate(`/admin/materials/edit/${materialId}`);
  };

  const handleDeleteMaterial = async (materialId: string) => {
    //delete jsx
    const confirmDelete = () => {
      toast(
        ({ closeToast }) => (
          <div className="flex flex-col p-2">
            <p className="mb-2 text-sm font-semibold text-slate-700">
              Are you sure you want to delete this material?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={async () => {
                  if (closeToast) closeToast();
                  try {
                    await materialApi.deleteMaterial(materialId);
                    toast.success("Material deleted successfully");
                    setTriggerFetch((prev) => !prev);
                    // The fetch useEffect will update the list,
                    // so direct manipulation might not be needed if fetch is quick
                    // Or, keep it for optimistic UI update:
                    // setMaterials((prev) => prev.filter((m) => m._id !== materialId));
                  } catch (error: any) {
                    toast.error(
                      error.response?.data?.message ||
                        "Failed to delete material."
                    );
                  }
                }}
                className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={closeToast}
                className="px-3 py-1 text-sm font-medium text-slate-700 bg-slate-200 rounded hover:bg-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ),
        {
          position: "top-center",
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          closeButton: false, // We have custom buttons
          className: "w-auto", // Adjust width as needed
          bodyClassName: "p-0", // Remove default padding if styling internally
        }
      );
    };
    confirmDelete();
    return; // Prevent further execution in handleDeleteMaterial until confirmation
    try {
      await materialApi.deleteMaterial(materialId);
      toast.success("Material deleted successfully");
      setTriggerFetch((prev) => !prev);

      setMaterials((prev) => prev.filter((m) => m._id !== materialId));
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete material."
      );
    }
    console.log(`Simulating delete for material ID: ${materialId}`);
    setMaterials((prev) => prev.filter((m) => m._id !== materialId));
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Manage Materials</h1>
        <button
          onClick={() => navigate("/admin/materials/add")}
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-5 rounded-lg flex items-center transition-colors shadow-md hover:shadow-lg"
        >
          <FaPlus className="mr-2" />
          Add Material
        </button>
      </div>

      {loading && (
        <p className="text-center text-slate-600 py-10">Loading materials...</p>
      )}
      {error && (
        <p className="text-center text-red-600 bg-red-100 p-3 rounded-md">
          {error}
        </p>
      )}

      {!loading && !error && materials.length === 0 && (
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
            No materials
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a new material.
          </p>
        </div>
      )}

      {!loading && !error && materials.length > 0 && (
        <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  Image
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
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  Weight (g)
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  CU Value
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
              {materials.map((material) => (
                <tr
                  key={material._id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={
                        material.image?.url ||
                        "https://dummyimage.com/40x40/e0e0e0/757575&text=N/A"
                      }
                      alt={material.name}
                      className="w-10 h-10 object-cover rounded-md"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {material.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 capitalize">
                    {material.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {material.weight}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {material.cuValue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewDetails(material._id)}
                      className="text-sky-600 hover:text-sky-800 transition-colors p-1"
                      title="View Details"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditMaterial(material._id)}
                      className="text-amber-600 hover:text-amber-800 transition-colors p-1"
                      title="Edit Material"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMaterial(material._id)}
                      className="text-red-600 hover:text-red-800 transition-colors p-1"
                      title="Delete Material"
                    >
                      Delete
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

export default AdminMaterials;
