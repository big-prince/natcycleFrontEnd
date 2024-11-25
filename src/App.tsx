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
import AdminLayout from "./pages/admin/components/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminUsers from "./pages/admin/users/AdminUsers";
import AdminPickups from "./pages/admin/AdminPickups";
import AdminBadges from "./pages/admin/AdminBadges";
import UserDetails from "./pages/admin/users/UserDetails";
import PickupLogin from "./pages/pickups/PickupLogin";
import PickupList from "./pages/pickups/PickupList";
import PickupLayout from "./pages/pickups/PickupLayout";
import PickupProfile from "./pages/pickups/PickupProfile";
// import AdminReward from "./pages/admin/AdminReward";
import AdminRewards from "./pages/admin/AdminRewards";
import UserRewards from "./pages/dashboard/reward/UserRewards";
import PickupDetails from "./pages/pickups/PickupDetails";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import AdminRedeemedRewards from "./pages/admin/AdminRedeemedRewards";
import AdminCampaign from "./pages/admin/AdminCampaign";
import CampaignDetails from "./pages/dashboard/CampaignDetails";
import AdminCampaignDetails from "./pages/admin/AdminCampaignDetails";
import CampaignContributors from "./pages/dashboard/campaign/CampaignContributors";

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
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/" element={<DashLayout />}>
            <Route path="home" element={<Dashboard />} />

            <Route path="pickup/book" element={<BookPickup />} />
            <Route path="pickup/all" element={<UserPickups />} />

            <Route path="profile" element={<Profile />} />
            <Route path="profile/update-profile" element={<UpdateProfile />} />

            <Route path="impact" element={<Impact />} />
            <Route path="locations" element={<Locations />} />
            <Route path="notifications" element={<Notifications />} />

            <Route path="rewards" element={<UserRewards />} />
            <Route path="campaigns/:id" element={<CampaignDetails />} />
            <Route path="campaigns/:id/contributors" element={<CampaignContributors />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/users/:id" element={<UserDetails />} />

            <Route path="/admin/pickups" element={<AdminPickups />} />
            <Route path="/admin/badges" element={<AdminBadges />} />
            <Route path="/admin/rewards" element={<AdminRewards />} />
            <Route path="/admin/redeemed" element={<AdminRedeemedRewards />} />
            <Route path="/admin/campaign" element={<AdminCampaign />} />
            <Route path="/admin/campaign/:id" element={<AdminCampaignDetails />} />
          </Route>

          {/* the pickup side of things */}
          <Route path="/admin/pickup/login" element={<PickupLogin />} />

          <Route path="/admin/pickup" element={<PickupLayout />}>
            <Route path="/admin/pickup/pickups" element={<PickupList />} />
            <Route path="/admin/pickup/pickup/:id" element={<PickupDetails />} />
            <Route path="/admin/pickup/profile" element={<PickupProfile />} />
            <Route path="/admin/pickup/settings" element={<PickupProfile />} />
          </Route>

          <Route path="*" element={<h1>Not Found</h1>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
