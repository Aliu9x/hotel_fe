import React, { useRef, useState } from "react";
import { Button, Tag, Tooltip, Space, message } from "antd";
import { EyeTwoTone, EditTwoTone, PlusOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import type { Role } from "@/types/file.constants";
import { getUserApi } from "@/services/api";
import CreateUserModal from "./create.user.modal";

type TSearch = {
  full_name?: string;
  email?: string;
  phone?: string;
};

const roleColors: Record<string, string> = {
  CUSTOMER: "blue",
  HOTEL_OWNER: "gold",
};

const roleText: Record<string, string> = {
  CUSTOMER: "Khách hàng",
  HOTEL_OWNER: "Chủ khách sạn",
};

interface UsersTableProps {
  role: Role;
  headerTitle: string;
}

const UsersTable: React.FC<UsersTableProps> = ({ role, headerTitle }) => {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [openCreate, setOpenCreate] = useState(false);

  const columns: ProColumns<IUser>[] = [
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      copyable: true,
      ellipsis: true,
      width: 220,
      hideInSearch: false,
      render: (_, e) => e.full_name || "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 220,
      hideInSearch: false,
      render: (_, e) => e.email || "-",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      width: 160,
      hideInSearch: false,
      render: (_, e) => e.phone || "-",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      width: 140,
      hideInSearch: true,
      render: (_, e) => (
        <Tag color={roleColors[e.role] || "default"}>
          {roleText[e.role] || e.role}
        </Tag>
      ),
    },
    {
      title: "Hình thức tạo",
      dataIndex: "signup_method",
      hideInSearch: true,
      width: 160,
      render: (_, e) =>
        e.signup_method === "ADMIN_CREATED" ? "Tạo bởi admin" : "Tự đăng ký",
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      valueType: "dateTime",
      hideInSearch: true,
      sorter: true,
      width: 180,
    },
    {
      title: "Thao tác",
      width: 100,
      hideInSearch: true,
      fixed: "right",
      render: (_, entity) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <EyeTwoTone
              style={{ cursor: "pointer", fontSize: 16 }}
              onClick={() => {
                message.info(`Xem chi tiết user #${entity.id}`);
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <EditTwoTone
              twoToneColor="#f57800"
              style={{ cursor: "pointer", fontSize: 16 }}
              onClick={() => {
                message.info(`Chỉnh sửa user #${entity.id}`);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<IUser, TSearch>
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        cardBordered
        scroll={{ x: 1100 }}
        request={async (params, sort) => {
          try {
            const query: any = {
              page: params.current || 1,
              limit: params.pageSize || 10,
              role,
            };
            const qParts = [
              params.full_name,
              params.email,
              params.phone,
            ].filter(Boolean);
            if (qParts.length > 0) query.q = qParts.join(" ").trim();

            if (sort && sort.created_at) {
              query.orderBy = "created_at";
              query.order = sort.created_at === "ascend" ? "ASC" : "DESC";
            }

            const res = await getUserApi(query);
            const payload = res.data;
            return {
              data: payload?.result || [],
              success: true,
              total: payload?.meta?.total || 0,
            };
          } catch (e) {
            message.error("Lỗi tải danh sách người dùng");
            return { data: [], success: false, total: 0 };
          }
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        search={{
          labelWidth: 140,
          defaultCollapsed: false,
          span: 6,
        }}
        dateFormatter="string"
        headerTitle={headerTitle}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => setOpenCreate(true)}
            type="primary"
          >
            Thêm mới
          </Button>,
        ]}
      />

      <CreateUserModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={() => actionRef.current?.reload()}
        role={role}
      />
    </>
  );
};

export default UsersTable;
