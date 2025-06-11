import React, { useState } from "react";
import {
  FiPlusCircle,
  FiEdit,
  FiTrash2,
  FiPackage, // General item icon
  FiClipboard, // For blueprint/template idea
  FiInfo,
  FiX,
  FiSave,
  FiTag,
  FiFileText,
} from "react-icons/fi";
import { toast } from "react-toastify";

// Interface for an ePantry Item Blueprint
interface EPantryItemBlueprint {
  id: string;
  name: string;
  description: string;
  category: string; // e.g., "Essentials", "Kits", "Seasonal"
  // suggestedContents?: string[]; // Future idea
  icon?: string; // Placeholder for an icon name or URL
  createdAt: Date;
}

// Sample initial data (will be lost on refresh without localStorage or backend)
const initialEPantryItems: EPantryItemBlueprint[] = [
  {
    id: "ep1",
    name: "Winter Warmth Kit",
    description:
      "A kit containing essential items to help someone stay warm during winter.",
    category: "Seasonal Kits",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  },
  {
    id: "ep2",
    name: "Basic Food Staples",
    description:
      "A collection of non-perishable food items like rice, pasta, and canned goods.",
    category: "Food Essentials",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
  },
  {
    id: "ep3",
    name: "Student Study Pack",
    description: "Basic stationery and supplies for students.",
    category: "Educational Support",
    createdAt: new Date(),
  },
];

const EPantry: React.FC = () => {
  const [pantryItems, setPantryItems] =
    useState<EPantryItemBlueprint[]>(initialEPantryItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EPantryItemBlueprint | null>(
    null
  );
  const [newItem, setNewItem] = useState<{
    name: string;
    description: string;
    category: string;
  }>({
    name: "",
    description: "",
    category: "",
  });

  const openModal = (item?: EPantryItemBlueprint) => {
    if (item) {
      setEditingItem(item);
      setNewItem({
        name: item.name,
        description: item.description,
        category: item.category,
      });
    } else {
      setEditingItem(null);
      setNewItem({ name: "", description: "", category: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setNewItem({ name: "", description: "", category: "" });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.description || !newItem.category) {
      toast.error("All fields (Name, Description, Category) are required.");
      return;
    }

    if (editingItem) {
      setPantryItems(
        pantryItems.map((p) =>
          p.id === editingItem.id ? { ...editingItem, ...newItem } : p
        )
      );
      toast.success(`Blueprint "${newItem.name}" updated successfully!`);
    } else {
      const newBlueprint: EPantryItemBlueprint = {
        id: `ep${Date.now()}`, // Simple unique ID
        ...newItem,
        createdAt: new Date(),
      };
      setPantryItems([newBlueprint, ...pantryItems]);
      toast.success(`Blueprint "${newItem.name}" added to ePantry!`);
    }
    closeModal();
  };

  const handleDelete = (itemId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this ePantry blueprint? This action cannot be undone."
      )
    ) {
      const itemName =
        pantryItems.find((p) => p.id === itemId)?.name || "Blueprint";
      setPantryItems(pantryItems.filter((p) => p.id !== itemId));
      toast.info(`"${itemName}" removed from ePantry.`);
    }
  };

  const availableCategories = [
    "General",
    "Food Essentials",
    "Clothing",
    "Hygiene",
    "Educational Support",
    "Seasonal Kits",
    "Emergency",
    "Other",
  ];

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-full">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4 sm:mb-0 flex items-center">
          <FiClipboard className="mr-3 text-sky-600" /> ThingsMatch ePantry
        </h1>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
        >
          <FiPlusCircle className="-ml-1 mr-2 h-5 w-5" /> Add New Blueprint
        </button>
      </div>

      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex items-center text-slate-600">
          <FiInfo className="h-5 w-5 mr-2 text-sky-500" />
          <p className="text-sm">
            Manage ePantry blueprints: these are templates or curated item types
            you want to highlight or encourage on the platform. Currently, data
            is stored locally and will reset on page refresh.
          </p>
        </div>
      </div>

      {pantryItems.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow p-6">
          <FiPackage size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-500 text-lg">Your ePantry is empty.</p>
          <p className="text-slate-400 text-sm mt-1">
            Click "Add New Blueprint" to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pantryItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col"
            >
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-slate-800">
                    {item.name}
                  </h3>
                  <span className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full font-medium">
                    {item.category}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-3 h-20 overflow-y-auto custom-scrollbar">
                  {item.description}
                </p>
                <p className="text-xs text-slate-400">
                  Added: {item.createdAt.toLocaleDateString()}
                </p>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  onClick={() => openModal(item)}
                  title="Edit Blueprint"
                  className="p-2 text-slate-500 hover:text-sky-600 transition-colors"
                >
                  <FiEdit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  title="Delete Blueprint"
                  className="p-2 text-slate-500 hover:text-red-600 transition-colors"
                >
                  <FiTrash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800">
                {editingItem
                  ? "Edit ePantry Blueprint"
                  : "Add New ePantry Blueprint"}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  <FiPackage className="inline mr-1 h-4 w-4" /> Blueprint Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newItem.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  placeholder="e.g., Winter Care Package"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  <FiFileText className="inline mr-1 h-4 w-4" /> Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newItem.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm custom-scrollbar"
                  placeholder="Detailed description of the blueprint and its purpose or contents."
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  <FiTag className="inline mr-1 h-4 w-4" /> Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={newItem.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
                >
                  <FiSave className="mr-2 h-4 w-4" />
                  {editingItem ? "Save Changes" : "Add Blueprint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EPantry;
