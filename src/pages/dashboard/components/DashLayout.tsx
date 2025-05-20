import { Link, Outlet, useNavigate } from "react-router-dom";
import Logo from "../../../assets/logo/Group 202@2x.png";
import MobileNav from "./MobileNav";
import { useAppSelector } from "../../../hooks/reduxHooks";
import { BsUpcScan } from "react-icons/bs"; // Added for SCAN button
import { useEffect } from "react";

const DashLayout = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Or a loading spinner/page
  }

  return (
    <div className="max-w-[550px] m-auto relative px-4 pb-24">
      {" "}
      {/* Added pb-24 for MobileNav */}
      <div className="flex justify-between items-center mt-6 mb-3">
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
      {/* MobileNav container - padding adjusted if MobileNav handles its own */}
      <div className="p-0">
        <MobileNav />
      </div>
    </div>
  );
};

export default DashLayout;
