import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./pages/auth/Signup";
import Signin from "./pages/auth/Signin";
import "./App.css";
import DashLayout from "./pages/dashboard/components/DashLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/dashboard/profile/Profile";
import Impact from "./pages/dashboard/Impact";
import Locations from "./pages/dashboard/Locations";
import { ToastContainer } from "react-toastify";
import Notifications from "./pages/dashboard/Notifications";
import UpdateProfile from "./pages/dashboard/profile/UpdateProfile";
import "react-toastify/dist/ReactToastify.css";
import UserPickups from "./pages/dashboard/pickup/UserPickups";
import BookPickup from "./pages/dashboard/pickup/BookPickup";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./pages/admin/components/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
         />
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Signin />} />

          <Route path="/" element={<DashLayout />}>
            <Route path="home" element={<Dashboard />} />

            <Route path="pickup/book" element={<BookPickup />} />
            <Route path="pickup/all" element={<UserPickups />} />

            <Route path="profile" element={<Profile />} />
            <Route path="profile/update-profile" element={<UpdateProfile />} />

            <Route path="impact" element={<Impact />} />
            <Route path="locations" element={<Locations />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<h1>Not Found</h1>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
