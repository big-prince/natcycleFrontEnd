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
    <div className="max-w-[450px] m-auto relative px-4">
      <div className="flex justify-between items-center mt-8">
        <Link to="/home">
          <img className="h-10 object-cover" src={Logo} alt="NatCycle Logo" />
        </Link>

        <div className="flex items-center">
          <Link to="/notifications" className="text-2xl mr-4">
            <IoNotifications className="text-2xl mr-4" />
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
