/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { login } from "../../reducers/authSlice";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import AuthApi from "../../api/authApi";

type IPayload = {
  token: string;
  user: any;
};

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const dispatch = useAppDispatch();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const body = {
      email,
      password,
    };
    console.log(body);

    AuthApi
      .signin({ email, password})
      .then((res) => {
        console.log(res);
        setLoading(false);

        const payload: IPayload = {
          token: res.token!,
          user: res.user!,
        };
        dispatch(login(payload));

        if (res.user.isAdmin) {
          navigate("/admin/dashboard");
          return;
        }

        navigate("/account/home");
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
    <div>
      <div>
        <div className="h-screen pt-24">
          <div className="p-8 md:p-10 max-w-md m-auto bg-bg rounded-lg">
            <h1 className="text-2xl font-bold">NatCycle Admin Login</h1>

            {error && (
              <div
                className="bg-red-100 border mt-4 border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <form action="" onSubmit={handleSubmit}>
              <div className="mt-10">
                <input
                  className="p-3 py-3 w-full rounded-lg border border-gray-300"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="text"
                  required
                  autoComplete="on"
                />
              </div>

              <div className="mt-4">
                <div className="relative flex">
                  <input
                    className="p-3 py-3 w-full rounded-lg border border-gray-300"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={!showPassword ? "password" : "text"}
                    required
                    autoComplete="on"
                  />
                  <span className="absolute right-3 top-4 text-lg">
                    {!showPassword ? (
                      <AiOutlineEyeInvisible
                        onClick={() => setShowPassword(true)}
                      />
                    ) : (
                      <AiOutlineEye onClick={() => setShowPassword(false)} />
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <button
                  className="bg-darkgreen text-white p-3 py-3 rounded-lg w-full text-base font-semibold"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Login"}
                </button>
              </div>

              <Link to="/">
                <p className="mt-4 text-center text-sm font-semibold text-gray-700 hover:text-main">
                  Back to Home
                </p>
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
