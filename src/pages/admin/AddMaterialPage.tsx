/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaCamera, FaArrowLeft } from "react-icons/fa";
import materialApi from "../../api/materialApi";
import { toast } from "react-toastify";
import { IMaterial } from "./AdminMaterials";

const materialCategories: IMaterial["category"][] = [
  "plastic",
  "food",
  "fabric",
  "ewaste",
  "glass",
  "other",
];

const AddMaterialPage = () => {
  const navigate = useNavigate();
  const { materialId } = useParams<{ materialId?: string }>();
  const isEditing = !!materialId;

  const [category, setCategory] = useState<IMaterial["category"]>(
    materialCategories[0]
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState<number | string>("");
  const [cuValue, setCuValue] = useState<number | string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialImageURL, setInitialImageURL] = useState<string | null>(null);

  // Fetch material data if editing
  useEffect(() => {
    if (isEditing && materialId) {
      setLoading(true);
      // Simulating API call to fetch material by ID
      // Replace with actual API call: materialApi.getMaterialById(materialId)
      const fetchMaterialDetails = async () => {
        setLoading(true);
        try {
          const response = await materialApi.getMaterialById(materialId);
          const mainData = response.data.data.material;
          console.log(
            "🚀 ~ fetchMaterialDetails ~ response:",
            response.data.data.material
          );

          //set all states
          setName(mainData?.name);
          setDescription(mainData?.description);
          setWeight(mainData?.weight);
          setCuValue(mainData?.cuValue);
          if (mainData?.image) {
            setInitialImageURL(() => {
              const dataType = typeof mainData?.image;
              return dataType == "object" ? mainData.image.url : null;
            });
          }
        } catch (err: any) {
          console.error("Error fetching material details:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchMaterialDetails();
    }
  }, [isEditing, materialId]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(initialImageURL);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !name ||
      !weight ||
      !cuValue ||
      (!imageFile && !isEditing) ||
      !category
    ) {
      toast.error(
        "Please fill in all required fields. Image is required for new materials."
      );
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("weight", String(weight));
    formData.append("cuValue", String(cuValue));
    if (imageFile) {
      formData.append("file", imageFile);
    } else if (isEditing && initialImageURL) {
      console.log("EDiting and no existing image");
      // If editing and no new file, you might need to send the existing image URL
      // or your backend handles this by not updating the image if 'file' is not present.
      // For this example, we assume backend handles it.
    }

    console.log("Form Data to submit:", Object.fromEntries(formData));

    try {
      if (isEditing && materialId) {
        const response = await materialApi.updateMaterial(materialId, formData);
        if (response) {
          toast.success("Material Succesfully Edited");
          navigate("/admin/materials");
        }
      } else {
        await materialApi.createMaterial(formData);
        toast.success("Material added successfully!");
        navigate("/admin/materials");
      }
    } catch (error: any) {
      console.error("Error submitting material:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit material."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <div className="p-6 text-center">Loading material details...</div>;
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-xl">
        <button
          onClick={() => navigate("/admin/materials")}
          className="mb-6 inline-flex items-center text-sm text-sky-600 hover:text-sky-800 font-medium"
        >
          <FaArrowLeft className="mr-2" />
          Back to Materials
        </button>
        <h1 className="text-3xl font-bold text-slate-800 mb-8">
          {isEditing ? "Edit Material" : "Add New Material"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="materialName"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Material Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="materialName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full"
              placeholder="e.g., PET Bottle, Cotton T-Shirt"
              required
            />
          </div>

          <div>
            <label
              htmlFor="materialCategory"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="materialCategory"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as IMaterial["category"])
              }
              className="input w-full"
              required
            >
              {materialCategories.map((cat) => (
                <option key={cat} value={cat} className="capitalize">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="materialDescription"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Description
            </label>
            <textarea
              id="materialDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input w-full min-h-[80px]"
              placeholder="Brief description of the material..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="materialWeight"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Weight (grams) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="materialWeight"
                value={weight}
                onChange={(e) =>
                  setWeight(
                    e.target.value === "" ? "" : parseFloat(e.target.value)
                  )
                }
                className="input w-full"
                placeholder="e.g., 20"
                min="0"
                step="any"
                required
              />
            </div>
            <div>
              <label
                htmlFor="materialCU"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                CU Value <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="materialCU"
                value={cuValue}
                onChange={(e) =>
                  setCuValue(e.target.value === "" ? "" : e.target.value)
                }
                className="input w-full"
                placeholder="e.g., 5"
                min="0"
                step="any"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Material Picture{" "}
              {isEditing ? (
                "(Optional: change existing)"
              ) : (
                <span className="text-red-500">*</span>
              )}
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mx-auto h-40 w-auto object-contain rounded-md"
                  />
                ) : (
                  <FaCamera className="mx-auto h-12 w-12 text-slate-400" />
                )}
                <div className="flex text-sm text-slate-600 justify-center mt-2">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-sky-600 hover:text-sky-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sky-500 px-2 py-1 border border-transparent hover:border-sky-300"
                  >
                    <span>
                      {imagePreview ? "Change file" : "Upload a file"}
                    </span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                {!imagePreview && (
                  <p className="text-xs text-slate-500 mt-1">
                    PNG, JPG, GIF up to 10MB
                  </p>
                )}
              </div>
            </div>
            {imageFile && (
              <p className="text-xs text-slate-500 mt-1">
                Selected: {imageFile.name}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/admin/materials")}
              className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
            >
              {loading
                ? isEditing
                  ? "Saving..."
                  : "Adding..."
                : isEditing
                ? "Save Changes"
                : "Add Material"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMaterialPage;
