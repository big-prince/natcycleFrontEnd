import React, { useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import CampaignApi from "../../../api/campaignApi";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import SelectCampaignDropOffLocation from "./SelectCampaignDropOffLocation";

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchCampaigns: () => void;
};

const AddCampaignModal = ({
  isModalOpen,
  setIsModalOpen,
  fetchCampaigns,
}: Props) => {
  const [loading, setLoading] = useState(false);

  const [campaignForm, setCampaignForm] = useState({
    name: "",
    description: "",
    endDate: "",
    material: "",
    goal: "",
    image: null as File | null,
    dropOffLocationId: null,
  });

  const handleCampaignFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCampaignForm({
      ...campaignForm,
      [name]: value,
    });
  };

  const readFile = (file: Blob | string) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file as Blob);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].size > 5000000) {
        toast.error("Image size should not exceed 5mb");
        return;
      }
      setCampaignForm({
        ...campaignForm,
        image: e.target.files[0],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!campaignForm.name || !campaignForm.description || !campaignForm.endDate || !campaignForm.goal || !campaignForm.dropOffLocationId) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (campaignForm.image) {
      const campaignImage = await readFile(campaignForm.image);

      const payload = {
        name: campaignForm.name,
        description: campaignForm.description,
        endDate: campaignForm.endDate,
        goal: campaignForm.goal,
        image: campaignImage,
        dropOffLocationId: campaignForm.dropOffLocationId,
      };

      setLoading(true);
      CampaignApi.createCampaign(payload)
        .then((response) => {
          console.log(response);
          setLoading(false);
          toast.success("Campaign added successfully");
          setCampaignForm({
            name: "",
            description: "",
            endDate: "",
            material: "",
            goal: "",
            image: null,
            dropOffLocationId: null,
          });
          setIsModalOpen(false);
          fetchCampaigns();
        })
        .catch((error) => {
          console.error(error);
          toast.error(error.response.data.message || "An error occurred");
          setLoading(false);
        });
    } else {
      toast.error("Please select an image");
    }
  };

  return (
    <div>
      <AlertDialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
        <AlertDialog.Content className="absolute top-1/2 left-1/2 p-6 w-full max-w-xl bg-white rounded-md transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex justify-between items-center mb-6">
            <AlertDialog.Title className="text-2xl font-medium">
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
                name="name"
                value={campaignForm.name}
                onChange={handleCampaignFormChange}
                className="input"
                required
              />
            </div>

            <div>
              <SelectCampaignDropOffLocation
                campaignForm={campaignForm}
                setCampaignForm={setCampaignForm}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={campaignForm.description}
                onChange={handleCampaignFormChange}
                required
                className="input"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={campaignForm.endDate}
                onChange={handleCampaignFormChange}
                className="input"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Goal
              </label>
              <input
                type="number"
                name="goal"
                value={campaignForm.goal}
                onChange={handleCampaignFormChange}
                className="input"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="input"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-white rounded-md bg-darkgreen"
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

