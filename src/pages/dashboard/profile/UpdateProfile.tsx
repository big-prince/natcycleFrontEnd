/* eslint-disable react-hooks/exhaustive-deps */
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import ProfileApi from "../../../api/profile.Api";
import { toast } from "react-toastify";
import { updateUser } from "../../../reducers/authSlice";

const UpdateProfile = () => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const [userDetails, setUserDetails] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });

  useEffect(() => {
    ProfileApi.getProfile()
      .then((res) => {
        console.log(res);

        setUserDetails({
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          email: res.data.email,
        });

        dispatch(updateUser(res.data));
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserDetails({
      ...userDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log(userDetails);

    ProfileApi.updateProfile(userDetails)
      .then((res) => {
        console.log(res);
        toast.success("Profile Updated Successfully");
        dispatch(updateUser(res.data));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div>
      <form className=" p-4 rounded-lg" onSubmit={handleSubmit}>
        <p className="text-lg font-semibold">Update Profile</p>
        <div className="mt-4">
          <label className="text-sm">First Name</label>
          <input
            type="text"
            name="firstName"
            value={userDetails.firstName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="mt-4">
          <label className="text-sm">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={userDetails.lastName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="mt-4">
          <label className="text-sm">Email</label>
          <input
            type="email"
            name="email"
            value={userDetails.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="mt-8">
          <button className="bg-black text-white p-2 rounded-lg w-full">
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfile;
