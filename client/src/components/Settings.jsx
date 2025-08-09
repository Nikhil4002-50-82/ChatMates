import React, { useContext, useState } from "react";
import { FaCamera, FaUserTie } from "react-icons/fa";
import { RiMenuSearchFill } from "react-icons/ri";
import { toast } from "react-toastify";
import { userDataContext } from "../context/LoginContext";

export default function Settings({ onClick }) {
  const { userData, setUserData } = useContext(userDataContext);

  const [formData, setFormData] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
    phone: userData?.phone || "",
    avatar: null,
  });
  const [previewUrl, setPreviewUrl] = useState(
    userData?.avatar || "https://via.placeholder.com/100?text=Z"
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file");
        return;
      }
      setFormData((prev) => ({ ...prev, avatar: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Simulate API call to update user data
      setUserData({
        ...userData,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        avatar: previewUrl,
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="bg-[#f0f2f5] h-[calc(100dvh-80px)] w-full my-3 scrollbar-hide flex flex-col p-4 sm:p-6 overflow-y-auto transition-all duration-300">
      {/* Menu Icon (Mobile Only) */}
      <div className="flex items-center justify-start mb-4 sm:hidden">
        <button
          className="text-2xl text-custom1"
          onClick={onClick}
          aria-label="Toggle sidebar"
        >
          <RiMenuSearchFill className="text-4xl" />
        </button>
      </div>
      <div className="flex items-center justify-center flex-1">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg w-full max-w-4xl p-6 sm:p-8 transform transition-all hover:shadow-xl">
          {/* Header */}
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
            <FaUserTie className="text-custom1" /> Profile Settings
          </h2>

          {/* Profile Photo */}
          <div className="flex justify-center mb-6">
            <label htmlFor="avatarUpload" className="relative cursor-pointer group">
              <img
                src={previewUrl}
                alt="Profile"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <FaCamera className="text-white text-xl sm:text-2xl" />
              </div>
              <input
                id="avatarUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-5">
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                Name
              </label>
              <div className="relative flex items-center border border-[#e0e0e0] rounded-lg bg-[#f0f2f5] px-4 py-3 transition-all duration-200 focus-within:ring-2 focus-within:ring-custom1">
                <FaUserTie className="text-custom1 text-lg mr-3" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className="flex-1 bg-transparent focus:outline-none text-sm sm:text-base text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full bg-[#f0f2f5] border border-[#e0e0e0] rounded-lg px-4 py-3 text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-custom1 transition-all duration-200"
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full bg-custom1 text-white py-3 rounded-lg text-base sm:text-lg font-medium hover:bg-opacity-90 hover:scale-105 transition-all duration-200 shadow-md"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}