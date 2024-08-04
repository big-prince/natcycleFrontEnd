import { GoHome } from "react-icons/go";
import { LuLeafyGreen } from "react-icons/lu";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../../../hooks/reduxHooks";

const linkList = [
  {
    icon: <GoHome className="m-auto" />,
    name: "Home",
    link: "/home",
  },
  {
    icon: <LuLeafyGreen className="m-auto" />,
    name: "Impact",
    link: "/Impact",
  },
];

const MobileNav = () => {
  const user = useAppSelector((state) => state.auth.user);
  const tempImage = "https://i.ibb.co/sq0WtbH/trees-119580.png";

  return (
    <div className="fixed bottom-6 w-full left-0 px-4 z-[3000]">
      <div className="bg-bg rounded-2xl py-4">
        <div className="flex justify-around w-full mobileLink items-center">
          {linkList.map((link, index) => (
            <NavLink key={index} to={link.link} className="text-center">
              <p className="text-xl">{link.icon}</p>
              <p className="text-xs">{link.name}</p>
            </NavLink>
          ))}
          <NavLink to="/profile">
            <div className="w-full">
              <img
                className="w-10 h-10 rounded-full object-cover"
                src={user.profilePicture.url || tempImage}
                alt="User"
              />
            </div>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
