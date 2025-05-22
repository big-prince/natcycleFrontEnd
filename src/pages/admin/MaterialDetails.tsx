/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { IMaterial } from "./AdminMaterials";
import materialApi from "../../api/materialApi";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

const MaterialDetails = () => {
  const { materialId } = useParams<{ materialId: string }>();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<IMaterial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!materialId) {
      setError("Material ID is missing.");
      setLoading(false);
      return;
    }
    const fetchMaterialDetails = async () => {
      setLoading(true);
      try {
        const response = await materialApi.getMaterialById(materialId);
        console.log(
          "🚀 ~ fetchMaterialDetails ~ response:",
          response.data.data.material
        );
        setMaterial(response.data.data.material);
        // Mock data for now:
        // const mockMaterials: IMaterial[] = [
        //   {
        //     _id: "1",
        //     category: "plastic",
        //     name: "PET Bottle",
        //     weight: 20,
        //     cuValue: 5,
        //     image: { url: "https://dummyimage.com/600x400/000/fff&text=PET" },
        //     description: "A standard PET plastic bottle.",
        //     dateAdded: new Date().toISOString(),
        //   },
        //   {
        //     _id: "2",
        //     category: "fabric",
        //     name: "Cotton T-Shirt",
        //     weight: 150,
        //     cuValue: 25,
        //     image: { url: "https://dummyimage.com/600x400/000/fff&text=Shirt" },
        //     description: "A used cotton t-shirt.",
        //     dateAdded: new Date().toISOString(),
        //   },
        //   {
        //     _id: "3",
        //     category: "food",
        //     name: "Apple Cores",
        //     weight: 50,
        //     cuValue: 2,
        //     description: "Organic apple cores for composting.",
        //     dateAdded: new Date().toISOString(),
        //   },
        // ];
      } catch (err: any) {
        console.error("Error fetching material details:", err);
        setError(
          err.response?.data?.message || "Failed to fetch material details."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchMaterialDetails();
  }, [materialId]);

  const handleDeleteMaterial = async () => {
    if (
      !materialId ||
      !window.confirm("Are you sure you want to delete this material?")
    )
      return;
    try {
      // await materialApi.deleteMaterial(materialId);
      toast.success("Material deleted successfully (simulated)");
      navigate("/admin/materials");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete material."
      );
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-600">
        Loading material details...
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
  if (!material) {
    return (
      <div className="p-10 text-center text-slate-500">Material not found.</div>
    );
  }

  return (
    <div className="p-6  min-h-screen">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/admin/materials")}
          className="mb-6 inline-flex items-center text-sm text-sky-600 hover:text-sky-800 font-medium"
        >
          <FaArrowLeft className="mr-2" />
          Back to Materials
        </button>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src={
                  material.image?.url ||
                  "https://dummyimage.com/600x400/e0e0e0/757575&text=No+Image"
                }
                alt={material.name}
                className="w-full h-64 md:h-full object-cover"
              />
            </div>
            <div className="p-6 md:p-8 md:w-1/2">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-slate-800">
                  {material.name}
                </h1>
                <div className="flex space-x-2">
                  <Link
                    to={`/admin/materials/edit/${material._id}`}
                    className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-full transition-colors"
                    title="Edit"
                  >
                    <FaEdit size={18} />
                  </Link>
                  <button
                    onClick={handleDeleteMaterial}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              </div>

              <span className="inline-block bg-sky-100 text-sky-700 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase mb-4">
                {material.category}
              </span>

              {material.description && (
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase mb-1">
                    Description
                  </h3>
                  <p className="text-slate-700 text-base leading-relaxed">
                    {material.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-500">Weight</p>
                  <p className="text-slate-800 text-lg">{material.weight}g</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-500">CU Value</p>
                  <p className="text-slate-800 text-lg">{material.cuValue}</p>
                </div>
                {material.dateAdded && (
                  <div className="col-span-2">
                    <p className="font-semibold text-slate-500">Date Added</p>
                    <p className="text-slate-800">
                      {new Date(material.dateAdded).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="font-semibold text-slate-500">Material ID</p>
                  <p className="text-slate-800 text-xs">{material._id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetails;
