/* eslint-disable @typescript-eslint/no-explicit-any */
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { FaTimes, FaCamera } from "react-icons/fa";
// import materialApi from "../../../api/materialApi"; // You'll need to create this
import { toast } from "react-toastify";
import { IMaterial } from "../AdminMaterials"; // Import the interface

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setNotify: React.Dispatch<React.SetStateAction<boolean>>;
  materialToEdit?: IMaterial | null;
};

const materialCategories: IMaterial["category"][] = [
  "1000ml plastic",
  "500ml plastic",
  "1500ml plastic",
  "food",
  "fabric",
  "eWaste",
  "glass",
  "other",
];

const AddMaterialModal = ({
  isModalOpen,
  setIsModalOpen,
  setNotify,
  materialToEdit,
}: Props) => {
  const [category, setCategory] = useState<IMaterial["category"]>(
    materialCategories[0]
  );
  const [name, setName] = useState("");
  const [weight, setWeight] = useState<number | string>(""); // Allow string for input flexibility
  const [cuValue, setCuValue] = useState<number | string>(""); // Allow string
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditing = !!materialToEdit;

  useEffect(() => {
    if (materialToEdit) {
      setCategory(materialToEdit.category);
      setName(materialToEdit.name);
      setWeight(materialToEdit.weight);
      setCuValue(materialToEdit.cuValue);
      setImagePreview(materialToEdit.image?.url || null);
      setImageFile(null); // Clear file input on edit
    } else {
      // Reset form for adding new
      setCategory(materialCategories[0]);
      setName("");
      setWeight("");
      setCuValue("");
      setImageFile(null);
      setImagePreview(null);
    }
  }, [materialToEdit, isModalOpen]); // Reset form when modal opens or materialToEdit changes

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
      setImagePreview(materialToEdit?.image?.url || null); // Revert to original if file is cleared
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
      toast.error("Please fill in all required fields and select an image.");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("weight", String(weight));
    formData.append("cuValue", String(cuValue));
    if (imageFile) {
      formData.append("file", imageFile); // API should handle 'file' for image upload
    }

    // Placeholder for API call
    console.log("Form Data to submit:", {
      name,
      category,
      weight,
      cuValue,
      imageFile,
    });

    try {
      // if (isEditing && materialToEdit) {
      //   // response = await materialApi.updateMaterial(materialToEdit._id, formData);
      //   toast.success("Material updated successfully!");
      // } else {
      //   // response = await materialApi.createMaterial(formData);
      //   toast.success("Material added successfully!");
      // }
      // For now, simulate success:
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(
        isEditing
          ? "Material updated successfully (simulated)!"
          : "Material added successfully (simulated)!"
      );

      setNotify((prev) => !prev); // Trigger refetch in parent
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error submitting material:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit material."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
      <AlertDialog.Overlay className="general_modal_overlay" />
      <AlertDialog.Content className="general_modal max-h-[90vh] w-[95vw] max-w-lg overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <AlertDialog.Title className="text-2xl font-semibold text-slate-800">
              {isEditing ? "Edit Material" : "Add New Material"}
            </AlertDialog.Title>
            <AlertDialog.Cancel
              onClick={() => setIsModalOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <FaTimes className="text-slate-600 h-5 w-5" />
            </AlertDialog.Cancel>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="materialName"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Material Name
              </label>
              <input
                type="text"
                id="materialName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input" // Using existing .input class from App.css
                placeholder="e.g., PET Bottle, Cotton T-Shirt"
                required
              />
            </div>

            <div>
              <label
                htmlFor="materialCategory"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Category
              </label>
              <select
                id="materialCategory"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as IMaterial["category"])
                }
                className="input"
                required
              >
                {materialCategories.map((cat) => (
                  <option key={cat} value={cat} className="capitalize">
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="materialWeight"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Weight (grams)
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
                  className="input"
                  placeholder="e.g., 20"
                  min="0"
                  step="any"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="materialCU"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  CU Value
                </label>
                <input
                  type="number"
                  id="materialCU"
                  value={cuValue}
                  onChange={(e) =>
                    setCuValue(
                      e.target.value === "" ? "" : parseInt(e.target.value, 10)
                    )
                  }
                  className="input"
                  placeholder="e.g., 5"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Material Picture
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto h-32 w-auto object-contain rounded"
                    />
                  ) : (
                    <FaCamera className="mx-auto h-12 w-12 text-slate-400" />
                  )}
                  <div className="flex text-sm text-slate-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-sky-600 hover:text-sky-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sky-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
              {imageFile && (
                <p className="text-xs text-slate-500 mt-1">
                  Selected: {imageFile.name}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-3">
              <AlertDialog.Cancel
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </AlertDialog.Cancel>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
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
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};

export default AddMaterialModal;
