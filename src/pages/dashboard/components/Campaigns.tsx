import { useEffect, useState } from "react";
import CampaignApi from "../../../api/campaignApi";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Pagination } from "swiper/modules";
import { Link } from "react-router-dom";
import { textShortener } from "../../../utils";
import Loading from "../../../components/Loading";

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
  itemType: string; // Type of item being donated (e.g., "clothes", "food", "books")
}

interface Image {
  public_id: string; // Cloudinary public ID for the image
  url: string; // Full image URL
}

const Campaigns = () => {
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<ICampaign[]>([]);

  const fetchCampaigns = () => {
    CampaignApi.getCampaigns()
      .then((response) => {
        console.log(response.data);
        setCampaign(response.data.data.docs);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  if (loading) {
    return <div
      className="h-24"
    >
      <p className="mb-8 text-lg font-semibold text-gray-800">
        Loading campaigns...
      </p>
      <Loading />
      </div>;
  }

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold text-gray-800">Ongoing Campaigns</h2>

      <Swiper
        spaceBetween={50}
        slidesPerView={1}
        pagination={true}
        modules={[Pagination]}
      >
        {campaign.map((item) => (
          <SwiperSlide key={item._id} className="pb-8">
            <Link to={`/campaigns/${item._id}`} className="">
              <div className="flex gap-4 p-4 bg-white rounded-lg box_shadow">
                <div>
                  <img
                    src={item.image?.url}
                    alt={item.name}
                    className="object-cover h-20 rounded-lg"
                  />
                </div>

                <div className="w-full">
                  <p className="font-semibold text-gray-800 md:text-lg">
                    {item.name}
                  </p>

                  <div className="flex justify-between w-full">
                    <p className="text-sm text-gray-700">
                      {textShortener(item.description, 90)}
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
