// TableAmenity.tsx

import {
  deleteAmenityCategory,
  getAllAmenityCategory,
  updateAmenitySearch,
} from "@/services/api";
import {
  DeleteTwoTone,
  EditTwoTone,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  LockOutlined,
  PlusOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { Button, Tooltip, Tag, App } from "antd";
import { useRef, useState } from "react";
import CreateAmenityCategory from "./create.amenity";
import UpdateAmenityCategory from "./update.amenity";
import DeleteAmenityCategory from "./delete";

type TSearch = {
  name_category?: string;
  applies_to?: "Hotel" | "Room";
  createdAtRange?: string;
};

const TableAmenity = () => {
  const actionRef = useRef<ActionType>(undefined);
  const { message } = App.useApp();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null
  );
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ICategory | null>(
    null
  );

  const notifyResult = (updated: any) => {
    if (updated?.show_in_search === true) {
      message.success({
        content: `Đã thêm "${updated.name}" vào danh sách tìm kiếm.`,
        icon: <InfoCircleOutlined style={{ color: "#52c41a" }} />,
      });
    } else if (updated?.show_in_search === false) {
      message.success({
        content: `Đã gỡ "${updated.name}" khỏi danh sách tìm kiếm.`,
        icon: <InfoCircleOutlined style={{ color: "#faad14" }} />,
      });
    } else {
      message.info("Đã cập nhật tiện ích.");
    }
  };

  const handleUpdateAmenityListSearch = async (
    id: string | number,
    active: boolean
  ) => {
    try {
      const res: any = await updateAmenitySearch(String(id), active);
      if (res?.data) {
        const updated = res.data;
        message.success(
          updated.show_in_search
            ? `Tiện ích ${updated.name} đã được chọn để tìm kiếm.`
            : `Tiện ích ${updated.name} đã bỏ khỏi tìm kiếm.`
        );
        actionRef.current?.reload();
      } else {
        message.error("Không nhận được dữ liệu cập nhật từ máy chủ.");
      }
    } catch (e: any) {
      message.error(
        e?.response?.data?.message || e?.message || "Cập nhật thất bại."
      );
    }
  };

  const columns: ProColumns<ICategory>[] = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      hideInSearch: true,
      render: (dom, entity) => <a href="#">{entity.id}</a>,
    },
    {
      title: "Tên loại",
      dataIndex: "name_category",
      copyable: true,
      fieldProps: {
        placeholder: "Tìm theo tên loại hoặc tiện ích",
      },
    },
    {
      title: "Áp dụng cho",
      dataIndex: "applies_to",
      valueType: "select",
      valueEnum: {
        Hotel: { text: "🏨 Khách sạn" },
        Room: { text: "🛏️ Loại phòng" },
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      valueType: "select",
      hideInSearch: true,
      render: (_, entity) => (
        <span style={{ color: entity.is_active ? "green" : "red" }}>
          {entity.is_active ? "✅ Hoạt động" : "❌ Không hoạt động"}
        </span>
      ),
    },
    {
      title: "Số tiện ích",
      key: "amenities_count",
      hideInSearch: true,
      width: 140,
      render: (_, entity) => {
        const amenities = entity.amenities || [];
        const total = amenities.length;

        if (total === 0) {
          return <span style={{ color: "#999" }}>0</span>;
        }

        const tooltipContent = (
          <div style={{ maxWidth: 360 }}>
            <div style={{ fontWeight: "bold", marginBottom: 8 }}>
              Danh sách tiện ích (bấm để thêm vào tìm kiếm):
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {amenities.map((amenity) => {
                const alreadySelected = amenity.show_in_search === true;
                return (
                  <Tooltip
                    key={amenity.id}
                    title={
                      alreadySelected
                        ? "Tiện ích đã được admin chọn để tìm kiếm. Không thể thêm nữa."
                        : "Thêm tiện ích này vào danh sách tìm kiếm"
                    }
                  >
                    <Tag
                      color={alreadySelected ? "default" : "blue"}
                      style={{
                        cursor: alreadySelected ? "not-allowed" : "pointer",
                        userSelect: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        borderStyle: alreadySelected ? "dashed" : "solid",
                      }}
                      onClick={() => {
                        if (alreadySelected) {
                          message.warning({
                            content: `Tiện ích "${amenity.name}" đã được chọn trước đó.`,
                            icon: <LockOutlined />,
                          });
                          return;
                        }
                        handleUpdateAmenityListSearch(amenity.id, true);
                      }}
                    >
                      {amenity.name}
                      {alreadySelected ? (
                        <LockOutlined style={{ color: "#999" }} />
                      ) : (
                        <UnlockOutlined style={{ color: "#1890ff" }} />
                      )}
                    </Tag>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        );

        return (
          <Tooltip
            title={tooltipContent}
            placement="topRight"
            overlayStyle={{ maxWidth: 420 }}
          >
            <span
              style={{
                color: "#1890ff",
                cursor: "pointer",
                fontWeight: 500,
                textDecoration: "underline",
                textDecorationStyle: "dotted",
              }}
            >
              {total} tiện ích
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "Tiện ích được chọn để tìm kiếm",
      key: "amenities_count_search",
      hideInSearch: true,
      width: 280,
      render: (_, entity) => {
        const selected = (entity.amenities || []).filter(
          (a) => a.show_in_search === true
        );
        const count = selected.length;

        if (count === 0) {
          return <span style={{ color: "#999" }}>Không có</span>;
        }

        const tooltipContent = (
          <div style={{ maxWidth: 360 }}>
            <div style={{ fontWeight: "bold", marginBottom: 8 }}>
              Danh sách tiện ích đang được tìm kiếm (bấm để gỡ):
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {selected.map((amenity) => (
                <Tooltip
                  key={amenity.id}
                  title="Gỡ tiện ích này khỏi danh sách tìm kiếm"
                >
                  <Tag
                    color="green"
                    style={{
                      cursor: "pointer",
                      userSelect: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                    onClick={() =>
                      handleUpdateAmenityListSearch(amenity.id, false)
                    }
                  >
                    {amenity.name}
                    <DeleteTwoTone twoToneColor="#fa8c16" />
                  </Tag>
                </Tooltip>
              ))}
            </div>
          </div>
        );

        return (
          <Tooltip
            title={tooltipContent}
            placement="topLeft"
            overlayStyle={{ maxWidth: 420 }}
          >
            <span
              style={{
                color: "#1890ff",
                cursor: "pointer",
                fontWeight: 500,
                textDecoration: "underline",
                textDecorationStyle: "dotted",
              }}
            >
              {count} tiện ích được chọn để tìm kiếm
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      valueType: "dateTime",
      sorter: true,
      hideInSearch: true,
    },
    {
      title: "Thao tác",
      hideInSearch: true,
      width: 100,
      fixed: "right",
      render: (dom, entity) => (
        <>
          <Tooltip title="Chỉnh sửa">
            <EditTwoTone
              twoToneColor="#f57800"
              style={{ cursor: "pointer", marginRight: 12, fontSize: 16 }}
              onClick={() => {
                setSelectedCategory(entity);
                setOpenUpdateModal(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Xóa">
            <DeleteTwoTone
              twoToneColor="#ff4d4f"
              style={{ cursor: "pointer", fontSize: 16 }}
              onClick={() => {
                setCategoryToDelete(entity);
                setOpenDeleteModal(true);
              }}
            />
          </Tooltip>
        </>
      ),
    },
  ];

  const handleCreateSuccess = () => {
    actionRef.current?.reload();
  };
  const handleSuccess = () => {
    actionRef.current?.reload();
  };

  return (
    <>
      <ProTable<ICategory, TSearch>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params, sort, filter) => {
          try {
            const queryParams: IListCategoriesParams = {
              page: params.current || 1,
              limit: params.pageSize || 10,
            };

            if (params.name_category) {
              queryParams.q = params.name_category;
            }

            if (params.applies_to) {
              queryParams.applies_to = params.applies_to;
            }

            if (sort && sort.created_at) {
              queryParams.orderBy = "created_at";
              queryParams.order = sort.created_at === "ascend" ? "ASC" : "DESC";
            }

            const res = await getAllAmenityCategory(queryParams);

            if (!res.data) {
              return { data: [], success: false, total: 0 };
            }

            const { result, meta } = res.data;
            return {
              data: result || [],
              success: true,
              total: meta?.total || 0,
            };
          } catch (error: any) {
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) => (
            <div>
              {range[0]}-{range[1]} trên {total} bản ghi
            </div>
          ),
        }}
        dateFormatter="string"
        headerTitle="Danh sách loại tiện ích"
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => setOpenCreateModal(true)}
            type="primary"
          >
            Thêm mới
          </Button>,
        ]}
      />

      <CreateAmenityCategory
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <UpdateAmenityCategory
        open={openUpdateModal}
        onClose={() => {
          setOpenUpdateModal(false);
          setSelectedCategory(null);
        }}
        onSuccess={handleSuccess}
        data={selectedCategory}
      />

      <DeleteAmenityCategory
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setCategoryToDelete(null);
        }}
        onSuccess={handleSuccess}
        data={categoryToDelete}
      />
    </>
  );
};

export default TableAmenity;
