/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import authApi from "../../api/authApi";
import * as Tabs from "@radix-ui/react-tabs";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import FullLogo from "../../assets/logo/Group 202@2x.png";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleForgotPassword = async (e: any) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.forgotPassword(email);
      console.log(response);
      setSelectedTab("reset");
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      setError((error as any).response.data.message);
    }
  };

  const [selectedTab, setSelectedTab] = useState("forgot");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleResetPassword = async (e: any) => {
    e.preventDefault();

    if (!otp || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.resetPassword({
        email,
        newPassword: password,
        otp,
      });
      console.log(response);
      toast.success("Password reset successful");
      navigate("/");
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <img
          className="w-56 m-auto mt-16 mb-6"
          src={FullLogo}
          alt="NatCycle Logo"
        />
      </div>

      <Tabs.Root
        defaultValue="forgot"
        value={selectedTab}
        onValueChange={setSelectedTab}
      >
        <div className="flex justify-center bg-gray-50 min-h-[600px] px-4 w-full">
          <Tabs.Content value="forgot" className="w-full">
            <div className="max-w-[35rem] mx-auto my-16 w-full">
              <div className="border-2 border-gray-200 p-4 rounded-lg my-10">
                <h4 className="text-2xl font-bold mb-4">Forgot Password</h4>

                <p className="mb-6">
                  Enter your registered email to begin password reset process
                </p>

                {error && (
                  <div
                    className="bg-red-100 text-red-400 p-3 mb-4 border-l-4 border-red-600"
                    onClick={() => setError("")}
                  >
                    {error}
                  </div>
                )}

                <form
                  className="form"
                  action=""
                  onSubmit={handleForgotPassword}
                >
                  <div className="mb-6">
                    <label htmlFor="" className="font-medium mb-4 hidden">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="mb-4">
                    <button
                      className="button bg-green w-full block mt-2"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Reset Password"}
                    </button>
                  </div>
                </form>

                {/* signin */}
                <div className="text-left underline">
                  <span
                    onClick={() => navigate("/")}
                    className="text-primary cursor-pointer items-center"
                  >
                    Sign in
                  </span>
                </div>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="reset" className="w-full">
            <div className="max-w-[35rem] mx-auto my-16 w-full">
              <div className="border-2 border-gray-200 p-4 rounded-lg my-10">
                <h4 className="text-2xl font-bold mb-8">Reset Password</h4>

                <p className="mb-6">
                  Enter the OTP sent to your email and your new password
                </p>

                {error && (
                  <div className="bg-red-100 text-red-500 p-3 mb-4 rounded">
                    {error}
                  </div>
                )}

                <form className="form" action="" onSubmit={handleResetPassword}>
                  <div className="mb-4">
                    <label htmlFor="" className="font-medium mb-4">
                      OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      placeholder="Enter OTP"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="" className="font-medium mb-4">
                      New Password
                    </label>
                    <input
                      type={!showPassword ? "password" : "text"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={8}
                      required
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="" className="font-medium mb-4">
                      Confirm Password
                    </label>
                    <div className="relative flex">
                      <input
                        type={!showPassword ? "password" : "text"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        minLength={8}
                        required
                        placeholder="Confirm new password"
                      />
                      <span className="absolute right-3 top-4 text-lg">
                        {!showPassword ? (
                          <AiOutlineEyeInvisible
                            onClick={() => setShowPassword(true)}
                          />
                        ) : (
                          <AiOutlineEye
                            onClick={() => setShowPassword(false)}
                          />
                        )}
                      </span>
                    </div>
                  </div>

                  {/* try again */}
                  <div className="text-left underline mb-6">
                    <span
                      onClick={() => setSelectedTab("forgot")}
                      className="text-primary cursor-pointer"
                    >
                      Did not receive OTP? Try again
                    </span>
                  </div>

                  <div className="mb-4">
                    <button
                      className="button bg-green w-full block mt-2"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Reset Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
};

export default ForgotPassword;
