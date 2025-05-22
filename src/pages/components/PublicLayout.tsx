import { Link, Outlet } from "react-router-dom";
import Logo from "../../assets/logo/Group 202@2x.png";

const PublicLayout = () => {
  return (
    <div className="max-w-[550px] m-auto relative px-4">
      <div className="flex justify-between items-center mt-6 mb-8">
        <Link to="/">
          <img className="object-cover h-8" src={Logo} alt="NatCycle Logo" />
        </Link>

        {/* Guest Div Indicator */}
        <div className="flex items-center">
          <span className="mr-2 text-sm font-medium text-gray-600  px-2 py-1 rounded-md">
            Guest
          </span>
          <Link
            to="/"
            className="text-sm font-medium text-primary-600 bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors duration-200"
          >
            Login?
          </Link>
        </div>
      </div>

      <Outlet />
    </div>
  );
};

export default PublicLayout;
