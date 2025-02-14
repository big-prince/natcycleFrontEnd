import React, { useEffect } from 'react'
import dropOffLocationApi from '../../../api/dropOffLocationApi'
import { Link, useNavigate } from 'react-router-dom'

const DropOffLocations = () => {
  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState([])

  const fetchData = async () => {
    dropOffLocationApi.getDropOffLocations()
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

  const handleDelete = (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this location?")
    if (!confirm) return

    dropOffLocationApi.deleteDropOffLocation(id)
      .then((res) => {
        console.log(res.data)
        fetchData()
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const navigate = useNavigate()
  const handleEdit = (id: string) => {
    navigate(`/admin/dropoffs/create-location?id=${id}`)
  }

  return (
    <div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="admin_page_heading">Dropoff Locations</h3>

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
                <th className="text-left py-3">ID</th>
                <th className="text-left py-3">NAME</th>
                <th className="text-left py-3">ADDRESS</th>
                <th className="text-left py-3">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {data && data.length > 0 &&
                data.map((location: any, index: number) => (
                  <tr key={location._id} className="border-b border-gray-200">
                    <td className="py-3">{index + 1}</td>
                    <td className="py-3">
                      {location.name}
                    </td>
                    <td className="py-3">{location.address}</td>
                    <td className="py-3">
                      <div className="flex items-center">
                        <button className="bg-blue-500 text-white px-2 py-1 rounded-md"
                          onClick={() => handleEdit(location._id)}>Edit</button>
                        <button className="bg-red-500 text-white px-2 py-1 rounded-md ml-2"
                          onClick={() => handleDelete(location._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DropOffLocations