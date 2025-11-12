import { getRoomType, getUserApi } from "@/services/api";
import { dateRangeValidate } from "@/services/helper";
import { DeleteTwoTone, EditTwoTone, PlusOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { Button } from "antd";
import { useRef, useState } from "react";

type TSearch = {
  name: string;
  view: string;
  max_occupancy: string;
  createdAt: string;
  createdAtRange: string;
};

const TableUser = () => {
  
};

export default TableUser;
