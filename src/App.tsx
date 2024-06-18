import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./pages/auth/Signup";
import Signin from "./pages/auth/Signin";
import "./App.css";
import DashLayout from "./pages/dashboard/components/DashLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import BookPickup from "./pages/dashboard/BookPickup";
import Profile from "./pages/dashboard/profile/Profile";
import Impact from "./pages/dashboard/Impact";
import Locations from "./pages/dashboard/Locations";

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Signin />} />

          <Route path="/" element={<DashLayout />}>
            <Route path="home" element={<Dashboard />} />
            <Route path="pickup" element={<BookPickup />} />
            <Route path="profile" element={<Profile />} />
            <Route path="impact" element={<Impact />} />
            <Route path="locations" element={<Locations />} />
          </Route>

          <Route path="*" element={<h1>Not Found</h1>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
