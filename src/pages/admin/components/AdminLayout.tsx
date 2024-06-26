import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";

const AdminLayout = () => {
  return (
    <div className="admin font-dm_sans">
      <div className="">
        <SideBar />

        <div className="bg-white w-full pl-80 min-h-screen p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
