/* eslint-disable @typescript-eslint/no-explicit-any */
import { SetStateAction, useState } from "react";
import Logo from "../../assets/logo.png";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthApi from "../../api/authApi";

const Signup = () => {
  const [searchParams] = useSearchParams();

  const [referralId, setReferralId] = useState(searchParams.get("referral") || "");

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    
    const data = {
      ...signupData,
      referralId,
    };
    console.log(data);
    
    setLoading(true);
    AuthApi
      .signup(data)
      .then((res: any) => {
        console.log(res);
        setLoading(false);
        // toast.success("Account created successfully. Please login.");
        navigate("/");
      })
      .catch((err: { response: { data: SetStateAction<string>; }; }) => {
        console.log(err);
        setLoading(false);
        // setError(err?.response?.data || "An error occurred. Please try again.");
      })
      .finally(() => {
        setLoading(false);
        setTimeout(() => {
          setError("");
        }, 3000);
      });
  };

  return (
    <div className="px-4">
      <div>
        <img className="w-56 m-auto mt-16" src={Logo} alt="NatCycle Logo" />
      </div>

      <div className="max-w-[450px] m-auto">
        <h1 className="heading mb-6 mt-8 text-center">Create An Account</h1>
        {error && (
          <div className="bg-red-100 flex items-center p-2 mb-3 rounded-lg text-sm font-medium">
            <p>{error}</p>
          </div>
        )}
        <form className="form" onSubmit={handleFormSubmit}>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={signupData.firstName}
            onChange={handleChange}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={signupData.lastName}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={signupData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={signupData.password}
            onChange={handleChange}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={signupData.confirmPassword}
            onChange={handleChange}
          />
          {/* referral Id */}
          <input
            type="text"
            name="referralId"
            placeholder="Referral ID"
            value={referralId}
            onChange={(e) => setReferralId(e.target.value)}
          />
          
          
          <button className="button bg-green w-full" type="submit"
            disabled={loading}
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-4">
          Already have an account?{" "}
          <Link to="/" className="text-darkgreen">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
