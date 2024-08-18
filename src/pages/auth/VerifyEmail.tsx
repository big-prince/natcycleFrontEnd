/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthApi from "../../api/authApi";
import { useAppDispatch } from "../../hooks/reduxHooks";
import FullLogo from "../../assets/logo/Group 202@2x.png";
import Illustration from "../../assets/signup.png";
import { updateUser } from "../../reducers/authSlice";
import { toast } from "react-toastify";

const VerifyEmail = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
  };
  const [error, setError] = useState("");

  const handleVerify = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!otp) {
      setError("OTP is required");
      return;
    }

    if (otp.length !== 6 || isNaN(Number(otp))) {
      setError("OTP must be 6 characters long");
      return;
    }

    setLoading(true);

    AuthApi.verifyEmail({ otp })
      .then((res: any) => {
        console.log(res);

        setLoading(false);

        dispatch(updateUser(res.data));

        navigate("/home");
      })
      .catch((err: any) => {
        console.log(err);
        setLoading(false);
        setError(err.response?.data?.message);
      });
  };

  const handleRequestOtp = () => {
    setLoading(true);

    AuthApi.requestOtp()
      .then((res: any) => {
        console.log(res);
        toast.success("OTP sent successfully");
        setLoading(false);
      })
      .catch((err: any) => {
        console.log(err);
        setLoading(false);
      });
  };

  return (
    <div>
      <div>
        <Link to="/">
          <img
            className="w-56 m-auto mt-16 mb-6"
            src={FullLogo}
            alt="NatCycle Logo"
          />
        </Link>
      </div>

      <div className="md:block">
        <img
          className="h-60 m-auto object-cover"
          src={Illustration}
          alt="NatCycle Illustration"
        />
      </div>

      <div className="max-w-[450px] m-auto">
        <h1 className="heading mb-6 mt-8 text-center">Verify Your Email</h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 flex justify-between">
            <p>{error}</p>
            <button onClick={() => setError("")}>X</button>
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div className="mb-4">
            <label htmlFor="otp" className="block text-sm font-medium mb-2">
              OTP
            </label>
            <input
              maxLength={6}
              minLength={6}
              type="number"
              id="otp"
              name="otp"
              value={otp}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 text-lg"
              required
            />
          </div>

          <div className="mb-4">
            <button
              type="button"
              onClick={handleRequestOtp}
              className="text-blue-500"
            >
              Didn't receive OTP? Resend
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-md"
          >
            {loading ? "Loading..." : "Verify Email"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
