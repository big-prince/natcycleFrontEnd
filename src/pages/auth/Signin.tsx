/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { login } from "../../reducers/authSlice";
import AuthApi from "../../api/authApi";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import Illustration from "../../assets/new_illustration.svg";
import FullLogo from "../../assets/logo/Group 202@2x.png";
import { toast } from "react-toastify";

const Signin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Get redirect path from location state if available
  const redirectPath = location.state?.redirectAfterLogin || "/home";

  const [signinData, setSigninData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSigninData({
      ...signinData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    AuthApi.signin(signinData)
      .then((res: any) => {
        const payload = {
          token: res.token,
          user: res.user,
        };
        dispatch(login(payload));

        // Check if there's a pending dropoff in sessionStorage
        const pendingDropoff = sessionStorage.getItem("pendingDropoff");

        if (pendingDropoff) {
          toast.success("You can now complete your dropoff");
          navigate("/dropoff/create");
        } else {
          // Use the redirect path from location state or default to home
          navigate(redirectPath);
        }
      })
      .catch((err: any) => {
        console.log(err);
        setLoading(false);
        setError(err.response.data);
      });
  };

  return (
    <div className="px-4">
      <div>
        <img
          className="w-56 m-auto mt-16 mb-6"
          src={FullLogo}
          alt="NatCycle Logo"
        />
      </div>

      <div className="md:block">
        <img
          className="h-60 m-auto object-cover"
          src={Illustration}
          alt="NatCycle Illustration"
        />
      </div>

      <div className="max-w-[450px] m-auto">
        <h1 className="heading mb-6 mt-8 text-center">Welcome Back! Sign In</h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 flex justify-between">
            <p>{error}</p>
            <button onClick={() => setError("")}>X</button>
          </div>
        )}
        <form className="form" onSubmit={handleFormSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={signinData.email}
            onChange={handleChange}
            autoComplete="on"
            required
          />
          <div className="flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={signinData.password}
              onChange={handleChange}
              required
            />
            <span
              onClick={togglePassword}
              className="cursor-pointer -ml-8 mb-2"
            >
              {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
            </span>
          </div>

          {/* forgot password */}
          <Link
            to="/forgot-password"
            className="text-primary text-sm pb-4 underline"
          >
            Forgot Password?
          </Link>

          <button
            className="button bg-green w-full block mt-2"
            type="submit"
            disabled={loading}
          >
            {loading ? "Loading..." : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signin;
