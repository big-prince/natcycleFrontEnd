import { useEffect, useState } from "react";
import CampaignApi from "../../../api/campaignApi";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Pagination } from "swiper/modules";
import { Link } from "react-router-dom";

export interface ICampaign {
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

const Campaigns = () => {
  const [campaign, setCampaign] = useState<ICampaign[]>([]);

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

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800">Campaigns</h2>

      <Swiper
        spaceBetween={50}
        slidesPerView={1}
        pagination={true}
        modules={[Pagination]}
      >
        {campaign.map((item) => (
          <SwiperSlide key={item._id} className="pb-4">
            <Link to={`/campaigns/${item._id}`} className="">
              <div className="bg-white p-4 rounded-lg box_shadow flex gap-4">
                <div>
                  <img
                    src={item.image?.url}
                    alt={item.name}
                    className="w-20 object-cover rounded-lg"
                  />
                </div>

                <div className="w-full">
                  <p className="md:text-lg font-semibold text-gray-800 mb-2">
                    {item.name}
                  </p>

                  <div className="flex justify-between w-full">
                    <p className="text-sm text-gray-700">{item.material}</p>
                    <p className="text-sm font-bold bg-black text-white rounded-full px-2 ">
                      {item.status}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Campaigns;
