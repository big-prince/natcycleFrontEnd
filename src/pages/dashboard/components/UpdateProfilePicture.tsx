import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../hooks/reduxHooks";
import ProfileApi from "../../../api/profile.Api";
import { updateUser } from "../../../reducers/authSlice";

interface Props {
  oldPicture: string;
}

const UpdateProfilePicture = ({ oldPicture }: Props) => {
  const [previewSource, setPreviewSource] = useState(oldPicture);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setPreviewSource(oldPicture);
  }, [oldPicture]);

  const handleFileInputChange = (e: any) => {
    const file = e.target.files[0];
    //limit file size
    if (file.size > 2000000) {
      alert("Image shouldn't be more than 2mb!");
      return;
    }
    previewFile(file);
  };

  const previewFile = (file: Blob) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreviewSource(reader.result as string);
    };
  };

  const handleImageUpload = async () => {
    if (!previewSource) return;
    console.log("imgsrc", previewSource);
    uploadImage(previewSource);
  };

  const uploadImage = async (base64EncodedImage: string) => {
    if (!base64EncodedImage) return;
  
    setLoading(true);
    try {
      const res = await ProfileApi.updateProfileImage({
        image: base64EncodedImage,
      });
      console.log(res);
      dispatch(updateUser(res.data));
      setLoading(false);
      setSaved(true);
    } catch (error) {
      setLoading(false);
      alert("Something went wrong, try again!");
      console.error(error);
    }
  };
  return (
    <div className="w-full">
      {/* add profile picture */}
      <div className="flex items-center justify-center w-32 h-32 mx-auto mb-4 overflow-hidden ">
        <img src={previewSource} alt="preview" className="rounded-full w-32 h-32 object-cover" />
      </div>

      {/* upload button */}
      <div className="flex items-center justify-center w-full mb-4">
        <label className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50">
          <span>Select new image</span>
          <input
            type="file"
            className="hidden"
            accept=".png, .jpg, .jpeg"
            name="photo"
            onChange={handleFileInputChange}
          />
        </label>

        {previewSource && !saved && (
          <button
            onClick={handleImageUpload}
            disabled={loading}
            className="px-4 py-2 mr-4 text-sm font-medium text-white rounded-md shadow-sm bg-blue-600"
          >
            {loading ? "Uploading..." : "Save"}
          </button>
        )}

        {saved && (
          <p className="px-4 py-2 mr-4 text-sm font-medium text-white rounded-md shadow-sm bg-blue-600">
            Saved!
          </p>
        )}
      </div>
    </div>
  );
};

export default UpdateProfilePicture;
