/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaCamera, FaArrowLeft } from "react-icons/fa";
import materialApi from "../../api/materialApi";
import { toast } from "react-toastify";
import { IMaterial } from "./AdminMaterials";

const materialCategories: IMaterial["category"][] = [
  "500ml plastic",
  "1000ml plastic",
  "1500ml plastic",
  "glass",
  "paper",
  "metal",
  "food",
  "organic",
  "fabric",
  "eWaste",
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
  // const [weight, setWeight] = useState<number | string>(""); // Remove this
  const [quantity, setQuantity] = useState<number | string>(""); // New state for quantity
  const [weightInGrams, setWeightInGrams] = useState<number | string>(""); // New state for weight
  const [cuValue, setCuValue] = useState<number | string>("");
  const [natPoints, setNatPoints] = useState<number | string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialImageURL, setInitialImageURL] = useState<string | null>(null);

  // Fetch material data if editing
  useEffect(() => {
    if (isEditing && materialId) {
      setLoading(true);
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
          // setWeight(mainData?.weight); // Remove this
          // Assuming backend provides 'weight' for weightInGrams or 'quantity'
          // Prioritize weight if both somehow exist, or adjust based on backend structure
          if (mainData?.weight !== undefined && mainData?.weight !== null) {
            setWeightInGrams(mainData.weight);
            setQuantity("");
          } else if (
            mainData?.quantity !== undefined &&
            mainData?.quantity !== null
          ) {
            setQuantity(mainData.quantity);
            setWeightInGrams("");
          }
          setCuValue(mainData?.cuValue);
          setNatPoints(mainData?.natPoints);
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

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseInt(value, 10);

    if (value === "") {
      setQuantity("");
    } else if (!isNaN(numValue) && numValue >= 0) {
      setQuantity(numValue);
      setWeightInGrams(""); // Clear weight if quantity is entered
    } else if (value !== "" && quantity === "") {
      // handles if user types non-numeric first
      setQuantity(value); // keep the invalid input for a moment so user sees it
    }
  };

  const handleWeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseFloat(value);

    if (value === "") {
      setWeightInGrams("");
    } else if (!isNaN(numValue) && numValue >= 0) {
      setWeightInGrams(numValue);
      setQuantity(""); // Clear quantity if weight is entered
    } else if (value !== "" && weightInGrams === "") {
      // handles if user types non-numeric first
      setWeightInGrams(value); // keep the invalid input for a moment so user sees it
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !name ||
      (!quantity && !weightInGrams) || // Check if either quantity or weight is provided
      !cuValue ||
      !natPoints || // Assuming Natcycle Points are also required
      (!imageFile && !isEditing) ||
      !category
    ) {
      toast.error(
        "Please fill in all required fields (Name, Category, Amount (Quantity or Weight), CU Value, Natcycle Points). Image is required for new materials."
      );
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("description", description);

    if (quantity !== "" && quantity !== null) {
      formData.append("quantity", String(quantity));
    } else if (weightInGrams !== "" && weightInGrams !== null) {
      formData.append("weight", String(weightInGrams)); // Assuming backend expects 'weight'
    }

    formData.append("cuValue", String(cuValue));
    formData.append("natPoints", String(natPoints));
    if (imageFile) {
      formData.append("file", imageFile);
    } else if (isEditing && initialImageURL) {
      console.log("Editing and no existing image");
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

          {/* New Amount Section */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Amount <span className="text-red-500">*</span>
              <span className="text-xs text-slate-500 font-normal ml-1">
                (fill quantity or weight)
              </span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-1 p-4 border border-slate-200 rounded-lg bg-slate-50/50">
              <div>
                <label
                  htmlFor="materialQuantity"
                  className="block text-xs font-medium text-slate-600 mb-1"
                >
                  Quantity (units)
                </label>
                <input
                  type="number"
                  id="materialQuantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="input w-full disabled:opacity-60 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  placeholder="e.g., 10"
                  min="0"
                  disabled={
                    weightInGrams !== "" &&
                    weightInGrams !== null &&
                    !isNaN(parseFloat(String(weightInGrams)))
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="materialWeightGrams"
                  className="block text-xs font-medium text-slate-600 mb-1"
                >
                  Weight (grams)
                </label>
                <input
                  type="number"
                  id="materialWeightGrams"
                  value={weightInGrams}
                  onChange={handleWeightChange}
                  className="input w-full disabled:opacity-60 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  placeholder="e.g., 20"
                  min="0"
                  step="any"
                  disabled={
                    quantity !== "" &&
                    quantity !== null &&
                    !isNaN(parseInt(String(quantity)))
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Removed Weight from here, CU Value and NatPoints remain */}
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
                  setCuValue(
                    e.target.value === "" ? "" : parseFloat(e.target.value)
                  )
                }
                className="input w-full"
                placeholder="e.g., 5"
                min="0"
                step="any"
                required
              />
            </div>
            <div>
              <label
                htmlFor="materialNatPoints"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Natcycle Points <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="materialNatPoints"
                value={natPoints}
                onChange={(e) =>
                  setNatPoints(
                    e.target.value === "" ? "" : parseFloat(e.target.value)
                  )
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
