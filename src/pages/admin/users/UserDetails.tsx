/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import UsersApi from "../../../api/usersApi";

const UserDetails = () => {
  // const navigate = useNavigate();

  const [user, setUser] = useState<any>();
  const [loading, setLoading] = useState(false);

  //get id from url params
  const { id } = useParams();

  useEffect(() => {
    setLoading(true);

    UsersApi.getUser(id!)
      .then((res) => {
        console.log(res.data);
        setUser(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [id]);

  const [referredUsers, setReferredUsers] = useState<any[]>([]);

  useEffect(() => {
    UsersApi.getReferrals(id!)
      .then((res) => {
        // console.log(res.data);
        setReferredUsers(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        {`${user?.firstName} ${user?.lastName}`} Details
      </h2>

      {loading && <p className="text-lg font-light my-8">Loading...</p>}

      <div className="bg-white rounded-md shadow-md p-4">
        {/* basic info */}
        <div className="w-full">
          <div className="">
            {/* profile picture */}
            <div className="mb-4">
              <img
                src={
                  user?.profilePicture?.url ||
                  "https://i.pinimg.com/564x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg"
                }
                alt="profile"
                className="rounded-full object-cover"
                style={{ width: "100px", height: "100px" }}
              />
            </div>

            <div className="flex mb-4 gap-6">
              <div className="">
                <p className="font-bold text-black mr-4">{user?.firstName}</p>
                <p className="text-gray-500 text-xs">First Name</p>
              </div>

              <div className="">
                <p className="font-bold text-black">{user?.lastName}</p>
                <p className="text-gray-500 text-xs">Last Name</p>
              </div>
            </div>

            <div className="md:flex mb-4">
              <div className="mb-4 md:mb-0">
                <p className="font-bold text-black mr-4">{user?.email}</p>
                <p className="text-gray-500 text-xs">Email</p>
              </div>

              {/* <div className="">
                <p className="font-bold text-black">{user?.phone}</p>
                <p className="text-gray-500 text-xs">Phone Number</p>
              </div> */}
            </div>

            {/* date joined and verification status */}
            <div className="flex mb-4">
              <div className="">
                <p className="font-bold text-black mr-4">
                  {new Date(user?.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-500 text-xs">Date Joined</p>
              </div>
            </div>
          </div>
        </div>

        {/* user dashboard data */}
        <h2 className="text-xl mb-4 text-darkgreen font-semibold">
          Users Stats
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:flex mb-4">
            <div className="mb-4 md:mb-0">
              <p className="font-bold text-black mr-4">{user?.pointsEarned}</p>
              <p className="text-gray-500 text-xs">Points Earned</p>
            </div>
          </div>

          <div className="md:flex mb-4">
            <div className="mb-4 md:mb-0">
              <p className="font-bold text-black mr-4">{user?.carbonUnits}</p>
              <p className="text-gray-500 text-xs">Carbon Units</p>
            </div>
          </div>

          <div className="md:flex mb-4">
            <div className="mb-4 md:mb-0">
              <p className="font-bold text-black mr-4">
                {user?.totalItemsCollected}
              </p>
              <p className="text-gray-500 text-xs">Items Recycled</p>
            </div>
          </div>

          <div className="md:flex mb-4">
            <Link
              to={`/admin/pickups?userId=${user?._id}`}
              className="mb-4 md:mb-0"
            >
              <p className="text-darkgreen font-bold underline text-xs">
                View Collections
              </p>
            </Link>
          </div>
        </div>

        <h2 className="text-xl mb-2 text-darkgreen font-semibold">
          Items Count
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:flex mb-4">
            <div className="mb-4 md:mb-0">
              <p className="font-bold text-black mr-4">
                {user?.itemsCount.plastic}
              </p>
              <p className="text-gray-500 text-xs">Plastic</p>
            </div>
          </div>

          <div className="md:flex mb-4">
            <div className="mb-4 md:mb-0">
              <p className="font-bold text-black mr-4">
                {user?.itemsCount.fabric}
              </p>
              <p className="text-gray-500 text-xs">Fabric</p>
            </div>
          </div>

          <div className="md:flex mb-4">
            <div className="mb-4 md:mb-0">
              <p className="font-bold text-black mr-4">
                {user?.itemsCount.glass}
              </p>
              <p className="text-gray-500 text-xs">Glass</p>
            </div>
          </div>

          <div className="md:flex mb-4">
            <div className="mb-4 md:mb-0">
              <p className="font-bold text-black mr-4">
                {user?.itemsCount.paper}
              </p>
              <p className="text-gray-500 text-xs">Paper</p>
            </div>
          </div>
        </div>

        {/* referred users */}
        <div className="mt-8">
          <h2 className="text-2xl font-medium mb-4">Referred Users</h2>
          <div className="w-full">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">S/N</th>
                  <th className="text-left">Name</th>
                  <th className="text-left">Email</th>
                  <th className="text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {referredUsers &&
                  referredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{referredUsers.indexOf(user) + 1}</td>
                      <td>
                        <Link
                          to={`/admin/users/${user._id}`}
                          className="text-blue-500"
                        >
                          {user.firstName} {user.lastName}
                        </Link>
                      </td>
                      <td>{user.email}</td>
                      <td>{new Date(user.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
