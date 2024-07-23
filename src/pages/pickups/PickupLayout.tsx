import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { PiTruckDuotone } from "react-icons/pi";
import { GrSettingsOption } from "react-icons/gr";
import { MdOutlinePersonPin } from "react-icons/md";
import Logo from "../../assets/logo/Group 202@2x.png";
import { toast } from "react-toastify";
import AuthApi from "../../api/authApi";
import { useDispatch } from "react-redux";

const PickupLayout = () => {
  const linkList = [
    {
      icon: <PiTruckDuotone className="m-auto" />,
      name: "Pickups",
      link: "/admin/pickup/pickups",
    },
    {
      icon: <GrSettingsOption className="m-auto" />,
      name: "Settings",
      link: "/admin/pickup/settings",
    },
    {
      icon: <MdOutlinePersonPin className="m-auto" />,
      name: "Profile",
      link: "/admin/pickup/profile",
    },
  ];

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // localStorage.removeItem("token");
    AuthApi.signout().then((res) => {
      console.log(res);
      dispatch({ type: "LOGOUT" });
      navigate("/");
    }).then((err) => {
      console.log(err);
      toast.error("An error occurred. Please try again");
    });
  };

  return (
    <div>
      <div className="m-auto px-4 fixed bg-white w-full pt-4 top-0 pb-4 flex justify-between items-center">
        <div className="flex justify-between items-center ">
          <Link to="/home">
            <img className="h-10 object-cover" src={Logo} alt="NatCycle Logo" />
          </Link>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handleLogout}
            className="text-red-500 text-sm font-semibold underline"
          >
            Logout
          </button>
        </div>
      </div>


      <div className="my-28 md:px-20">
        <Outlet />
      </div>

      <div>
        <div className="fixed bottom-6 w-full left-0 px-4">
          <div className="bg-bg rounded-2xl py-4">
            <div className="flex justify-around w-full mobileLink items-center">
              {linkList.map((link, index) => (
                <NavLink key={index} to={link.link} className="text-center">
                  <p className="text-xl">{link.icon}</p>
                  <p className="text-xs mt-1">{link.name}</p>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickupLayout;
