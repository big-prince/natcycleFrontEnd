/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import UsersApi from "../../../api/usersApi";
import { toast } from "react-toastify"; // For potential error messages

// Define a basic interface for the user for better type safety
interface NatCycleUser {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  createdAt: string;
  // Add other fields if necessary
}

const AdminUsers = () => {
  const [users, setUsers] = useState<NatCycleUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const highlightedUserId = searchParams.get("highlightUser");
  const highlightedRowRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    setLoading(true);
    UsersApi.getUsers()
      .then((res) => {
        // Assuming res.data is the array of users
        if (res && Array.isArray(res.data)) {
          setUsers(res.data);
        } else if (res && Array.isArray(res)) {
          // If API directly returns array
          setUsers(res);
        } else {
          console.error("Unexpected response structure for users:", res);
          setUsers([]);
          toast.error("Failed to load users due to unexpected data format.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        toast.error(
          err.response?.data?.message ||
            "An error occurred while fetching users."
        );
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (highlightedUserId && users.length > 0) {
      const userRow = document.getElementById(`user-row-${highlightedUserId}`);
      if (userRow) {
        highlightedRowRef.current = userRow as HTMLTableRowElement;

        userRow.scrollIntoView({ behavior: "smooth", block: "center" });

        // Apply highlight classes
        userRow.classList.add(
          "bg-sky-100",
          "transition-all",
          "duration-300",
          "ease-in-out"
        );
        userRow.classList.add("ring-2", "ring-sky-500", "ring-offset-1");

        // Remove highlight after a delay
        const timer = setTimeout(() => {
          userRow.classList.remove(
            "bg-sky-100",
            "ring-2",
            "ring-sky-500",
            "ring-offset-1"
          );
        }, 3500);

        return () => clearTimeout(timer);
      }
    }
  }, [highlightedUserId, users]);

  return (
    <div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="admin_page_heading">All Users</h3>
        </div>

        {loading && (
          <p className="my-4 font-bold text-center text-slate-600">
            Loading Users...
          </p>
        )}

        {!loading && users.length === 0 && (
          <p className="my-4 text-center text-slate-500">No users found.</p>
        )}

        {!loading && users.length > 0 && (
          <div className="bg-white rounded-md shadow-md p-2 md:p-4 text-sm overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2">S/N</th>
                  <th className="text-left py-3 px-2">FIRST NAME</th>
                  <th className="text-left py-3 px-2">LAST NAME</th>
                  <th className="text-left py-3 px-2 hidden md:table-cell">
                    EMAIL
                  </th>
                  <th className="text-left py-3 px-2">DATE JOINED</th>
                  <th className="text-left py-3 px-2">ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user._id}
                    id={`user-row-${user._id}`}
                    className="border-b border-gray-200 hover:bg-slate-50"
                  >
                    <td className="py-3 px-2">{index + 1}</td>
                    <td className="py-3 px-2">
                      <Link
                        to={`/admin/users/${user._id}`}
                        className="text-sky-600 hover:underline"
                      >
                        {user.firstName}
                      </Link>
                    </td>
                    <td className="py-3 px-2">{user.lastName}</td>
                    <td className="py-3 px-2 hidden md:table-cell">
                      {user?.email || "N/A"}
                    </td>
                    <td className="py-3 px-2">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2 text-sm">
                      <Link to={`/admin/users/${user._id}`}>
                        <button className="text-sky-700 hover:text-sky-900 font-medium py-1 px-2 rounded-md hover:bg-sky-100 transition-colors">
                          View Details
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
