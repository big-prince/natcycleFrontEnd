import { Link, Outlet } from "react-router-dom";
import Logo from "../../assets/logo/Group 202@2x.png";
import MobileNav from "../dashboard/components/MobileNav";
import { IoNotifications } from "react-icons/io5";

const PublicLayout = () => {
  return (
    <div className="max-w-[550px] m-auto relative px-4">
      <div className="flex justify-between items-center mt-6 mb-3">
        <Link to="/">
          <img className="object-cover h-10" src={Logo} alt="NatCycle Logo" />
        </Link>

        <div className="flex items-center">
          <Link to="/" className="text-2xl">
            <IoNotifications className="mr-4 text-2xl" />
          </Link>
        </div>
      </div>

      <Outlet />
    </div>
  );
};

export default PublicLayout;
