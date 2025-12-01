import React, { useEffect, useState } from 'react';
import { Table, Input, Upload, Button, message, Space, Select, Pagination } from 'antd';
import { UploadOutlined, SearchOutlined } from '@ant-design/icons';
import { getDistricts, getProvinces, importDistricts } from '@/services/api';


const DistrictsPage: React.FC = () => {
  const [provinces, setProvinces] = useState<IProvince[]>([]);
  const [provinceId, setProvinceId] = useState<number | undefined>();
  const [data, setData] = useState<IDistrict[]>([]);
  const [meta, setMeta] = useState<IPaginateMeta>({ page: 1, limit: 20, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: 'Mã', dataIndex: 'code', width: 80 },
    { title: 'Tên', dataIndex: 'name' },
    { title: 'Loại', dataIndex: 'type', width: 120 },
    { title: 'Province ID', dataIndex: 'province_id', width: 110 }
  ];

  const loadProvinces = async () => {
    try {
      const res = await getProvinces({ limit: 200 });
      setProvinces(res.data?.result || []);
    } catch (e: any) {
      message.error('Load provinces failed');
    }
  };

  const fetchData = async (page = 1) => {
    if (!provinceId) { setData([]); return; }
    setLoading(true);
    try {
      const res = await getDistricts({ page, limit: meta.limit, search, provinceId });
      setData(res.data?.result || []);
      if (res.data) setMeta(res.data.meta);
    } catch {
      message.error('Fetch districts failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProvinces(); }, []);
  useEffect(() => { fetchData(1); }, [provinceId, search]);

  const doImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await importDistricts(file);
      message.success(`Imported ${res.data?.count} districts`);
      setFile(null);
      fetchData(meta.page);
    } catch (e: any) {
      message.error(e.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Quản lý Quận / Huyện / Thị xã</h2>
      <Space style={{ marginBottom: 12 }} wrap>
        <Select
          placeholder="Chọn Tỉnh/TP"
          style={{ width: 220 }}
          value={provinceId}
          onChange={(v) => setProvinceId(v)}
          allowClear
          options={provinces.map(p => ({ value: p.id, label: `${p.code} - ${p.name}` }))}
        />
        <Input
          allowClear
          placeholder="Tìm tên / mã..."
          prefix={<SearchOutlined />}
          style={{ width: 220 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Upload
          beforeUpload={(f) => { setFile(f); return false; }}
          maxCount={1}
          accept=".xlsx,.xls"
          showUploadList={{ showRemoveIcon: true }}
          onRemove={() => setFile(null)}
        >
          <Button icon={<UploadOutlined />}>Chọn file XLSX</Button>
        </Upload>
        <Button type="primary" disabled={!file} loading={loading} onClick={doImport}>Import</Button>
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
        style={{ marginTop: 16, textAlign: 'right' }}
        current={meta.page}
        pageSize={meta.limit}
        total={meta.total}
        onChange={(p) => fetchData(p)}
        showSizeChanger={false}
      />
    </div>
  );
};

export default DistrictsPage;