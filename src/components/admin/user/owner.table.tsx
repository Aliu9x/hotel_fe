import React, { useRef, useState } from "react";
import { Button, Tag, Tooltip, Space, message } from "antd";
import { EyeTwoTone, EditTwoTone, PlusOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import { getUserApi } from "@/services/api";
import CreateOwnerModal from "./create.owner.modal";
import UpdateOwnerModal from "./update.owner.modal";
import type { Role, UserStatus } from "@/types/file.constants";

const roleColors: Record<string, string> = { HOTEL_OWNER: "gold" };
const roleText: Record<string, string> = { HOTEL_OWNER: "Chủ khách sạn" };
const statusColors: Record<UserStatus, string> = {
  APPROVED: "default",
  SUSPENDED: "red",
};

const OwnerTable: React.FC = () => {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [openCreate, setOpenCreate] = useState(false);

  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | undefined>(
    undefined
  );

  const columns: ProColumns<IUser>[] = [
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      copyable: true,
      ellipsis: true,
      width: 220,
      render: (_, e) => e.full_name || "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 220,
      render: (_, e) => e.email || "-",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      width: 160,
      render: (_, e) => e.phone || "-",
    },
    {
      title: "Trạng thái",
      width: 140,
      dataIndex: "status",
      hideInSearch: true,
      render: (_, e) => {
        const st: UserStatus | undefined = e.status;
        return st ? <Tag color={statusColors[st]}>{st}</Tag> : "-";
      },
    },
    {
      title: "Vai trò",
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
      width: 160,
      hideInSearch: true,
      render: (_, e) =>
        e.signup_method === "ADMIN_CREATED" ? "Tạo bởi admin" : "Tự đăng ký",
    },
    {
      title: "Ngày tạo",
      hideInSearch: true,
      dataIndex: "created_at",
      valueType: "dateTime",
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
          {/* <Tooltip title="Xem chi tiết">
            <EyeTwoTone
              style={{ cursor: "pointer", fontSize: 16 }}
              onClick={() => message.info(`Xem chi tiết user #${entity.id}`)}
            />
          </Tooltip> */}
          <Tooltip title="Chỉnh sửa">
            <EditTwoTone
              twoToneColor="#f57800"
              style={{ cursor: "pointer", fontSize: 16 }}
              onClick={() => {
                setSelectedUser(entity);
                setOpenUpdate(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<IUser, { full_name?: string; email?: string; phone?: string }>
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
              role: "HOTEL_OWNER" as Role,
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
            console.log(res);
            const payload = res.data;
            return {
              data: payload?.result || [],
              success: true,
              total: payload?.meta?.total || 0,
            };
          } catch {
            message.error("Lỗi tải danh sách người dùng");
            return { data: [], success: false, total: 0 };
          }
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        search={{ labelWidth: 140, defaultCollapsed: false, span: 6 }}
        dateFormatter="string"
        headerTitle="Danh sách người dùng (Chủ khách sạn)"
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

      <CreateOwnerModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={() => actionRef.current?.reload()}
      />

      <UpdateOwnerModal
        open={openUpdate}
        user={selectedUser} // truyền user từ bảng
        onClose={() => {
          setOpenUpdate(false);
          setSelectedUser(undefined);
        }}
        onSuccess={() => actionRef.current?.reload()}
      />
    </>
  );
};

export default OwnerTable;
