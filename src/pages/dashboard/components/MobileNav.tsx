import { BiHome } from "react-icons/bi";import { LuLeafyGreen } from "react-icons/lu";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../../../hooks/reduxHooks";
import { FiMapPin } from "react-icons/fi";
const linkList = [
  {
    icon: <BiHome className="m-auto text-x2xl" />,
    name: "Home",
    link: "/home",
  },
  {
    icon: <LuLeafyGreen className="m-auto" />,
    name: "Impact",
    link: "/Impact",
  },
  {
    icon: <FiMapPin className="m-auto" />,
    name: "Where",
    link: "/where",
  },
];

const MobileNav = () => {
  const user = useAppSelector((state) => state.auth.user);
  const tempImage = "https://i.ibb.co/sq0WtbH/trees-119580.png";

  return (
    <div className="fixed bottom-6 w-full left-0 px-4 z-[3000]">
      <div className="py-4 rounded-2xl bg-bg h-[100px]">
        <div className="flex justify-around items-center w-full mobileLink h-200px">
          {linkList.map((link, index) => (
            <NavLink key={index} to={link.link} className="text-center">
              <p className="text-2xl icon">{link.icon}</p>
              <p className="link text-sm mt-[5px]">{link.name}</p>
            </NavLink>
          ))}
          <NavLink to="/profile">
            <div className="w-full">
              <img
                className="object-cover w-12 h-12 rounded-full"
                src={user.profilePicture.url || tempImage}
                alt="User"
              />
              <p className="text-center link">
                Profile
              </p>
            </div>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
