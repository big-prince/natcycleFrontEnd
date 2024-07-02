import { Link, Outlet, useNavigate } from "react-router-dom";
import Logo from "../../../assets/logo.png";
import MobileNav from "./MobileNav";
import { useAppSelector } from "../../../hooks/reduxHooks";
import { IoNotifications } from "react-icons/io5";

const DashLayout = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  if (!user) navigate("/");

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

      <MobileNav />
    </div>
  );
};

export default DashLayout;
