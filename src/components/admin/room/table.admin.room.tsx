import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  createRoomCategory,
  getAllRoomCategory,
  updateRoomCategory,
} from "@/services/api";

const { Title } = Typography;

type RoomTypeCategory = {
  id: number;
  name: string;
};

export const TableAdminRoom: React.FC = () => {
  const [data, setData] = useState<RoomTypeCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoomTypeCategory | null>(null);

  const [form] = Form.useForm<{ name: string }>();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllRoomCategory();
      setData(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
    } catch {
      message.error("Không thể tải danh sách loại phòng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (item: RoomTypeCategory) => {
    setEditing(item);
    form.setFieldsValue({ name: item.name });
    setOpen(true);
  };

  const onSubmit = async () => {
    try {
      const { name } = await form.validateFields();
      if (editing) {
        await updateRoomCategory(String(editing.id), name);
        message.success("Cập nhật thành công");
      } else {
        await createRoomCategory(name);
        message.success("Tạo mới thành công");
      }
      setOpen(false);
      fetchData();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message || "Thao tác thất bại");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
    },
    {
      title: "Tên loại phòng",
      dataIndex: "name",
    },
    {
      title: "Thao tác",
      width: 100,
      render: (_: any, record: RoomTypeCategory) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => openEdit(record)}
        >
          Sửa
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Space
        style={{
          marginBottom: 16,
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <Title level={5} style={{ margin: 0 }}>
          Manage room types
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Thêm
          </Button>
        </Space>
      </Space>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editing ? "Chỉnh sửa loại phòng" : "Thêm loại phòng"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        okText={editing ? "Lưu" : "Tạo"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên loại phòng"
            rules={[
              { required: true, message: "Vui lòng nhập tên" },
              { min: 1, max: 100 },
            ]}
          >
            <Input placeholder="Ví dụ: Deluxe" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TableAdminRoom;
