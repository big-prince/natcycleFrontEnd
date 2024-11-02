import { useEffect, useState } from "react";
import CampaignApi from "../../api/campaignApi";
import { FaRegTrashAlt } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { ICampaign } from "../dashboard/components/Campaigns";
import { IUser } from "../../types";

const AdminCampaignDetails = () => {
  const { id } = useParams();

  const [campaignDetails, setCampaignDetails] = useState<ICampaign | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCampaignDetails = async () => {
    if (!id) return;

    setLoading(true);

    CampaignApi.getCampaign(id)
      .then((res) => {
        console.log(res);
        setCampaignDetails(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchCampaignDetails();
  }, []);

  const [contributors, setContributors] = useState([]);
  const [pickUpCount, setPickUpCount] = useState(0);

  useEffect(() => {
    if (!campaignDetails) return;

    CampaignApi.getContributors(campaignDetails._id)
      .then((res) => {
        console.log(res.data);
        setContributors(res.data.data.users);
        setPickUpCount(res.data.data.pickupCount);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [campaignDetails]);

  if (!campaignDetails || loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h3 className="admin_page_heading mb-8">Campaign Details</h3>

      <div>
        <div key={campaignDetails._id} className="border p-4 mb-4 relative">
          <div className="grid grid-cols-3">
            <div className="mr-4 col-span-1">
              <img
                src={campaignDetails.image?.url}
                alt={campaignDetails.name}
                className="w-full h-full object-cover rounded-md"
              />
            </div>

            <div className="col-span-2">
              <div className=" mb-3">
                <div className="font-bold">{campaignDetails.name}</div>
                <div className="mt-2 font-medium">
                  {campaignDetails.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="">Goal: {campaignDetails.goal}</div>
                <div className="">Progress: {campaignDetails.progress}</div>
                <div className="">
                  End Date:
                  {new Date(campaignDetails.endDate).toLocaleDateString()}
                </div>
                <div className="">Material: {campaignDetails.material}</div>
                <div className="">
                  Status:
                  <span className="text-darkgreen font-bold">
                    {" "}
                    {campaignDetails.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end absolute top-2 right-2">
            <div
              className="flex items-center justify-center px-4 h-10 text-red-600 rounded-md cursor-pointer"
              // onClick={() => deletecampaignDetails(campaignDetails._id)}
            >
              <FaRegTrashAlt />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div>
          <h3 className="admin_page_heading">Contributors</h3>
          <p className="text-sm text-gray-500">
            Total Pickups: {pickUpCount}
          </p>
        </div>
        {/* contributors list */}
        <div>
          <div className="bg-white rounded-md shadow-md p-2 md:p-4 text-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3">ID</th>
                  <th className="text-left py-3">NAME</th>
                  <th className="text-left py-3">LAST NAME</th>
                  <th className="text-left py-3 hidden md:block">EMAIL</th>
                  {/* date joined */}
                  <th className="text-left py-3">DATE JOINED</th>
                  <th className="text-left py-3">ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {contributors &&
                  contributors.map((user: IUser, index: number) => (
                    <tr key={user._id} className="border-b border-gray-200">
                      <td className="py-3">{index + 1}</td>
                      <td className="py-3">
                        <Link to={`/admin/users/${user._id}`}>
                          {user.firstName}
                        </Link>
                      </td>
                      <td className="py-3">{user.lastName}</td>
                      <td className="py-3 hidden md:block">{user?.email}</td>
                      <td className="py-3">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-sm">
                        <Link to={`/admin/users/${user._id}`}>
                          <button className="text-main underline px-3 py-1 rounded-md mr-2">
                            View
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCampaignDetails;
