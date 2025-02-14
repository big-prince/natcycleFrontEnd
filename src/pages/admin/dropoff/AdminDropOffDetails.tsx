import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import DropOffApi from "../../../api/dropOffApi"
import CoolLoading from "../../dashboard/components/Loading"
import { IUser } from "../../../types"

interface DropOffLocation {
  address: string;
  description: string;
  location: Location;
  name: string;
  __v: number;
  _id: string;
}

interface RecyclingPoint {
  campaign: any;
  createdAt: string;
  description: string;
  dropOffLocation: DropOffLocation;
  itemType: string;
  pointsEarned: number;
  status: string;
  updatedAt: string;
  user: IUser;
  __v: number;
  _id: string;
}

const AdminDropOffDetails = () => {
  const { id } = useParams()
  const [dropOff, setDropOff] = useState<RecyclingPoint | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const fetchDropOff = async () => {
    if (!id) return

    setLoading(true)

    DropOffApi.getDropOffById(id)
      .then((res) => {
        console.log(res.data)
        setDropOff(res.data.data)
        setLoading(false)
      })
      .catch((err) => {
        console.log(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchDropOff()
  }, [])

  return (
    <div className="px-4">
      {loading ? (
        <p>
          <CoolLoading />
        </p>
      ) : null}

      <h1 className="text-2xl font-bold text-black mb-4">
        DropOff Details
      </h1>

      {dropOff && (
        <div>
          <div className="bg-bg p-6 rounded-lg">
            <div className="mb-4">
              <p className="text-xl font-medium">{dropOff.dropOffLocation.name}</p>
              <p className="text-sm text-gray-700">Location Name</p>
            </div>

            {/* user */}
            <div>
              <h2 className="font-bold text-xl mb-4">User Info</h2>

              <div className=" rounded-lg">
                <div>
                  <img
                    className="w-40 h-40 rounded-lg object-cover mb-8"
                    src={dropOff.user.profilePicture?.url}
                    alt={dropOff.user.firstName}
                  />
                </div>

                <div className="flex gap-4 md:gap-10 flex-wrap">
                  <div>
                    <p className="text-xl font-medium">
                      {dropOff.user.firstName} {dropOff.user.lastName}
                    </p>
                    <p className="text-sm text-gray-700">User Name</p>
                  </div>

                  <div>
                    <p className="text-xl font-medium">{dropOff.user.email}</p>
                    <p className="text-sm text-gray-700">User Email</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xl font-medium">{dropOff.dropOffLocation.address}</p>
              <p className="text-sm text-gray-700">Location Address</p>
            </div>

            <div className="mb-4">
              <p className="text-xl font-medium">{dropOff.dropOffLocation.description}</p>
              <p className="text-sm text-gray-700">Location Description</p>
            </div>

            <div className="mb-4">
              <p className="text-xl font-medium">{dropOff.itemType}</p>
              <p className="text-sm text-gray-700">Item Type</p>
            </div>

            <div className="mb-4">
              <p className="text-xl font-medium">{dropOff.pointsEarned}</p>
              <p className="text-sm text-gray-700">Points Earned</p>
            </div>

            <div className="mb-4">
              <p className="text-xl font-medium">{dropOff.status}</p>
              <p className="text-sm text-gray-700">Status</p>
            </div>

            <div className="mb-4">
              <p className="text-xl font-medium">{new Date(dropOff.createdAt).toLocaleString()}</p>
              <p className="text-sm text-gray-700">Created At</p>
            </div>

            <div className="mb-4">
              <p className="text-xl font-medium">{new Date(dropOff.updatedAt).toLocaleString()}</p>
              <p className="text-sm text-gray-700">Updated At</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDropOffDetails