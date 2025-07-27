import React from "react";
import { FaUserTie } from "react-icons/fa";

const UserList = ({ users, selectedUser, onSelect }) => {
  return (
    <>
      {users.map((user) => (
        <div
          key={user.userid}
          onClick={() => onSelect(user)}
          className={`flex items-center px-5 py-3 cursor-pointer md:hover:bg-blue-600 text-black border-b-2 border-collapse border-[#e0e0e0] md:hover:text-white ${
            selectedUser?.userid === user.userid ? " md:bg-gray-100" : ""
          }`}
        >
          <FaUserTie className="text-4xl mr-2" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{user.name}</h3>
            {/* <p className="text-sm text-[#666] truncate max-w-[200px]">
              {user.phoneno}
            </p> */}
          </div>
        </div>
      ))}
    </>
  );
};

export default UserList;
