import { useState } from "react";
import Logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";

const Signup = () => {
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
    console.log(signupData);

    navigate("/");
    return


    authApi
      .login(signupData)
      .then((res) => {
        console.log(res);
        setLoading(false);

        navigate("/");
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        setError(err.response.data);
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
          <div className="alert">
            <p>{error}</p>
            <button onClick={() => setError("")}>X</button>
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
