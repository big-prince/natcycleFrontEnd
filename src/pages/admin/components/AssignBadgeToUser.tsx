/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { IBadge } from "../../../types";
import UsersApi from "../../../api/usersApi";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { toast } from "react-toastify";
import BadgeApi from "../../../api/badgeApi";

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  badge: IBadge | null;
};

const AssignBadgeToUser = ({ badge, isModalOpen, setIsModalOpen }: Props) => {
  const [user, setUser] = useState('');

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    setLoading(true);

    UsersApi.getUsers()
      .then((res) => {
        console.log(res.data);
        setUsers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    if (loading) return;
    console.log("AssignBadgeToUser handleSubmit");

    setSubmitting(true);

    if (!user) {
      toast.error("Please select a user");
      setSubmitting(false);
      return;
    }

    if (!badge) {
      toast.error("Badge not found");
      setSubmitting(false);
      return;
    }

    BadgeApi.assignBadgeToUser(user, badge._id)
      .then((res) => {
        console.log(res);
        toast.success("Badge assigned to user successfully");
        setSubmitting(false);
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response.data.message || "An error occurred. Please try again.");
        setSubmitting(false);
      });
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
          <div>
            <form action="" onSubmit={handleSubmit}>
              <div className="font-bold text-2xl">Assign Badge to User</div>
              <div className="mt-4">
                <label
                  htmlFor="user"
                  className="block text-sm font-medium text-gray-700"
                >
                  User
                </label>
                <select
                  id="user"
                  name="user"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  onChange={(e) => setUser(e.target.value)}
                >
                  <option value="">Select User</option>
                  {users.map((user: any) => (
                    <option key={user._id} value={user._id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-darkgreen border border-transparent rounded-md shadow-sm hover:bg-darkgreen focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-darkgreen"
                >
                  {submitting ? "Assigning..." : "Assign"}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className=" text-red-400 underline p-2 rounded-lg w-full"
              >
                Close
              </button>
            </div>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  );
};

export default AssignBadgeToUser;
