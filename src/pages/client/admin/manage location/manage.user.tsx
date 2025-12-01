import React, { useEffect, useState } from "react";
import { Table, Input, Upload, Button, message, Space, Pagination } from "antd";
import {
  UploadOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { getProvinces, importProvinces } from "@/services/api";

const ManageLocationPage: React.FC = () => {
  const [data, setData] = useState<IProvince[]>([]);
  const [meta, setMeta] = useState<IPaginateMeta>({
    page: 1,
    limit: 20,
    pages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const columns = [
    { title: "ID", dataIndex: "id", width: 70 },
    { title: "Mã", dataIndex: "code", width: 80 },
    { title: "Tên", dataIndex: "name" },
    { title: "Loại", dataIndex: "type", width: 120 },
  ];

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getProvinces({ page, limit: meta.limit, search });
      setData(res.data?.result || []);
      if (res.data) setMeta(res.data.meta);
    } catch (e: any) {
      message.error(e.message || "Fetch provinces failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [search]);

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await importProvinces(file);
      message.success(`Imported ${res.data?.count} provinces`);
      setFile(null);
      fetchData(meta.page);
    } catch (e: any) {
      message.error(e.message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Quản lý Tỉnh / Thành phố</h2>
      <Space style={{ marginBottom: 12 }}>
        <Input
          allowClear
          placeholder="Tìm theo tên hoặc mã..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 240 }}
        />
        <Upload
          beforeUpload={(f) => {
            setFile(f);
            return false;
          }}
          maxCount={1}
          accept=".xlsx,.xls"
          showUploadList={{ showRemoveIcon: true }}
          onRemove={() => setFile(null)}
        >
          <Button icon={<UploadOutlined />}>Chọn file XLSX</Button>
        </Upload>
        <Button
          type="primary"
          disabled={!file}
          loading={loading}
          onClick={handleImport}
        >
          Import
        </Button>
        <Button icon={<ReloadOutlined />} onClick={() => fetchData(meta.page)}>
          Refresh
        </Button>
      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={false}
        size="middle"
        bordered
      />
      <Pagination
        style={{ marginTop: 16, textAlign: "right" }}
        current={meta.page}
        pageSize={meta.limit}
        total={meta.total}
        onChange={(p) => fetchData(p)}
        showSizeChanger={false}
      />
    </div>
  );
};

export default ManageLocationPage;
