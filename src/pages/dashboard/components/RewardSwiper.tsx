import { useEffect, useState } from "react";
import RewardApi from "../../../api/rewardApi";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { IReward } from "../../../types";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import CoolLoading from "../../../components/Loading";
import UserRewardCard from "./UserRewardCard";

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
        pagination={true}
        modules={[Pagination]}
      >
        {rewards.map((reward) => (
          <SwiperSlide key={reward._id} className="pb-10">
            <UserRewardCard reward={reward} isUserReward={false} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default RewardSwiper;
