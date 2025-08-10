import React from "react";
import { FaUserTie } from "react-icons/fa";

const UserList = ({ users, selectedUser, onSelect }) => {
  return (
    <>
      {users.map((user) => (
        <div
          key={user.userid}
          onClick={() => onSelect(user)}
          className={`flex items-center px-5 py-3 cursor-pointer md:hover:bg-custom1 text-black border-b-2 border-collapse border-[#e0e0e0] md:hover:text-white ${
            selectedUser?.userid === user.userid ? "md:bg-gray-100" : ""
          }`}
        >
          {user.profilephoto ? (
            <img
              src={user.profilephoto}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = ""; // fallback to trigger icon
              }}
            />
          ) : (
            <FaUserTie className="text-3xl mr-2" />
          )}
          <div className="flex items-center ml-2">
            <h3 className="text-lg font-thin">{user.name}</h3>
          </div>
        </div>
      ))}
    </>
  );
};

export default UserList;
