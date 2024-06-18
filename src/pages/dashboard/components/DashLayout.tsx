import { Link, Outlet } from "react-router-dom";
import Logo from "../../../assets/logo.png";
import MobileNav from "./MobileNav";

const tempImage =
  "https://vignette2.wikia.nocookie.net/naruto/images/1/12/La_Promesa_de_Naruto.png/revision/latest?cb=20110825232746&path-prefix=es";

const DashLayout = () => {
  return (
    <div className="max-w-[450px] m-auto relative h-screen px-4">
      <div className="flex justify-between items-center mt-8">
        <img className="w-56 object-cover" src={Logo} alt="NatCycle Logo" />

        <div className="flex items-center">
          <Link to="/profile">
            <img
              className="w-12 h-12 rounded-full"
              src={tempImage}
              alt="User"
            />
            <div className="ml-4 hidden">
              <h1 className="text-xl font-bold">John Doe</h1>
            </div>
          </Link>
        </div>
      </div>

      <Outlet />

      <MobileNav />
    </div>
  );
};

export default DashLayout;
