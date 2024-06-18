import { GoHome } from "react-icons/go";
import { IoLocationSharp } from "react-icons/io5";
import { LuLeafyGreen } from "react-icons/lu";
import { NavLink } from "react-router-dom";

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
  },{
    icon: <IoLocationSharp className="m-auto" />,
    name: "Locations",
    link: "/locations",
  },
];

const MobileNav = () => {
  return (
    <div className="absolute bottom-10 bg-bg rounded-2xl py-2 w-full left-0">
      <div className="flex justify-between w-full mobileLink">
        {linkList.map((link, index) => (
          <NavLink
            key={index}
            to={link.link}
            className="text-center p-2 w-full"
          >
            <p className="text-xl">{link.icon}</p>
            <p className="text-xs">{link.name}</p>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default MobileNav;
