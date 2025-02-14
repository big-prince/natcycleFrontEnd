import { Link } from "react-router-dom"
import DropOffApi from "../../../api/dropOffApi"
import { useEffect, useState } from "react"
import { IUser } from "../../../types";

interface DropOffLocation {
  address: string;
  _id: string; 
}

interface RecyclingPoint {
  campaign: any; // Assuming campaign can be null or have a different structure
  createdAt: string; // Assuming ISO 8601 format
  description: string;
  dropOffLocation: DropOffLocation; 
  itemType: string;
  pointsEarned: number;
  status: string;
  updatedAt: string; // Assuming ISO 8601 format
  user: IUser;
  __v: number;
  _id: string;
}

const AdminDropOffs = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RecyclingPoint[]>([])

  const fetchData = async () => {
    DropOffApi.adminGetDropOffs()
      .then((res) => {
        console.log(res.data.data.docs)
        setData(res.data.data.docs)
        setLoading(false)
      })
      .catch((err) => {
        console.log(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    setLoading(true)
    fetchData()
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="admin_page_heading">All DropOffs</h3>

        <div>
          <Link to="/admin/dropoffs/create-location">
            <button className="button bg-black text-white">Add DropOff Location</button>
          </Link>
        </div>
      </div>

      {loading ? <p className="my-4 font-bold">Loading...</p> : ""}

      <div className="bg-white rounded-md shadow-md p-2 md:p-4 text-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-2">User</th>
              <th className="text-left p-2">Location</th>
              <th className="text-left p-2">Item Type</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id} className="border-b border-gray-200">
                 <td className="p-2">
                  {item.user.firstName} {item.user.lastName}
                </td>
                <td className="p-2">{item.dropOffLocation.address}</td>
                <td className="p-2">{item.itemType}</td>
                <td className="p-2">{item.status}</td>
               
                <td className="p-2">
                  <Link to={`/admin/dropoffs/${item._id}`}>
                    <button className="button bg-blue-500 text-white">View</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminDropOffs