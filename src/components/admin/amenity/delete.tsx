// src/components/admin/amenity-category/delete.amenity.tsx

import { deleteAmenityCategory } from "@/services/api";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Modal, message } from "antd";
import { useState } from "react";

interface IProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data: ICategory | null;
}

const DeleteAmenityCategory = (props: IProps) => {
  const { open, onClose, onSuccess, data } = props;
  const [loading, setLoading] = useState(false);

  // ✅ Handle delete
  const handleDelete = async () => {
    if (!data) return;

    setLoading(true);
    try {

      const res = await deleteAmenityCategory(data.id);

      if (res.data ) {
        message.success(`Đã xóa "${data.name_category}" thành công!`);
        onSuccess(); // Refresh table
        onClose();
      } else {
        message.error(res.error || "Xóa thất bại");
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Xóa thất bại";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ExclamationCircleOutlined style={{ color: "#ff4d4f", fontSize: 20 }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>Xác nhận xóa</span>
        </div>
      }
      open={open}
      onOk={handleDelete}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Xóa"
      okType="danger"
      cancelText="Hủy"
      centered
      width={500}
    >
      {data && (
        <div style={{ padding: "16px 0" }}>
          <p style={{ fontSize: 15, marginBottom: 16 }}>
            Bạn có chắc chắn muốn xóa loại tiện ích{" "}
            <strong style={{ color: "#ff4d4f" }}>"{data.name_category}"</strong>?
          </p>

          <div
            style={{
              padding: 12,
              background: "#fff7e6",
              border: "1px solid #ffd591",
              borderRadius: 6,
              fontSize: 13,
              color: "#d46b08",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              ⚠️ Cảnh báo:
            </div>
            <div>
              Hành động này sẽ xóa vĩnh viễn loại tiện ích và{" "}
              <strong>{data.amenities?.length || 0} tiện ích</strong> liên quan.
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: "#f5f5f5",
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            <div style={{ marginBottom: 4, color: "#666" }}>
              <strong>Thông tin:</strong>
            </div>
            <div>• ID: {data.id}</div>
            <div>• Áp dụng cho: {data.applies_to}</div>
            <div>• Số tiện ích: {data.amenities?.length || 0}</div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default DeleteAmenityCategory;