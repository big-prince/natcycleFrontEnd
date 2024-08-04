import { useEffect, useState } from "react";
import RewardApi from "../../../api/rewardApi";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { IReward } from "../../../types";
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import CoolLoading from "../../../components/Loading";


const RewardSwiper = () => {
  const [loading, setLoading] = useState(false);
  const [rewards, setRewards] = useState<IReward[]>([]);

  const fetchRewards = () => {
    setLoading(true);
    RewardApi.adminGetAwards()
      .then((response) => {
        console.log(response.data);
        setLoading(false);
        // reverse
        const reversedData = response.data.data.reverse();
        setRewards(reversedData);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  if (loading) {
    return <CoolLoading />;
  }

  return (
    <div>
      <Swiper
        spaceBetween={50}
        slidesPerView={1}
        pagination={true} modules={[Pagination]}
      >
        {rewards.map((reward) => (
          <SwiperSlide key={reward._id} className="pb-10">
            <div className="p-4 bg-white rounded-lg shadow-lg">
              <div className="h-64">
                <img
                  src={reward.image.url}
                  alt={reward.name}
                  className="object-cover rounded-lg w-full h-full"
                />
              </div>

              <div className="mt-2">
                <h1 className="font-semibold text-darkgreen">{reward.name}</h1>
                <p className="text-sm">{reward.description}</p>
                <p className="text-sm text-gray-400">Sponsor: {reward.sponsorName || 'NatCycle'}</p>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center">
                    <span className="text-sm text-darkgreen font-bold rounded-full px-2 py-1">
                      {reward.pointsRequired}Pts
                    </span>
                  </div>
                  <div>
                    <button className="border-2 border-darkgreen text-darkgreen px-6 py-1 rounded-full">
                      Redeem
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default RewardSwiper;
