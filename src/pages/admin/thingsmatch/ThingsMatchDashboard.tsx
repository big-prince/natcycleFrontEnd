import { Link } from "react-router-dom";
import { FiUsers, FiBox, FiShuffle, FiPieChart } from "react-icons/fi"; // Example icons

const ThingsMatchDashboard = () => {
  const sections = [
    {
      name: "TM Users",
      path: "/admin/thingsmatch/users",
      icon: <FiUsers size={24} />,
    },
    {
      name: "TM Items",
      path: "/admin/thingsmatch/items",
      icon: <FiBox size={24} />,
    },
    {
      name: "TM Matches",
      path: "/admin/thingsmatch/matches",
      icon: <FiShuffle size={24} />,
    },
    {
      name: "TM Breakdown",
      path: "/admin/thingsmatch/breakdown",
      icon: <FiPieChart size={24} />,
    },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        ThingsMatch Dashboard
      </h1>
      <p className="text-slate-600 mb-10">
        Welcome to the ThingsMatch administration module. Manage users, items,
        matches, and view breakdowns.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sections.map((section) => (
          <Link
            key={section.name}
            to={section.path}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col items-center justify-center text-center group"
          >
            <div className="p-4 bg-sky-100 text-sky-600 rounded-full mb-4 group-hover:bg-sky-500 group-hover:text-white transition-colors">
              {section.icon}
            </div>
            <h2 className="text-lg font-semibold text-slate-700 group-hover:text-sky-600 transition-colors">
              {section.name}
            </h2>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ThingsMatchDashboard;
