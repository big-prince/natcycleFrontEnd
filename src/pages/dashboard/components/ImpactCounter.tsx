import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

// These are the keys expected in the impactMeasurement object
const ImpactMetricTypes = ["carbon", "trees", "water", "birds"];

const ImpactCounter = ({ carbonUnits, impactMeasurement }) => {
  // console.log("ImpactCounter Props:", { carbonUnits, impactMeasurement }); // For debugging

  return (
    <div className="h-14 relative">
      {" "}
      <Swiper
        direction={"vertical"}
        slidesPerView={1}
        spaceBetween={0}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        className="w-full h-full"
      >
        {ImpactMetricTypes.map((metricKey) => {
          let value;
          if (metricKey === "carbon") {
            value = carbonUnits;
          } else if (
            impactMeasurement &&
            impactMeasurement[metricKey] !== undefined
          ) {
            value = impactMeasurement[metricKey];
          } else {
            value = 0;
          }

          return (
            <SwiperSlide key={metricKey} className="flex items-center">
              {" "}
              {/* Vertically center content in slide */}
              <div className="w-full text-right pr-8">
                {" "}
                {/* Text aligned to right, space for dots */}
                <p className="text-3xl font-bold text-green-700">
                  {" "}
                  {Math.floor(value || 0)}{" "}
                </p>
                <p className="text-xs text-gray-600 capitalize -mt-1">
                  {" "}
                  {metricKey}
                </p>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default ImpactCounter;
