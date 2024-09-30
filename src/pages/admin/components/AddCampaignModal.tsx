import React, { useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import CampaignApi from "../../../api/campaignApi";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchCampaigns: () => void;
};

const recyclables = ["plastic", "fabric", "glass", "paper"];


const AddCampaignModal = ({
  isModalOpen,
  setIsModalOpen,
  fetchCampaigns,
}: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState("");
  const [material, setMaterial] = useState("");
  const [goal, setGoal] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const readFile = (file: Blob | string) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file as Blob);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // limit size to 5mb
    if (e.target.files![0].size > 5000000) {
      toast.error("Image size should not exceed 5mb");
      return;
    }

    setImage(e.target.files![0]);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (image) {
      const campaignImage = await readFile(image);

      const payload = {
        name,
        description,
        endDate,
        material,
        goal,
        image: campaignImage,
      };

      setLoading(true);
      CampaignApi.createCampaign(payload)
        .then((response) => {
          console.log(response);
          setLoading(false);
          toast.success("Campaign added successfully");
          setName("");
          setDescription("");
          setEndDate("");
          setMaterial("");
          setGoal("");
          setImage(null);
          setIsModalOpen(false);
          fetchCampaigns();
        })
        .catch((error) => {
          console.error(error);
          toast.error(error.response.data.message || "An error occurred");
          setLoading(false);
        });
    }
  };

  return (
    <div>
      <AlertDialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
        <AlertDialog.Content className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-white p-6 rounded-md">
          <div className="flex justify-between items-center mb-6">
            <AlertDialog.Title className="font-medium text-2xl">
              Add New Campaign
            </AlertDialog.Title>

            <AlertDialog.AlertDialogCancel>
              <FaTimes className="text-gray-700" />
            </AlertDialog.AlertDialogCancel>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Material
              </label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select Material</option>
                {recyclables.map((material) => (
                  <option key={material} value={material}>
                    {material}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Goal
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Image
              </label>
              <input
                type="file"
                about="image/*"
                // onChange={(e) => setImage(e.target.files![0])}
                onChange={handleImageChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-darkgreen text-white px-4 py-2 rounded-md"

              >
                {loading ? "Loading..." : "Add Campaign"}
              </button>
            </div>
          </form>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  );
};

export default AddCampaignModal;
