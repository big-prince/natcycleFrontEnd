import { useState } from "react";
import Logo from "../../assets/logo.png";
import HomeIllustration from "../../assets/homeIllustration.png";
import { Link, useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { login } from "../../reducers/authSlice";

const Signin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(signinData);

    navigate("/home");
    return

    authApi
      .login(signinData)
      .then((res) => {
        console.log(res);
        setLoading(false);

        const payload = {
          token: res.data.token!,
          user: res.data.user!,
        };
        dispatch(login(payload));

        navigate("/account/dashboard");
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
        <img className="w-56 m-auto mt-16 mb-6" src={Logo} alt="NatCycle Logo" />
      </div>

      <div className="md:block">
        <img
          className="h-60 m-auto object-cover"
          src={HomeIllustration}
          alt="NatCycle Illustration"
        />
      </div>

      <div className="max-w-[450px] m-auto">
        <h1 className="heading mb-6 mt-8 text-center">Welcome Back! Sign In</h1>

        {error && (
          <div className="alert">
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
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={signinData.password}
            onChange={handleChange}
          />
          <button
            className="button bg-green w-full"
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
