import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Image,
  Modal,
  message,
  Popconfirm,
  Typography,
  Empty,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  loadAllModerationImage,
  updateModerationImageHotel,
  updateModerationImageRoomType,
} from "@/services/api";
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { FlaggedItem, FlaggedRoomTypeImage } from "@/types/global";

const { Text } = Typography;

export const ImageModeration: React.FC = () => {
  const [data, setData] = useState<FlaggedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await loadAllModerationImage();
      setData(res.data?.result || []);
    } catch (e: any) {
      message.error(
        e?.response?.data?.message || "Không tải được danh sách ảnh cần duyệt"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const doUpdate = async (
    item: FlaggedItem,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      setUpdatingId(item.image_id);
      if (item.type === "HOTEL_IMAGE") {
        await updateModerationImageHotel(item.image_id, status);
      } else {
        await updateModerationImageRoomType(item.image_id, status);
      }
      message.success(
        status === "APPROVED"
          ? "Đã duyệt ảnh thành công"
          : "Đã từ chối ảnh thành công"
      );
      setData((prev) => prev.filter((x) => x.image_id !== item.image_id));
    } catch (e: any) {
      message.error(
        e?.response?.data?.message || "Cập nhật trạng thái thất bại"
      );
    } finally {
      setUpdatingId(null);
    }
  };
  function buildModerationImageUrl(item: FlaggedItem) {
    const base = import.meta.env.VITE_BACKEND_URL as string;
    const folder = item.type === "HOTEL_IMAGE" ? "hotel" : "roomType";
    return `${base}/images/${folder}/${item.file_name}`;
  }
  const columns: ColumnsType<FlaggedItem> = useMemo(
    () => [
      {
        title: "Ảnh",
        dataIndex: "file_name",
        key: "preview",
        width: 160,
        render: (_, item) => {
          const src = buildModerationImageUrl(item);
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Image
                src={src}
                alt={item.file_name}
                width={140}
                height={90}
                style={{
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "1px solid #eee",
                }}
                fallback={`${
                  import.meta.env.VITE_BACKEND_URL
                }/images/fallback.jpg`}
                preview={{
                  src: src,
                  mask: "Xem ảnh",
                }}
              />
            </div>
          );
        },
      },
      {
        title: "Tên tệp",
        dataIndex: "file_name",
        key: "file_name",
        width: 150,
        render: (fn: string) => (
          <Text copyable style={{ maxWidth: 240 }} ellipsis>
            {fn}
          </Text>
        ),
      },
      {
        title: "Loại",
        dataIndex: "type",
        key: "type",
        width: 120,
        render: (t: FlaggedItem["type"]) =>
          t === "HOTEL_IMAGE" ? (
            <Tag color="blue">Ảnh khách sạn</Tag>
          ) : (
            <Tag color="gold">Ảnh loại phòng</Tag>
          ),
      },
      {
        title: "Khách sạn",
        key: "hotel",
        width: 240,
        render: (_, item: FlaggedItem) => (
          <span>{item.hotel?.name || "-"}</span>
        ),
      },
      {
        title: "Loại phòng",
        key: "room_type",
        width: 200,
        render: (_, item: FlaggedItem) =>
          item.type === "ROOM_TYPE_IMAGE" ? (
            <span>{(item as FlaggedRoomTypeImage).room_type?.name || "-"}</span>
          ) : (
            <span>-</span>
          ),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 140,
        render: () => <Tag color="orange">AI_FLAGGED</Tag>,
      },
      {
        title: "Thời gian",
        dataIndex: "created_at",
        key: "created_at",
        width: 180,
        render: (d: string) => (d ? new Date(d).toLocaleString() : "-"),
      },
      {
        title: "Thao tác",
        key: "actions",
        fixed: "right",
        width: 220,
        render: (_, item: FlaggedItem) => (
          <Space>
            <Popconfirm
              title="Duyệt ảnh này?"
              okText="Duyệt"
              cancelText="Hủy"
              onConfirm={() => doUpdate(item, "APPROVED")}
            >
              <Button
                type="primary"
                icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
                loading={updatingId === item.image_id}
              >
                Approve
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Từ chối ảnh này?"
              okText="Từ chối"
              cancelText="Hủy"
              onConfirm={() => doUpdate(item, "REJECTED")}
            >
              <Button
                danger
                icon={<CloseCircleTwoTone twoToneColor="#ff4d4f" />}
                loading={updatingId === item.image_id}
              >
                Reject
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [updatingId]
  );

  return (
    <>
      <Space style={{ marginBottom: 12 }}>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchData}
          disabled={loading}
        >
          Tải lại
        </Button>
        <Tag color="orange">AI đã duyệt bạn hãy xem lại </Tag>
        <Text type="secondary">Danh sách ảnh cần admin kiểm duyệt</Text>
      </Space>

      {!loading && data.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid #eef1f5",
            borderRadius: 14,
            padding: 28,
            textAlign: "center",
            boxShadow: "0 4px 14px -4px rgba(0,0,0,0.08)",
          }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                Không có ảnh cần kiểm duyệt
                <br />
                Vui lòng kiểm tra lại sau
              </span>
            }
          >
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchData}>
                Tải lại
              </Button>
            </Space>
          </Empty>
        </div>
      ) : (
        <Table
          rowKey={(r) => r.image_id}
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1100 }}
        />
      )}

      <Modal
        open={!!previewSrc}
        onCancel={() => setPreviewSrc(null)}
        footer={null}
        width={900}
        title="Xem ảnh"
      >
        {previewSrc ? (
          <Image
            src={previewSrc}
            alt="Preview"
            style={{ width: "100%", maxHeight: 600, objectFit: "contain" }}
          />
        ) : null}
      </Modal>
    </>
  );
};
