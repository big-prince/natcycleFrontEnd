/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useAppSelector } from "../../../hooks/reduxHooks";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Pagination } from "swiper/modules";

const Milestone = () => {
  const localUser = useAppSelector((state) => state.auth.user);

  const mileStoneNumbers = [
    {
      level: 1,
      pointsRange: [0, 500],
    },
    {
      level: 2,
      pointsRange: [501, 1000],
    },
    {
      level: 3,
      pointsRange: [1001, 2000],
    },
    {
      level: 4,
      pointsRange: [2001, 3000],
    },
    {
      level: 5,
      pointsRange: [3001, 4000],
    },
    {
      level: 6,
      pointsRange: [4001, 5000],
    },
    {
      level: 7,
      pointsRange: [5001, 6000],
    },
    {
      level: 8,
      pointsRange: [6001, 7000],
    },
    {
      level: 9,
      pointsRange: [7001, 8000],
    },
    {
      level: 10,
      pointsRange: [8001, 9000],
    },
    {
      level: 11,
      pointsRange: [9001, 10000],
    },
  ];

  const currentMilestone = mileStoneNumbers.find((milestone) => {
    return (
      localUser.carbonUnits >= milestone.pointsRange[0] &&
      localUser.carbonUnits <= milestone.pointsRange[1]
    );
  });

  let percentage = 0;

  if (currentMilestone) {
    percentage =
      ((localUser.carbonUnits - currentMilestone?.pointsRange[0]) /
        (currentMilestone?.pointsRange[1] - currentMilestone?.pointsRange[0])) *
      100;
  }

  const nextMilestone = mileStoneNumbers.find((milestone) => {
    return localUser.carbonUnits < milestone.pointsRange[0];
  });

  return (
    <div>
      <div className="mt-6">
        <Swiper
          spaceBetween={50}
          slidesPerView={1}
          pagination={true}
          modules={[Pagination]}
        >
          <SwiperSlide className="pb-10">
            <div>
              <p className="text-lg font-semibold">Milestone</p>
              <div>
                <div className="bg-green h-6 w-full rounded-2xl p-1">
                  <div
                    className={`bg-black h-4  rounded-2xl`}
                    style={{ width: `${percentage}%` }}
                  >
                    <p className="text-white text-xs text-right pr-2">
                      {Math.floor(localUser?.carbonUnits)}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm">{currentMilestone?.pointsRange[0]}</p>
                  <p className="text-sm">{currentMilestone?.pointsRange[1]}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>

          {/* next milestone */}
          <SwiperSlide className="pb-10">
            <div>
              <p className="text-lg font-medium m">Next Milestone</p>

              <div>
                <div className="bg-green h-6 w-full rounded-2xl p-1">
                  <div
                    className={`bg-black h-4  rounded-2xl hidden`}
                    style={{ width: `${percentage}%` }}
                  >
                    <p className="text-white text-xs text-right pr-2">
                      {localUser?.carbonUnits}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm">{nextMilestone?.pointsRange[0]}</p>
                  <p className="text-sm">{nextMilestone?.pointsRange[1]}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
};

export default Milestone;
