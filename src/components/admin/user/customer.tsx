import React from "react";
import UsersTable from "./users.table";

const CustomerTable: React.FC = () => {
  return <UsersTable role={"CUSTOMER"} headerTitle="Danh sách người dùng (Khách hàng)" />;
};

export default CustomerTable;