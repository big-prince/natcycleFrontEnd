import { Swiper, SwiperSlide } from "swiper/react";

const ImpactMetricTypes = ["trees", "carbon", "water", "birds"];

import { Pagination } from "swiper/modules";

import "swiper/css/pagination";

const ImpactCounter = ({ carbonUnits, impactMeasurement }) => {
  console.log(carbonUnits, impactMeasurement);

  return (
    <div className="h-14">
      <Swiper
        direction={"vertical"}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        className="w-full h-full pr-6"
      >
        {ImpactMetricTypes.map((_, index) => (
          <SwiperSlide key={index}>
            <div>
              <p className="text-3xl text-center font-bold text-darkgreen">
                {Math.floor(carbonUnits)}
              </p>
              <p className="text-sm text-center">{_}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ImpactCounter;
