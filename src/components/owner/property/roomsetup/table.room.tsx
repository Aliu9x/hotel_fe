import { getRoomType, updateRoomType } from "@/services/api";
import { DeleteTwoTone, EditTwoTone, PlusOutlined } from "@ant-design/icons";
import {
  ProTable,
  type ActionType,
  type ProColumns,
} from "@ant-design/pro-components";
import { App, Button, Switch, Tooltip } from "antd";
import { useRef, useState } from "react";
import { DetailRoomType } from "./detail.room";
import { CreateRoomType } from "./create.room";
import { UpdateRoomType } from "./update.room";

type TSearch = {
  name: string;
  view: string;
  max_occupancy: string;
  createdAt: string;
  createdAtRange: string;
};

export const TableRoomType = () => {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { notification, message } = App.useApp();

  const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
  const [openViewCreate, setOpenViewCreate] = useState<boolean>(false);
  const [dataViewDetail, setDataViewDetail] = useState<IRoomType | null>(null);
  const refreshTable = () => {
    actionRef.current?.reload();
  };
  const [meta, setMeta] = useState({
    page: 1,
    limit: 5,
    pages: 0,
    total: 0,
  });
  const handleToggleStatus = async (id: string, checked: boolean) => {
    try {
      await updateRoomType(id, { is_active: checked });
      message.success(`Đã ${checked ? "mở" : "đóng"} loại phòng`);
      actionRef.current?.reload();
    } catch (error) {
      message.error("Cập nhật trạng thái thất bại");
    }
  };

  const columns: ProColumns<IRoomType>[] = [
    {
      title: "Stt",
      dataIndex: "index",
      valueType: "indexBorder",
      width: 50,
    },
    {
      title: "ID",
      dataIndex: "_id",
      hideInSearch: true,
      render(dom, entity) {
        const randomId = Math.floor(
          100000000000 + Math.random() * 900000000000
        );

        return (
          <Tooltip title="Xem chi tiết loại phòng">
            <a
              href="#"
              onClick={() => {
                setDataViewDetail(entity);
                setOpenViewDetail(true);
              }}
            >
              {randomId}
            </a>
          </Tooltip>
        );
      },
    },
    {
      title: "Tên",
      dataIndex: "name",
      copyable: true,
      ellipsis: true,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      ellipsis: true,
    },
    {
      title: "Diện tích ",
      dataIndex: "room_size_label",
    },
    {
      title: "Số khách tối đa",
      dataIndex: "max_occupancy",
      hideInSearch: true,
      renderText: (text) => {
        if (!text) return "—";
        const trimmed = String(text).trim();
        return /\bngười$/i.test(trimmed) ? trimmed : `${trimmed} người`;
      },
    },

    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      valueType: "date",
      sorter: true,
      hideInSearch: true,
    },

    {
      title: "Create At",
      dataIndex: "createdAtRange",
      valueType: "dateRange",
      hideInTable: true,
    },
    {
      title: "Thao tác",
      align: "center",
      hideInSearch: true,
      render(dom, entity, index, action, schema) {
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <Tooltip title="Mở/Tắt loại phòng">
                <Switch
                  checked={entity.is_active}
                  checkedChildren="Mở"
                  unCheckedChildren="đóng"
                  onChange={(checked) => handleToggleStatus(entity.id, checked)}
                />
              </Tooltip>
            </div>
            {/* <div>
              {entity.smoking_allowed ? (
                <Tooltip
                  title="Cho phép hút thuốc"
                  style={{ paddingBottom: "50px" }}
                >
                  <span style={{ fontSize: 18, lineHeight: 1 }}>🚬</span>
                </Tooltip>
              ) : (
                <div></div>
              )}
            </div> */}

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Tooltip title="Chỉnh sửa">
                <EditTwoTone
                  twoToneColor="#f57800"
                  style={{ cursor: "pointer" }}
                />
              </Tooltip>
              <Tooltip title="Xóa">
                <DeleteTwoTone
                  twoToneColor="#ff4d4f"
                  style={{ cursor: "pointer" }}
                />
              </Tooltip>
            </div>
          </div>
        );
      },
    },
  ];
  return (
    <>
      <ProTable<IRoomType, TSearch>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params, sort, filter) => {
          let query = "";

          const res = await getRoomType(query);
          if (res.data) {
            setMeta(res.data.meta);
          }
          return {
            data: res.data?.result,
            page: meta.page,
            success: true,
            total: res.data?.meta.total,
          };
        }}
        rowKey="_id"
        pagination={{
          current: meta?.page,
          pageSize: meta?.limit,
          showSizeChanger: true,
          total: meta?.total,
          showTotal: (total, range) => {
            return (
              <div>
                {range[0]}-{range[1]} trên {total} hàng
              </div>
            );
          },
        }}
        dateFormatter="string"
        headerTitle="Loại phòng"
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              setOpenViewCreate(true);
              actionRef.current?.reload();
            }}
            type="primary"
          >
            Thêm loại phòng
          </Button>,
        ]}
      />

      <DetailRoomType
        openViewDetail={openViewDetail}
        setOpenViewDetail={setOpenViewDetail}
        dataViewDetail={dataViewDetail}
        setDataViewDetail={setDataViewDetail}
      />

      <UpdateRoomType
        openViewDetail={openViewDetail}
        setOpenViewDetail={setOpenViewDetail}
        dataViewDetail={dataViewDetail}
        setDataViewDetail={setDataViewDetail}
      />

      <CreateRoomType
        openViewCreate={openViewCreate}
        setOpenViewCreate={setOpenViewCreate}
        refreshTable={refreshTable}
      />
    </>
  );
};
