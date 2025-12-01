import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Upload,
  Button,
  message,
  Space,
  Select,
  Pagination,
} from "antd";
import { UploadOutlined, SearchOutlined } from "@ant-design/icons";
import {
  getDistricts,
  getProvinces,
  getWards,
  importWards,
} from "@/services/api";

const WardsPage: React.FC = () => {
  const [provinces, setProvinces] = useState<IProvince[]>([]);
  const [provinceId, setProvinceId] = useState<number | undefined>();
  const [districts, setDistricts] = useState<IDistrict[]>([]);
  const [districtId, setDistrictId] = useState<number | undefined>();
  const [data, setData] = useState<IWard[]>([]);
  const [meta, setMeta] = useState<IPaginateMeta>({
    page: 1,
    limit: 20,
    pages: 1,
    total: 0,
  });
  const [search, setSearch] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const columns = [
    { title: "ID", dataIndex: "id", width: 70 },
    { title: "Mã", dataIndex: "code", width: 80 },
    { title: "Tên", dataIndex: "name" },
    { title: "Loại", dataIndex: "type", width: 120 },
    { title: "District ID", dataIndex: "district_id", width: 110 },
  ];

  const loadProvinces = async () => {
    try {
      const res = await getProvinces({ limit: 200 });
      setProvinces(res.data?.result || []);
    } catch {
      message.error("Load provinces failed");
    }
  };

  const loadDistricts = async () => {
    if (!provinceId) {
      setDistricts([]);
      setDistrictId(undefined);
      return;
    }
    try {
      const res = await getDistricts({ provinceId, limit: 500 });
      setDistricts(res.data?.result || []);
    } catch {
      message.error("Load districts failed");
    }
  };

  const fetchData = async (page = 1) => {
    if (!districtId) {
      setData([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getWards({
        districtId,
        page,
        limit: meta.limit,
        search,
      });
      setData(res.data?.result || []);
      if (res.data) setMeta(res.data.meta);
    } catch {
      message.error("Fetch wards failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProvinces();
  }, []);
  useEffect(() => {
    loadDistricts();
  }, [provinceId]);
  useEffect(() => {
    fetchData(1);
  }, [districtId, search]);

  const doImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await importWards(file);
      message.success(`Imported ${res.data?.count} wards`);
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
      <h2>Quản lý Phường / Xã / Thị trấn</h2>
      <Space style={{ marginBottom: 12 }} wrap>
        <Select
          placeholder="Chọn Tỉnh/TP"
          style={{ width: 200 }}
          value={provinceId}
          allowClear
          onChange={(v) => {
            setProvinceId(v);
            setDistrictId(undefined);
          }}
          options={provinces.map((p) => ({
            value: p.id,
            label: `${p.code} - ${p.name}`,
          }))}
        />
        <Select
          placeholder="Chọn Quận/Huyện"
          style={{ width: 220 }}
          value={districtId}
          allowClear
          onChange={(v) => setDistrictId(v)}
          options={districts.map((d) => ({
            value: d.id,
            label: `${d.code} - ${d.name}`,
          }))}
          disabled={!provinceId}
        />
        <Input
          allowClear
          placeholder="Tìm tên / mã..."
          prefix={<SearchOutlined />}
          style={{ width: 220 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={!districtId}
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
          onClick={doImport}
        >
          Import
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

export default WardsPage;
