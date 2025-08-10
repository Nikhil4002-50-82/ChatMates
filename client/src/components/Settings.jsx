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
    phoneno: userData?.phoneno || "",
    profilephoto: null, // will store File object if new image chosen
  });

  const [previewUrl, setPreviewUrl] = useState(
    userData?.profilephoto || "https://placehold.co/100x100?text=Default"
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Only update preview & store file in state — no upload yet
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    setFormData((prev) => ({ ...prev, profilephoto: file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData?.userid) {
      toast.error("User data not available. Please log in again.");
      return;
    }

    try {
      let profilePhotoUrl = userData.profilephoto;

      // If a new file is selected, upload it first
      if (formData.profilephoto instanceof File) {
        await axios.get(`${API_BASE_URL}/refreshToken`, { withCredentials: true });

        const uploadFormData = new FormData();
        uploadFormData.append("file", formData.profilephoto);

        const uploadResponse = await axios.post(
          `${API_BASE_URL}/uploadProfilePhoto`,
          uploadFormData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );

        profilePhotoUrl = uploadResponse.data.url;
      }

      // Now update user data with the new name, phone, and possibly new profile photo URL
      await axios.put(
        `${API_BASE_URL}/updateUser`,
        {
          userid: userData.userid,
          name: formData.name,
          phoneno: formData.phoneno,
          profilephoto: profilePhotoUrl,
        },
        { withCredentials: true }
      );

      setUserData({
        ...userData,
        name: formData.name,
        phoneno: formData.phoneno,
        profilephoto: profilePhotoUrl,
      });

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error.response?.data);
      toast.error(`Failed to update profile: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleImageError = () => {
    setPreviewUrl("/images/default-profilephoto.png");
  };

  return (
    <div className="bg-[#f0f2f5] h-[calc(100dvh-80px)] w-full scrollbar-hide flex flex-col overflow-y-auto transition-all duration-300">
      <div className="flex items-center justify-start py-3 px-4 mb-4 sm:hidden bg-white">
        <button className="text-2xl black" onClick={onClick} aria-label="Toggle sidebar">
          <RiMenuSearchFill className="text-4xl" />
        </button>
      </div>
      <div className="flex items-center justify-center flex-1 px-4 py-1 sm:px-4 sm:py-2">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg w-full max-w-4xl p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
            <FaUserTie className="text-custom1 text-4xl" /> Profile Settings
          </h2>

          {/* Profile Image */}
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

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-lg font-medium text-gray-700 mb-2">Name</label>
              <div className="relative flex items-center border border-[#e0e0e0] rounded-lg bg-[#f0f2f5] px-4 py-3">
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
              <label className="block text-lg font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="w-full bg-[#f0f2f5] border border-[#e0e0e0] rounded-lg px-4 py-3 text-lg text-gray-800 opacity-50"
              />
            </div>

            <div className="mb-5">
              <label className="block text-lg font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                name="phoneno"
                value={formData.phoneno}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="w-full bg-[#f0f2f5] border border-[#e0e0e0] rounded-lg px-4 py-3 text-lg text-gray-800"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-custom1 text-white py-3 rounded-lg text-lg font-medium hover:bg-opacity-90 hover:scale-105 transition-all duration-200"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
