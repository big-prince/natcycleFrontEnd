/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react'
import dropOffLocationApi from '../../../api/dropOffLocationApi';

type props = {
  campaignForm: any,
  setCampaignForm: React.Dispatch<React.SetStateAction<any>>
}

export interface DropoffPoint {
  location: Location;
  _id: string;
  name: string;
  itemType: string;
  description: string;
  address: string;
  __v: number;
}

const SelectCampaignDropOffLocation = (
  {
    campaignForm,
    setCampaignForm,
  }: props
) => {
  const handleDropOffLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target
    setCampaignForm({
      ...campaignForm,
      dropOffLocationId: value,
    })
  }

  const [dropOffLocations, setDropOffLocations] = React.useState<any>([])

  useEffect(() => {
    const fetchLocations = () => {
      dropOffLocationApi.getDropOffLocations().then((res) => {
        setDropOffLocations(res.data.data.docs)
      })
        .catch(() => {
          console.log("error")
        })
    }

    fetchLocations()
  }, [])
  return (
    <div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Drop Off Location
        </label>

        <select
          name="location"
          id="location"
          className="input"
          onChange={handleDropOffLocationChange}
        >
          <option value="">Select Drop Off Location</option>
          {dropOffLocations && dropOffLocations.length > 0 &&
            dropOffLocations.map((location) => (
              <option key={location._id} value={location._id}>
                {location.name} - {location.address}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Drop Off Location Item
        </label>

        <p>
          {campaignForm.dropOffLocationId &&
            dropOffLocations &&
            dropOffLocations.length > 0 &&
            dropOffLocations.map((location: DropoffPoint) => {
              if (location._id === campaignForm.dropOffLocationId) {
                return (
                  <div key={location._id}
                    className='input'
                  >
                    <p>Item Type: {location.itemType}</p>
                  </div>
                )
              }
            })}
        </p>
      </div>


    </div>
  )
}

export default SelectCampaignDropOffLocation