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
            selectedUser?.userid === user.userid ? " md:bg-gray-100" : ""
          }`}
        >
          <FaUserTie className="text-3xl mr-2" />
          <div className="flex items-center">
            <h3 className="text-lg font-thin">{user.name}</h3>
          </div>
        </div>
      ))}
    </>
  );
};

export default UserList;
