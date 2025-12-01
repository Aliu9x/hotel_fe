import React, { useEffect, useRef, useState } from "react";
import { Button, Tag, Tooltip, message, Select, Space } from "antd";
import { PlusOutlined, EyeTwoTone, EditTwoTone } from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import {
  getAllHotels,
  getDistricts,
  getProvinces,
  getWards,
} from "@/services/api";
import CreateHotel from "./create.hotel";
import UpdateHotel from "./update.hotel";
import DetailHotel from "./detail.hotel";

interface TSearch {
  name?: string;
  approval_status?: HotelApprovalStatus;
  city?: string;
  provinceId?: number;
  districtId?: number;
  wardId?: number;
}

const TableHotel: React.FC = () => {
  const actionRef = useRef<ActionType>(undefined);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<IHotel | null>(null);
  const [detailHotel, setDetailHotel] = useState<IHotel | null>(null);

  // Location filters
  const [provinceOptions, setProvinceOptions] = useState<any[]>([]);
  const [districtOptions, setDistrictOptions] = useState<any[]>([]);
  const [wardOptions, setWardOptions] = useState<any[]>([]);
  const [filterProvinceId, setFilterProvinceId] = useState<
    number | undefined
  >();
  const [filterDistrictId, setFilterDistrictId] = useState<
    number | undefined
  >();
  const [filterWardId, setFilterWardId] = useState<number | undefined>();

  useEffect(() => {
    (async () => {
      try {
        // Lấy nhiều tỉnh (limit lớn)
        const res = await getProvinces({ limit: 300 });
        const payload = res.data;
        setProvinceOptions(
          (payload?.result || []).map((p: any) => ({
            label: `${p.code} - ${p.name}`,
            value: p.id,
          }))
        );
      } catch {
        message.error("Không tải được danh sách tỉnh");
      }
    })();
  }, []);

  // Khi chọn province
  useEffect(() => {
    (async () => {
      if (!filterProvinceId) {
        setDistrictOptions([]);
        setFilterDistrictId(undefined);
        setWardOptions([]);
        setFilterWardId(undefined);
        return;
      }
      try {
        const res = await getDistricts({
          provinceId: filterProvinceId,
          limit: 1000,
        });
        const payload = res.data;
        setDistrictOptions(
          (payload?.result || []).map((d: any) => ({
            label: `${d.code} - ${d.name}`,
            value: d.id,
          }))
        );
        setFilterDistrictId(undefined);
        setWardOptions([]);
        setFilterWardId(undefined);
      } catch {
        message.error("Không tải được quận/huyện");
      }
    })();
  }, [filterProvinceId]);

  // Khi chọn district
  useEffect(() => {
    (async () => {
      if (!filterDistrictId) {
        setWardOptions([]);
        setFilterWardId(undefined);
        return;
      }
      try {
        const res = await getWards({
          districtId: filterDistrictId,
          limit: 2000,
        });
        const payload = res.data;
        setWardOptions(
          (payload?.result || []).map((w: any) => ({
            label: `${w.code} - ${w.name}`,
            value: w.id,
          }))
        );
        setFilterWardId(undefined);
      } catch {
        message.error("Không tải được phường/xã");
      }
    })();
  }, [filterDistrictId]);

  const handleSuccess = () => {
    actionRef.current?.reload();
  };

  const statusEnum: Record<string, { color: string; text: string }> = {
    PENDING: { color: "orange", text: "⏳ Chờ duyệt" },
    APPROVED: { color: "green", text: "✅ Đã duyệt" },
    SUSPENDED: { color: "red", text: "🚫 Tạm ngưng" },
  };

  const columns: ProColumns<IHotel>[] = [
    {
      title: "Tên khách sạn",
      dataIndex: "name",
      copyable: true,
      ellipsis: true,
      width: 180,
    },
    {
      title: "Hạng sao",
      dataIndex: "star_rating",
      width: 120,
      hideInSearch: true,
      render: (_, entity) =>
        entity.star_rating ? (
          <span>
            {"★".repeat(entity.star_rating)}
            {entity.star_rating < 5 ? "☆".repeat(5 - entity.star_rating) : ""}
          </span>
        ) : (
          <span style={{ color: "#999" }}>Chưa đánh giá</span>
        ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address_line",
      ellipsis: true,
      hideInSearch: true,
      width: 260,
      render: (_, e) => {
        const address = [e.address_line, e.ward, e.district, e.city, e.province]
          .filter(Boolean)
          .join(", ");
        return address || "-";
      },
    },
    {
      title: "Tỉnh / Thành",
      dataIndex: "province",
      hideInSearch: true,
      width: 140,
      render: (_, e) => e.province || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "approval_status",
      width: 110,
      valueType: "select",
      valueEnum: {
        PENDING: { text: "Chờ duyệt" },
        APPROVED: { text: "Đã duyệt" },
        SUSPENDED: { text: "Tạm ngưng" },
      },
      render: (_, e) => {
        const cfg = statusEnum[e.approval_status] || {
          color: "default",
          text: "Không rõ",
        };
        return <Tag color={cfg.color}>{cfg.text}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      valueType: "dateTime",
      width: 160,
      hideInSearch: true,
      sorter: true,
    },
    {
      title: "Thao tác",
      hideInSearch: true,
      width: 90,
      fixed: "right",
      render: (_, entity) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <EyeTwoTone
              style={{ cursor: "pointer", fontSize: 16 }}
              onClick={() => {
                setDetailHotel(entity);
                setOpenDetail(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <EditTwoTone
              twoToneColor="#f57800"
              style={{ cursor: "pointer", fontSize: 16 }}
              onClick={() => {
                setSelectedHotel(entity);
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
      <Space style={{ marginBottom: 12 }} wrap>
        <Select
          allowClear
          placeholder="Tỉnh/Thành"
          style={{ width: 200 }}
          value={filterProvinceId}
          onChange={(v) => setFilterProvinceId(v)}
          options={provinceOptions}
        />
        <Select
          allowClear
          placeholder="Quận/Huyện"
          style={{ width: 200 }}
          value={filterDistrictId}
          onChange={(v) => setFilterDistrictId(v)}
          disabled={!filterProvinceId}
          options={districtOptions}
        />
        <Select
          allowClear
          placeholder="Phường/Xã"
          style={{ width: 200 }}
          value={filterWardId}
          onChange={(v) => setFilterWardId(v)}
          disabled={!filterDistrictId}
          options={wardOptions}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpenCreate(true)}
        >
          Thêm khách sạn
        </Button>
        <Button
          onClick={() => {
            setFilterWardId(undefined);
            setFilterDistrictId(undefined);
            setFilterProvinceId(undefined);
            actionRef.current?.reload();
          }}
        >
          Reset bộ lọc
        </Button>
      </Space>
      <ProTable<IHotel, TSearch>
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        cardBordered
        scroll={{ x: 1100 }}
        request={async (params, sort) => {
          try {
            const query: IListHotelsParams = {
              page: params.current || 1,
              limit: params.pageSize || 10,
            };
            if (params.name) query.q = params.name;
            if (params.approval_status)
              query.status = params.approval_status as HotelApprovalStatus;
            if (filterProvinceId) query.provinceId = filterProvinceId;
            if (filterDistrictId) query.districtId = filterDistrictId;
            if (filterWardId) query.wardId = filterWardId;
            if (sort && sort.created_at) {
              query.orderBy = "created_at";
              query.order = sort.created_at === "ascend" ? "ASC" : "DESC";
            }
            const res = await getAllHotels(query);
            const payload = res.data;
            if (!payload) return { data: [], success: false, total: 0 };
            return {
              data: payload.result || [],
              success: true,
              total: payload.meta.total || 0,
            };
          } catch (e) {
            message.error("Lỗi tải danh sách");
            return { data: [], success: false, total: 0 };
          }
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        dateFormatter="string"
        headerTitle="Danh sách khách sạn"
      />
      <CreateHotel
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={handleSuccess}
      />
      <UpdateHotel
        open={openUpdate}
        onClose={() => {
          setOpenUpdate(false);
          setSelectedHotel(null);
        }}
        onSuccess={handleSuccess}
        data={selectedHotel}
      />
      <DetailHotel
        open={openDetail}
        onClose={() => {
          setOpenDetail(false);
          setDetailHotel(null);
        }}
        data={detailHotel}
      />
    </>
  );
};

export default TableHotel;
