import React from "react";
import { FaUserTie } from "react-icons/fa";

const UserList = ({ users }) => {
  return (
    <>
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center px-5 py-3 cursor-pointer hover:bg-[#f5f5f5]"
        >
          <FaUserTie className="text-4xl mr-4" />
          <div className="flex-1">
            <h3 className="text-lg">{user.name}</h3>
            <p className="text-sm text-[#666] truncate max-w-[200px]">
              {user.lastMessage}
            </p>
          </div>
        </div>
      ))}
    </>
  );
};

export default UserList;
