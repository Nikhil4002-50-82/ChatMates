import React, { useContext, useState } from "react";
import { FaCamera, FaUserTie } from "react-icons/fa";
import { RiMenuSearchFill } from "react-icons/ri";
import { toast } from "react-toastify";
import axios from "axios";
import { userDataContext } from "../context/LoginContext";

export default function Settings({ onClick }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const { userData, setUserData } = useContext(userDataContext);

  const [formData, setFormData] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
    phoneno: userData?.phoneno || "", // Changed from phone to phoneno
    profilephoto: null,
  });
  const [previewUrl, setPreviewUrl] = useState(
    userData?.profilephoto || "https://placehold.co/100x100?text=Default"
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast.error("Please upload a valid image file");
    return;
  }

  setFormData((prev) => ({ ...prev, profilephoto: file }));
  setPreviewUrl(URL.createObjectURL(file));

  try {
    // Refresh token before upload
    await axios.get(`${API_BASE_URL}/refreshToken`, { withCredentials: true });

    const uploadFormData = new FormData();
    uploadFormData.append("file", file); // ✅ No userid sent

    const response = await axios.post(
      `${API_BASE_URL}/uploadProfilePhoto`,
      uploadFormData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      }
    );

    const profilePhotoUrl = response.data.url;

    await axios.put(
      `${API_BASE_URL}/updateUser`,
      { profilephoto: profilePhotoUrl }, // ✅ userid not needed here either
      { withCredentials: true }
    );

    setUserData((prev) => ({ ...prev, profilephoto: profilePhotoUrl }));
    setPreviewUrl(profilePhotoUrl);
    toast.success("Profile photo updated successfully!");
  } catch (error) {
    console.error("Failed to upload profile photo:", error.response?.data);
    toast.error(`Failed to upload profile photo: ${error.response?.data?.error || error.message}`);
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData?.userid) {
      console.error("userData.userid is missing:", userData); // Debug
      toast.error("User data not available. Please log in again.");
      return;
    }
    try {
      await axios.put(
        `${API_BASE_URL}/updateUser`,
        {
          userid: userData.userid,
          name: formData.name,
          phoneno: formData.phoneno, // Changed from phone to phoneno
        },
        { withCredentials: true }
      );
      setUserData({
        ...userData,
        name: formData.name,
        phoneno: formData.phoneno,
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error.response?.data, error.response?.status);
      toast.error(`Failed to update profile: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleImageError = () => {
    setPreviewUrl("/images/default-profilephoto.png");
  };

  return (
    <div className="bg-[#f0f2f5] h-[calc(100dvh-80px)] w-full scrollbar-hide flex flex-col overflow-y-auto transition-all duration-300">
      <div className="flex items-center fixed w-full justify-start py-3 px-4 mb-4 sm:hidden bg-white">
        <button
          className="text-2xl black"
          onClick={onClick}
          aria-label="Toggle sidebar"
        >
          <RiMenuSearchFill className="text-4xl" />
        </button>
      </div>
      <div className="flex items-center justify-center flex-1 px-4 py-1 sm:px-4 sm:py-2">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg w-full max-w-4xl p-6 sm:p-8 transform transition-all hover:shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
            <FaUserTie className="text-custom1 text-4xl" /> Profile Settings
          </h2>
          <div className="flex justify-center mb-6">
            <label htmlFor="profilephotoUpload" className="relative cursor-pointer group">
              <img
                src={previewUrl}
                alt="Profile"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-200"
                onError={handleImageError}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                <FaCamera className="text-white text-xl sm:text-2xl" />
              </div>
              <input
                id="profilephotoUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Name
              </label>
              <div className="relative flex items-center border border-[#e0e0e0] rounded-lg bg-[#f0f2f5] px-4 py-3 transition-all duration-200 focus-within:ring-2 focus-within:ring-custom1">
                <FaUserTie className="text-custom1 text-3xl mr-3" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className="flex-1 bg-transparent focus:outline-none text-lg text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly // Disable email input
                className="w-full bg-[#f0f2f5] border border-[#e0e0e0] rounded-lg px-4 py-3 text-lg text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-200 opacity-50"
              />
            </div>
            <div className="mb-5">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phoneno" // Changed from phone to phoneno
                value={formData.phoneno}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="w-full bg-[#f0f2f5] border border-[#e0e0e0] rounded-lg px-4 py-3 text-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-custom1 transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-custom1 text-white py-3 rounded-lg text-lg font-medium hover:bg-opacity-90 hover:scale-105 transition-all duration-200 shadow-md"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}