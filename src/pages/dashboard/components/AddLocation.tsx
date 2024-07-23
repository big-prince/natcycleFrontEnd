import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import LocationApi from "../../../api/locationApi";
import { toast } from "react-toastify";
import Utils from "../../../utils";

const AddLocation = ({ setNotify }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // new location
  const [newLocation, setNewLocation] = useState({
    name: "",
    address: "",
    state: "",
  });

  // const handleChange = (e: any) => {
  //   setNewLocation({
  //     ...newLocation,
  //     [e.target.name]: e.target.value,
  //   });
  // };

  const us_states = Utils.us_states

  const addLocation = () => {
    console.log(newLocation);

    LocationApi.createLocation(newLocation)
      .then((res) => {
        console.log(res);
        setNotify(true);
        setIsModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error adding location");
      });
  }

  return (
    <div>
      <AlertDialog.Root
        open={isModalOpen}
        onOpenChange={(isOpen) => {
          setIsModalOpen(isOpen);
        }}
      >
        <AlertDialog.Trigger asChild>
          <button className="">
            <div>
              <FaPlus className="text-primary cursor-pointer" />
            </div>
          </button>
        </AlertDialog.Trigger>

        <AlertDialog.Portal>
          <AlertDialog.Overlay className="bg-black bg-opacity-50 fixed inset-0 z-50" />

          <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full p-6">
            <div className="bg-white p-6 md:p-8 rounded-lg md:min-w-[30rem] overflow-y-scroll">
              <div className="flex justify-between items-center mb-6">
                <AlertDialog.Title className=" profile_content_heading">
                  Add Pickup Location
                </AlertDialog.Title>

                <AlertDialog.Cancel
                  className=""
                  onClick={() => setIsModalOpen(false)}
                >
                  <FaTimes />
                </AlertDialog.Cancel>
              </div>

              <div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Enter location e.g home, office, etc."
                    value={newLocation.name}
                    onChange={(e) =>
                      setNewLocation({
                        ...newLocation,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="mt-6">
                  <label className="text-sm font-medium">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Enter address"
                    value={newLocation.address}
                    onChange={(e) =>
                      setNewLocation({
                        ...newLocation,
                        address: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="mt-6">
                  <label className="text-sm font-medium">State</label>
                  {/* <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Enter state"
                    name="state"
                    value={newLocation.state}
                    onChange={(e) =>
                      setNewLocation({
                        ...newLocation,
                        state: e.target.value,
                      })
                    }
                  /> */}
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={newLocation.state}
                    onChange={(e) =>
                      setNewLocation({
                        ...newLocation,
                        state: e.target.value,
                      })
                    }
                  >
                    <option value="">Select State</option>
                    {
                      us_states.map((state, index) => (
                        <option key={index} value={state}>{state}</option>
                      ))
                    }
                  </select>
                </div>

                <div className="bg-black p-4 py-4 rounded-2xl flex items-center justify-between w-full mt-6 cursor-pointer"
                  onClick={() => addLocation()}
                >
                  <p className="text-lg font-semibold text-green">Add Location</p>
                  <FaPlus className="text-white" />
                </div>

                {/* cancel */}
                <p className="text-center mt-4"
                  onClick={() => setIsModalOpen(false)}
                >
                  <span className="text-primary cursor-pointer text-center">Cancel</span>
                </p>
                
              </div>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
};

export default AddLocation;
