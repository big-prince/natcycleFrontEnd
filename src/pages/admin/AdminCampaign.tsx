import { useEffect, useState } from "react";
import CampaignApi from "../../api/campaignApi";
import { FaPlus } from "react-icons/fa6";
import AddCampaignModal from "./components/AddCampaignModal";
import { FaRegTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

interface ICampaign {
  _id: string;
  name: string;
  description: string;
  endDate: string;
  status: string; // Campaign status (e.g., "active", "inactive")
  material?: string; // Optional: Material associated with the campaign (if applicable)
  goal: number; // Goal amount for the fundraising campaign
  progress: number; // Current progress towards the goal (numerical)
  image?: Image; // Optional image object for the campaign
}

interface Image {
  public_id: string; // Cloudinary public ID for the image
  url: string; // Full image URL
}
const AdminCampaign = () => {
  const [campaign, setCampaign] = useState<ICampaign[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCampaigns = () => {
    CampaignApi.getCampaigns()
      .then((response) => {
        console.log(response.data);
        setCampaign(response.data.data.docs);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const deleteCampaign = (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this campaign?"
    );
    if (!confirm) return;

    CampaignApi.deleteCampaign(id)
      .then(() => {
        toast.success("Campaign deleted successfully");
        fetchCampaigns();
      })
      .catch((error) => {
        toast.error("An error occurred. Please try again.");
        console.error(error);
      });
  };

  return (
    <div>
      <div>
        <div className="flex justify-between">
          <div className="font-bold text-2xl">All Campaigns</div>

          <div className="flex">
            <div
              className="add_button flex items-center justify-center px-4 h-10 bg-darkgreen text-white rounded-md cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <FaPlus className="add_icon" />
              Add New Campaign
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {campaign.length > 0 &&
          campaign.map((campaign) => (
            <div key={campaign._id} className="border p-4 mb-4 relative">
              <div className="grid grid-cols-3">
                <div className="mr-4 col-span-1">
                  <img
                    src={campaign.image?.url}
                    alt={campaign.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>

                <div className="col-span-2">
                  <div className=" mb-3">
                    <div className="font-bold">{campaign.name}</div>
                    <div className="mt-2 font-medium">
                      {/* {campaign.description}  */}
                      {campaign.description.length > 100
                        ? campaign.description.substring(0, 200) + "..."
                        : campaign.description}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="">Goal: {campaign.goal}</div>
                    <div className="">Progress: {campaign.progress}</div>
                    <div className="">
                      End Date:
                      {new Date(campaign.endDate).toLocaleDateString()}
                    </div>
                    <div className="">Material: {campaign.material}</div>
                    <div className="">
                      Status:
                      <span className="text-darkgreen font-bold">
                        {" "}
                        {campaign.status}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <Link
                        to={`/admin/campaign/${campaign._id}`}
                        className="btn bg-green-900 text-white px-4 font-medium border-2 rounded-md p-2 py-3 inline-block"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end absolute top-2 right-2">
                <div
                  className="flex items-center justify-center px-4 h-10 text-red-600 rounded-md cursor-pointer"
                  onClick={() => deleteCampaign(campaign._id)}
                >
                  <FaRegTrashAlt />
                </div>
              </div>
            </div>
          ))}
      </div>

      <AddCampaignModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        fetchCampaigns={fetchCampaigns}
      />
    </div>
  );
};

export default AdminCampaign;
