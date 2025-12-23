import React from "react";
import UsersTable from "./users.table";

const OwnerTable: React.FC = () => {
  return <UsersTable role={"HOTEL_OWNER"} headerTitle="Danh sách người dùng (Chủ khách sạn)" />;
};

export default OwnerTable;