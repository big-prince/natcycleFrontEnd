import { Link, Outlet, useNavigate } from "react-router-dom";
import Logo from "../../../assets/logo/Group 202@2x.png";
import MobileNav from "./MobileNav";
import { useAppSelector } from "../../../hooks/reduxHooks";
import { IoNotifications } from "react-icons/io5";
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
    return null;
  }

  return (
    <div className="max-w-[550px] m-auto relative px-4">
      <div className="flex justify-between items-center mt-6 mb-3">
        <Link to="/home">
          <img className="object-cover h-10" src={Logo} alt="NatCycle Logo" />
        </Link>

        <div className="flex items-center">
          <Link to="/notifications" className="text-2xl">
            <IoNotifications className="mr-4 text-2xl" />
          </Link>
        </div>
      </div>

      <Outlet />

      <div className="p-8">
        <MobileNav />
      </div>
    </div>
  );
};

export default DashLayout;
