import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import Logo from "../../../assets/logo/Group 202@2x.png";
import MobileNav from "./MobileNav";
import { useAppSelector } from "../../../hooks/reduxHooks";
import { BsUpcScan } from "react-icons/bs";
import { useEffect } from "react";

const DashLayout = () => {
  const location = useLocation();
  const [neglect, setNeglect] = React.useState(false);

  //check if screen is Desktop Size
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  //Inform user on Desktop that this is a mobile optimized app
  if (isDesktop && neglect === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg text-center">
          <img className="h-16 mx-auto mb-2" src={Logo} alt="NatCycle Logo" />
          <h1 className="text-2xl font-semibold text-gray-800">
            Mobile Experience Optimized
          </h1>
          <p className="text-gray-600">
            This application is designed for optimal viewing on mobile devices.
            Please access from your mobile phone for the best experience.
          </p>
          <button
            onClick={() => setNeglect(true)}
            className="px-4 py-2 mt-4 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:none"
          >
            Continue that way?
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`max-w-[550px] m-auto relative pb-24 ${
        location.pathname === "/where" ? "px-0" : "px-4"
      }`}
    >
      {" "}
      <div className={`flex justify-between items-center mt-6 mb-3 ${location.pathname === "/where" ? "px-4" : ""}`}>
        <Link to="/home">
          <img className="object-cover h-10" src={Logo} alt="NatCycle Logo" />
        </Link>

        <div className="flex items-center ">
          {/* SCAN Button */}
          <button
            onClick={() => alert("SCAN functionality to be implemented")}
            className="flex items-center text-sm font-medium text-black"
          >
            <span className="mr-1 font-bold text-xm underline">SCAN</span>
            <BsUpcScan className="text-2xl" />
          </button>
        </div>
      </div>
      <Outlet />
      <div className="fixed z-50 bottom-0 left-0 right-0 p-0 mb-0">
        <MobileNav />
      </div>
    </div>
  );
};

export default DashLayout;
