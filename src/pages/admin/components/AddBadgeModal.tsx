/* eslint-disable @typescript-eslint/no-explicit-any */
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import BadgeApi from "../../../api/badgeApi";
import { toast } from "react-toastify";
import { IBadge } from "../../../types";

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setNotify: React.Dispatch<React.SetStateAction<boolean>>;
  badge?: IBadge | null;
};

const AddBadgeModal = ({
  isModalOpen,
  setIsModalOpen,
  setNotify,
  badge,
}: Props) => {
  const [badgeName, setBadgeName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [action, setAction] = useState("Add");

  const readFile = (file: Blob | string) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file as Blob);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  useEffect(() => {
    if (badge) {
      setBadgeName(badge.name);
      setDescription(badge.description);
      setAction("Edit");
    }
  }, [badge]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let badgeImage;

    if (image) {
      badgeImage = await readFile(image);
    }

    const payload = {
      name: badgeName,
      image: badgeImage || null,
      description,
    };

    setLoading(true);

    let response;

    try {
      if (badge) {
        response = await BadgeApi.updateBadge(badge._id, payload);
      } else {
        response = await BadgeApi.createBadge(payload);
      }
      console.log(response);
      setLoading(false);
      setIsModalOpen(false);
      setNotify(true);
    } catch (error: any) {
      console.error(error);
      setLoading(false);
      toast.error(error.response.data.message);
    }
  };

  return (
    <div>
      <AlertDialog.Root
        open={isModalOpen}
        onOpenChange={(isOpen: boolean | ((prevState: boolean) => boolean)) => {
          setIsModalOpen(isOpen);
        }}
      >
        <AlertDialog.Overlay className="general_modal_overlay" />

        <AlertDialog.Content className="general_modal">
          <div className="general_modal_content p-4">
            <div className="flex justify-between items-center mb-6">
              <AlertDialog.Title className="font-medium text-2xl">
                Add New Badge
              </AlertDialog.Title>

              <AlertDialog.AlertDialogCancel>
                <FaTimes className="text-gray-700" />
              </AlertDialog.AlertDialogCancel>
            </div>

            <AlertDialog.Description className=" text-left">
              <div>
                <form action="" onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label
                      htmlFor="badgeName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Badge Name
                    </label>
                    <input
                      type="text"
                      name="badgeName"
                      id="badgeName"
                      placeholder="Badge Name"
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                      value={badgeName}
                      onChange={(e) => setBadgeName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="badgeName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      id="description"
                      placeholder="Badge Name"
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="image"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Image
                    </label>
                    <input
                      accept="image/*"
                      type="file"
                      name="image"
                      id="image"
                      placeholder="Image"
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                      onChange={(e) => setImage(e.target.files![0])}
                      // required
                      {...(badge ? {} : { required: true })}
                    />
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-green-400 text-white p-2 rounded-lg w-full"
                    >
                      {loading ? "Loading..." : action}
                    </button>
                  </div>
                </form>
              </div>
            </AlertDialog.Description>

            {/* close */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className=" text-red-400 underline p-2 rounded-lg w-full"
              >
                Close
              </button>
            </div>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  );
};

export default AddBadgeModal;
