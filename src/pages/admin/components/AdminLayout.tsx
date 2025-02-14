import { Outlet, useNavigate } from "react-router-dom";
import SideBar from "./SideBar";
import { useAppSelector } from "../../../hooks/reduxHooks";


const AdminLayout = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    navigate("/admin/login");
    return;
  }

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
