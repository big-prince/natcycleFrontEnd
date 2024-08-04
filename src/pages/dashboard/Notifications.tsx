import { useState, useEffect } from "react";
import CoolLoading from "./components/Loading";
import notificationApi from "../../api/notificationApi";

const Notifications = () => {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<any>([]);

  const fetchNotifications = async () => {
    setLoading(true);

    notificationApi
      .getNotifications()
      .then((res) => {
        console.log(res.data);
        setNotifications(res.data.data.docs);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mt-6">
        <h1 className="text-xl font-semibold">Notifications</h1>

        <div className="hidden">
          {/* filter */}
          <select className="border p-2 py-1 rounded-lg">
            <option value="all">All</option>
            <option value="read">Read</option>
            <option value="unread">Unread</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-center">
          <CoolLoading />
        </p>
      ) : (
        <div>
          {notifications.map((notification: any) => (
            <div
              key={notification._id}
              className="border p-4 my-2 rounded-lg flex justify-between"
            >
              <div>
                <h1 className="font-semibold mb-1">{notification.title}</h1>
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.createdAt).toDateString()}
                </p>
              </div>
              <div className="hidden">
                <button className="bg-primary text-white px-4 py-2 rounded-lg">
                  Mark as Read
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && notifications.length === 0 && <p>No notifications</p>}
    </div>
  );
};

export default Notifications;
