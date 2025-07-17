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
import CreateDropOff from "./pages/dashboard/dropoff/CreateDropOff";
import AdminDropOffs from "./pages/admin/dropoff/AdminDropOffs";
import AdminDropOffDetails from "./pages/admin/dropoff/AdminDropOffDetails";
import AdminCampaignDropOffs from "./pages/admin/dropoff/AdminCampaignDropOffs";
import AllCampaignDropOffs from "./pages/admin/dropoff/AllCampaignDropOffs";
import AdminMaterials from "./pages/admin/AdminMaterials";
import AddMaterialPage from "./pages/admin/AddMaterialPage";
import MaterialDetails from "./pages/admin/MaterialDetails";
import AddDropOffLocation from "./pages/admin/dropoff/AddDropOffLocation";
import DropOffLocations from "./pages/admin/dropoff/DropOffLocations";
import AddCampaignModal from "./pages/admin/components/AddCampaignModal";
import Where from "./pages/dashboard/where/Where";
import UserDropOffs from "./pages/dashboard/dropoff/UserDropOffs";
import PublicLayout from "./pages/components/PublicLayout";
import GreenProfile from "./pages/dashboard/GreenProfile";

// ThingsMatch Admin Pages
import ThingsMatchDashboard from "./pages/admin/thingsmatch/ThingsMatchDashboard";
import TMUsers from "./pages/admin/thingsmatch/TMUsers";
import TMItems from "./pages/admin/thingsmatch/TMItems";
import TMItemDetails from "./pages/admin/thingsmatch/TMItemDetails";
import TMMatches from "./pages/admin/thingsmatch/TMMatches";
import TMMatchDetails from "./pages/admin/thingsmatch/TMMatchDetails";
import TMBreakdown from "./pages/admin/thingsmatch/TMBreakdown";
import TMUserDetails from "./pages/admin/thingsmatch/TMUserDetails";
import EPantry from "./pages/admin/thingsmatch/EPantry"; // Import the new EPantry component
import AdminSimpleDropOffs from "./pages/admin/AdminSimpleDropOffs";
import AdminSimpleDropOffLocations from "./pages/admin/AdminSimpleDropOffLocations";
import AddSimpleDropOffLocation from "./pages/admin/simpledropoff/AddSimpleDropOffLocation";
import NotFound from "./pages/components/NotFound";

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <ToastContainer
          position="top-center"
          autoClose={2500}
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
          <Route path="*" element={<NotFound />} />

          {/* Public route for Create DropOff */}
          <Route path="/public" element={<PublicLayout />}>
            <Route path="dropoff/create" element={<CreateDropOff />} />
          </Route>
          <Route path="/green-profile" element={<GreenProfile />} />

          {/* Protected routes */}
          <Route path="/" element={<DashLayout />}>
            <Route path="home" element={<Dashboard />} />
            {/* Other protected routes */}
            <Route path="pickup/book" element={<BookPickup />} />
            <Route path="pickup/all" element={<UserPickups />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/update-profile" element={<UpdateProfile />} />

            <Route path="impact" element={<Impact />} />
            <Route path="locations" element={<Locations />} />
            <Route path="notifications" element={<Notifications />} />

            <Route path="rewards" element={<UserRewards />} />
            <Route path="campaigns/:id" element={<CampaignDetails />} />
            <Route
              path="campaigns/:id/contributors"
              element={<CampaignContributors />}
            />

            <Route path="dropoff/create" element={<CreateDropOff />} />
            <Route path="dropoff/all" element={<UserDropOffs />} />
            <Route path="where" element={<Where />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/users/:id" element={<UserDetails />} />
            <Route path="/admin/pickups" element={<AdminPickups />} />
            <Route path="/admin/dropoffs" element={<AdminDropOffs />} />
            <Route
              path="/admin/simple-dropoffs"
              element={<AdminSimpleDropOffs />}
            />
            <Route
              path="/admin/dropoff-locations"
              element={<DropOffLocations />}
            />
            <Route
              path="/admin/simple-dropoff-locations"
              element={<AdminSimpleDropOffLocations />}
            />
            <Route
              path="/admin/simple-dropoff-locations/add"
              element={<AddSimpleDropOffLocation />}
            />
            <Route
              path="/admin/simple-dropoff-locations/edit"
              element={<AddSimpleDropOffLocation />}
            />
            <Route
              path="/admin/dropoffs/:id"
              element={<AdminDropOffDetails />}
            />
            <Route
              path="/admin/dropoffs/create-location"
              element={<AddDropOffLocation />}
            />
            <Route path="/admin/badges" element={<AdminBadges />} />
            <Route path="/admin/rewards" element={<AdminRewards />} />
            <Route path="/admin/redeemed" element={<AdminRedeemedRewards />} />
            <Route path="/admin/campaigns" element={<AdminCampaign />} />
            <Route
              path="/admin/campaigns/create-campaign"
              element={<AddCampaignModal />}
            />
            <Route
              path="/admin/campaigns/edit/:id"
              element={<AddCampaignModal />}
            />
            <Route
              path="/admin/campaigns/:id"
              element={<AdminCampaignDetails />}
            />
            <Route
              path="/admin/campaigns/:campaignId/dropoffs"
              element={<AdminCampaignDropOffs />}
            />
            <Route
              path="/admin/campaigns/dropoffs"
              element={<AllCampaignDropOffs />}
            />
            <Route path="materials" element={<AdminMaterials />} />
            <Route path="materials/add" element={<AddMaterialPage />} />{" "}
            {/* Route for adding */}
            <Route
              path="materials/edit/:materialId"
              element={<AddMaterialPage />}
            />{" "}
            {/* Route for editing */}
            <Route
              path="materials/:materialId"
              element={<MaterialDetails />}
            />{" "}
            {/* Route for details */}
            {/* ThingsMatch Routes */}
            <Route path="thingsmatch" element={<ThingsMatchDashboard />} />
            <Route path="thingsmatch/users" element={<TMUsers />} />
            <Route
              path="thingsmatch/users/:userId"
              element={<TMUserDetails />}
            />
            <Route path="thingsmatch/items" element={<TMItems />} />
            <Route
              path="thingsmatch/items/:itemId"
              element={<TMItemDetails />}
            />
            <Route path="thingsmatch/matches" element={<TMMatches />} />
            <Route
              path="thingsmatch/matches/:matchId"
              element={<TMMatchDetails />}
            />
            <Route path="thingsmatch/breakdown" element={<TMBreakdown />} />
            <Route path="thingsmatch/epantry" element={<EPantry />} />{" "}
            {/* Add route for ePantry */}
          </Route>

          {/* the pickup side of things */}
          <Route path="/admin/pickup/login" element={<PickupLogin />} />

          <Route path="/admin/pickup" element={<PickupLayout />}>
            <Route path="/admin/pickup/pickups" element={<PickupList />} />
            <Route
              path="/admin/pickup/pickup/:id"
              element={<PickupDetails />}
            />
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
