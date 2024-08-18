/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useAppSelector } from "../../../hooks/reduxHooks";

const Milestone = () => {
  const localUser = useAppSelector((state) => state.auth.user);

  const mileStoneNumbers = [
    {
      level: 1,
      pointsRange: [0, 100],
    },
    {
      lever: 2,
      pointsRange: [101, 250],
    },
    {
      level: 3,
      pointsRange: [251, 500],
    },
    {
      level: 4,
      pointsRange: [501, 1000],
    },
    {
      level: 5,
      pointsRange: [1001, 2000],
    },
  ];

  const currentMilestone = mileStoneNumbers.find((milestone) => {
    return (
      localUser.pointsEarned >= milestone.pointsRange[0] &&
      localUser.pointsEarned <= milestone.pointsRange[1]
    );
  });

  let percentage = 0;

  if (currentMilestone) {
    percentage =
      ((localUser.pointsEarned - currentMilestone?.pointsRange[0]) /
        (currentMilestone?.pointsRange[1] - currentMilestone?.pointsRange[0])) *
      100;
  }

  return (
    <div>
      <div className="mt-6">
        <p className="text-lg font-semibold">Milestone</p>
        <div>
          <div className="bg-green h-6 w-full rounded-2xl p-1">
            <div
              className={`bg-black h-4  rounded-2xl`}
              style={{ width: `${percentage}%` }}
            >
              <p className="text-white text-xs text-right pr-2">
                {localUser?.pointsEarned}
              </p>
            </div>
          </div>
          <div className="flex justify-between">
            <p className="text-sm">{currentMilestone?.pointsRange[0]}</p>
            <p className="text-sm">{currentMilestone?.pointsRange[1]}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Milestone;
