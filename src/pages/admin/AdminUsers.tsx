import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UsersApi from "../../api/usersApi";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="admin_page_heading">All Users</h3>
        </div>

        {loading ? <p className="my-4 font-bold">Loading...</p> : ""}

        <div className="bg-white rounded-md shadow-md p-2 md:p-4 text-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3">ID</th>
                <th className="text-left py-3">NAME</th>
                <th className="text-left py-3">LAST NAME</th>
                <th className="text-left py-3 hidden md:block">EMAIL</th>
                {/* date joined */}
                <th className="text-left py-3">DATE JOINED</th>
                <th className="text-left py-3">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {users &&
                users.map((user: any, index: number) => (
                  <tr key={user._id} className="border-b border-gray-200">
                    <td className="py-3">{index + 1}</td>
                    <td className="py-3">
                      <Link to={`/admin/users/${user._id}`}>
                        {user.firstName}
                      </Link>
                    </td>
                    <td className="py-3">{user.lastName}</td>
                    <td className="py-3 hidden md:block">{user?.email}</td>
                    <td className="py-3">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-sm">
                      <Link to={`/admin/users/${user._id}`}>
                        <button className="text-main underline px-3 py-1 rounded-md mr-2">
                          View
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
