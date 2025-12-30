import React from "react";
import { Tag } from "antd";
import type { ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { getOwnerBookings } from "@/services/api";

// Chuẩn hóa mọi kiểu phản hồi về mảng
const normalizeArray = (res: any): any[] => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.list)) return res.list;
  if (Array.isArray(res?.results)) return res.results;
  return [];
};

const formatCurrency = (v?: string | number) =>
  typeof v === "number" || (typeof v === "string" && v !== "")
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(Number(v))
    : "--";

const statusTagColor = (s?: string) => {
  switch (s) {
    case "CONFIRMED":
      return "blue";
    case "PENDING":
      return "orange";
    case "CANCELLED":
      return "red";
    default:
      return "default";
  }
};

type BookingRow = {
  id: string | number;
  reservation_code: string;
  hotel_name: string;
  room_type_name: string;
  rate_plan_name: string;
  checkin_date: string;
  checkout_date: string;
  nights: number;
  status: string;
  total_price: string | number;
  payment_type: string;
};

const mapBookingToRow = (b: any): BookingRow => ({
  id: b?.id ?? b?.fid ?? Math.random(),
  reservation_code: b?.reservation_code ?? "--",
  hotel_name: b?.hotel?.name ?? "--",
  room_type_name: b?.roomType?.name ?? "--",
  rate_plan_name: b?.ratePlan?.name ?? "--",
  checkin_date: b?.checkin_date ?? "--",
  checkout_date: b?.checkout_date ?? "--",
  nights: typeof b?.nights === "number" ? b.nights : Number(b?.nights ?? 0),
  status: b?.status ?? "--",
  total_price: b?.total_price ?? b?.ratePlan?.price_amount ?? "--",
  payment_type: b?.payment_type ?? "--",
});

const columns: ProColumns<BookingRow>[] = [
  {
    title: "Mã đặt chỗ",
    dataIndex: "reservation_code",
    search: true,
  },
  {
    title: "Loại phòng",
    dataIndex: "room_type_name",
    ellipsis: true,
    hideInSearch: true,
  },
  {
    title: "Gói giá",
    dataIndex: "rate_plan_name",
    ellipsis: true,
    hideInSearch: true,
  },
  {
    title: "Nhận phòng",
    dataIndex: "checkin_date",
    hideInSearch: true,
  },
  {
    title: "Trả phòng",
    dataIndex: "checkout_date",
    hideInSearch: true,
  },
  {
    title: "Số đêm",
    dataIndex: "nights",
    hideInSearch: true,
  },
  {
    title: "Tình trạng",
    dataIndex: "status",
    hideInSearch: true,

    render: (_, r) => <Tag color={statusTagColor(r.status)}>{r.status}</Tag>,
  },
  {
    title: "Tổng tiền",
    hideInSearch: true,

    dataIndex: "total_price",
    render: (_, r) => formatCurrency(r.total_price),
  },
  {
    title: "Thanh toán",
    hideInSearch: true,
    dataIndex: "payment_type",
  },
];

export default function OwnerBookingsTable() {
  return (
    <ProTable<BookingRow>
      rowKey="id"
      columns={columns}
      search={{ labelWidth: "auto" }}
      pagination={{ pageSize: 10 }}
      request={async (params) => {
        const res = await getOwnerBookings({
          keyword: params?.reservation_code ?? "",
        });

        const rawList = normalizeArray(res);
        // Tránh lỗi (data || []).forEach bằng cách CHỈ thao tác khi là mảng
        const data: BookingRow[] = rawList.map(mapBookingToRow);

        // Debug nếu cần
        // console.log("OWNER BOOKINGS:", rawList, "=>", data);

        return {
          data,
          success: true,
          total: data.length,
        };
      }}
      toolBarRender={false}
    />
  );
}
