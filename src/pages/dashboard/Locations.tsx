import AddLocation from "./components/AddLocation"

const Locations = () => {
  return (
    <div>
      <div className="flex justify-between items-center mt-8">
        <h2 className="text-2xl font-bold">Locations</h2>

        <AddLocation />
      </div>
    </div>
  )
}

export default Locations