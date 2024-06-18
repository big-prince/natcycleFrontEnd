import { FaChevronRight } from "react-icons/fa";

const BookPickup = () => {
  return (
    <div>
      <div>
        <h2 className="text-2xl font-bold mt-8">Book a Pickup</h2>

        {/* select location */}
        <div className="mt-6">
          <div className="flex justify-between">
            <label className="font-semibold">Select Pickup Location</label>
            <p>Add New</p>
          </div>
          <select className="w-full p-2 border border-gray-300 rounded-lg">
            <option value="1">Lekki</option>
            <option value="2">Ikeja</option>
            <option value="3">Yaba</option>
          </select>
        </div>
        <div className="mt-6">
          <label className="text-sm">Select Pickup Date</label>
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* time input */}
        <div className="mt-6">
          <label className="text-sm">Select Pickup Time</label>
          <input
            type="time"
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>


        {/* how many bottles do you want to recycle */}
        <div className="mt-6">
          <label className="text-sm">How many bottles do you want to recycle?</label>
          {/* select drop down for 0-50 50-100 and more */}
          <select className="w-full p-2 border border-gray-300 rounded-lg">
            <option value="1">0-50</option>
            <option value="2">50-100</option>
            <option value="3">More</option>
          </select>
        </div>

        <div className="bg-black p-4 py-4 rounded-2xl flex items-center justify-between w-full mt-6">
          <p className="text-lg font-semibold text-green">Submit</p>
          <FaChevronRight className="text-white" />
        </div>
      </div>
    </div>
  );
};

export default BookPickup;
