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
    impactMeasurement: user.impactMeasurement,
  });

  useEffect(() => {
    ProfileApi.getProfile()
      .then((res) => {
        console.log(res);

        setUserDetails({
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          email: res.data.email,
          impactMeasurement: res.data.impactMeasurement,
        });

        dispatch(updateUser(res.data));
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => {
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
          <label className="text-base font-medium">First Name</label>
          <input
            type="text"
            name="firstName"
            value={userDetails.firstName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="mt-4">
          <label className="text-base font-medium">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={userDetails.lastName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="mt-4">
          <label className="text-base font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={userDetails.email}
            onChange={handleChange}
            disabled={true}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="mt-4">
          <label className="text-base font-medium">Impact Measurement</label>
          <p className="text-xs">
            How do you want to measure your impact on the environment?{" "}
          </p>

          <select name="impactMeasurement" id=""
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={userDetails.impactMeasurement}
            onChange={handleChange}
          >
            <option value="trees">Trees Planted</option>
            <option value="carbon">Carbon Footprint</option>
            <option value="water">Water Footprint</option>
            <option value="birds">Birds Saved</option>
          </select>
          
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
