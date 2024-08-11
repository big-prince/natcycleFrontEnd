import { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import RewardApi from "../../../api/rewardApi";
import UserRewardCard from "../components/UserRewardCard";
import Loading from "../../../components/Loading";
import { IReward } from "../../../types";

const UserRewards = () => {
  const [rewards, setRewards] = useState<IReward[]>([]);

  const fetchRewards = () => {
    setLoading(true);
    RewardApi.adminGetAwards()
      .then((response) => {
        console.log(response.data);
        setLoading(false);
        setRewards(response.data.data);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");

  return (
    <div className="mb-20">
      <div className="flex justify-between items-center mt-6 mb-6">
        <h2 className="text-2xl font-semibold">Rewards</h2>
      </div>

      <Tabs.Root
        className="TabsRoot"
        defaultValue="all"
        value={selectedTab}
        onValueChange={setSelectedTab}
      >
        <Tabs.List className="mb-6" aria-label="Manage your account">
          <Tabs.Trigger
            className={`text-base font-semibold w-1/2
           ${selectedTab === "all" ? "border-b-2 border-primary" : ""}`}
            value="all"
          >
            All
            <span className="text-xs font-bold ml-2 text-primary"></span>
          </Tabs.Trigger>

          <Tabs.Trigger
            className={`text-base font-semibold w-1/2
           ${selectedTab === "mine" ? "border-b-2 border-primary" : ""}`}
            value="mine"
          >
            Redeemed
            <span className="text-xs font-bold ml-2 text-primary"></span>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content className="TabsContent" value="all">
          {
            loading && (
              <Loading />
            )
          }
          <div>
            <div className="grid grid-cols-1 gap-4">
              {rewards.map((reward, index) => (
                <div key={index} className="">
                  <UserRewardCard reward={reward} />
                </div>
              ))}
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content className="TabsContent" value="sentTab">
          <div></div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};

export default UserRewards;
