import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Space,
  Typography,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Divider,
  Spin,
  message,
} from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import {
  adjustInventory,
  cancelReservation,
  getInventoriesRange,
  reserveInventory,
} from "@/services/api";
import { InventoryCalendar } from "@/components/owner/booking/inventory/inventory.calendar";
import { InventoryAdjustModal } from "@/components/owner/booking/inventory/inventory.adjust.modal";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const toISO = (d: Dayjs) => d.format("YYYY-MM-DD");

export const InventoryPage: React.FC = () => {
  // State chọn bộ lọc
  const [hotelId, setHotelId] = useState<number | undefined>(1);
  const [roomTypeId, setRoomTypeId] = useState<number | undefined>(1);
  const [range, setRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);

  // State dữ liệu
  const [inventories, setInventories] = useState<IInventory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Action reserve/cancel
  const [quantity, setQuantity] = useState<number>(1);

  // Modal adjust
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedInv, setSelectedInv] = useState<IInventory | null>(null);
  const [selectedDateISO, setSelectedDateISO] = useState<string | null>(null);

  const canQuery = useMemo(
    () => !!hotelId && !!roomTypeId && range?.[0] && range?.[1],
    [hotelId, roomTypeId, range]
  );

  const fetchData = useCallback(async () => {
    if (!canQuery) return;
    try {
      setLoading(true);
      const { data } = await getInventoriesRange({
        hotelId: hotelId!,
        roomTypeId: roomTypeId!,
        fromDate: toISO(range[0].startOf("month")),
        toDate: toISO(range[1].endOf("month").add(1, "day")), // toDate exclusive
      });
      if (data) {
        setInventories(data);
      } else {
      }
    } catch (e: any) {
      message.error(e?.response?.data?.message || e.message || "Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  }, [canQuery, hotelId, roomTypeId, range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onCellClick = (inv: IInventory | null, dateISO: string) => {
    setSelectedInv(inv);
    setSelectedDateISO(dateISO);
    setModalOpen(true);
  };

  const doReserve = async () => {
    if (!hotelId || !roomTypeId || !range?.[0] || !range?.[1]) return;
    const payload: IReserveInventoryPayload = {
      hotelId,
      roomTypeId,
      fromDate: toISO(range[0]),
      toDate: toISO(range[1].add(1, "day")),
      quantity,
    };
    try {
      setLoading(true);
      const { data } = await reserveInventory(payload);
      if (data) {
        message.success(`Giữ phòng thành công: ${data.quantity} phòng`);
        fetchData();
      } else {
        message.error(data || "Giữ phòng thất bại");
      }
    } catch (e: any) {
      message.error(
        e?.response?.data?.message || e.message || "Giữ phòng thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  const doCancel = async () => {
    if (!hotelId || !roomTypeId || !range?.[0] || !range?.[1]) return;
    const payload: ICancelReservationPayload = {
      hotelId,
      roomTypeId,
      fromDate: toISO(range[0]),
      toDate: toISO(range[1].add(1, "day")),
      quantity,
    };
    try {
      setLoading(true);
      const { data } = await cancelReservation(payload);
      if (data) {
        message.success(`Hủy thành công: trả lại ${data.quantity} phòng`);
        fetchData();
      } else {
        message.error(data || "Hủy thất bại");
      }
    } catch (e: any) {
      message.error(e?.response?.data?.message || e.message || "Hủy thất bại");
    } finally {
      setLoading(false);
    }
  };

  const submitAdjust = async (payload: IAdjustInventoryPayload) => {
    if (!selectedInv) {
      message.warning(
        "Ngày chưa có bản ghi, vui lòng tạo ở BE hoặc bổ sung luồng create ở FE."
      );
      return;
    }
    try {
      setModalLoading(true);
      const { data } = await adjustInventory(selectedInv.id, payload);
      if (data) {
        message.success("Cập nhật thành công");
        setModalOpen(false);
        fetchData();
      } else {
        message.error(data || "Cập nhật thất bại");
      }
    } catch (e: any) {
      message.error(
        e?.response?.data?.message || e.message || "Cập nhật thất bại"
      );
    } finally {
      setModalLoading(false);
    }
  };

  // Mock dữ liệu Hotel/RoomType (thay bằng API thực tế nếu có)
  const hotelOptions = [
    { value: 1, label: "Hotel #1" },
    { value: 2, label: "Hotel #2" },
  ];
  const roomTypeOptions = [
    { value: 1, label: "Deluxe" },
    { value: 2, label: "Suite" },
  ];

  return (
    <Spin spinning={loading}>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={6}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong>Khách sạn</Text>
                <Select
                  options={hotelOptions}
                  value={hotelId}
                  onChange={(v) => setHotelId(v)}
                  showSearch
                  placeholder="Chọn khách sạn"
                />
              </Space>
            </Col>
            <Col xs={24} md={6}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong>Loại phòng</Text>
                <Select
                  options={roomTypeOptions}
                  value={roomTypeId}
                  onChange={(v) => setRoomTypeId(v)}
                  showSearch
                  placeholder="Chọn loại phòng"
                />
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong>Khoảng ngày</Text>
                <RangePicker
                  value={range}
                  onChange={(val) => {
                    if (val && val[0] && val[1])
                      setRange(val as [Dayjs, Dayjs]);
                  }}
                  allowEmpty={false}
                />
              </Space>
            </Col>
            <Col xs={24} md={4}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong>Số lượng</Text>
                <InputNumber
                  min={1}
                  value={quantity}
                  onChange={(v) => setQuantity(Number(v) || 1)}
                  style={{ width: "100%" }}
                />
              </Space>
            </Col>
            <Col xs={24}>
              <Space wrap>
                <Button type="primary" onClick={fetchData}>
                  Làm mới
                </Button>
                <Button onClick={doReserve}>Giữ phòng</Button>
                <Button danger onClick={doCancel}>
                  Hủy (trả phòng)
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Card>
          <Title level={4} style={{ marginBottom: 0 }}>
            Lịch tồn kho
          </Title>
          <Text type="secondary">Click vào một ngày để điều chỉnh nhanh</Text>
          <Divider />
          <InventoryCalendar
            inventories={inventories}
            onCellClick={onCellClick}
          />
        </Card>
      </Space>
      // ...
      <InventoryAdjustModal
        open={modalOpen}
        loading={modalLoading}
        inventory={selectedInv}
        onCancel={() => setModalOpen(false)}
        onSubmit={async (payload) => {
          console.log("[Page] onSubmit called with:", {
            id: "1",
            payload,
          });
          if (!selectedInv?.id) {
            // Nếu đang click ngày không có bản ghi, sẽ không có id để adjust
            message.warning(
              "Ngày chưa có bản ghi. Vui lòng chọn ô có dữ liệu hoặc tạo bản ghi trước."
            );
            return;
          }
          try {
            setModalLoading(true);
            const res = await adjustInventory("1", payload);
            console.log("[Page] adjustInventory response:", res);
            if (res.data) {
              message.success("Cập nhật thành công");
              setModalOpen(false);
              fetchData();
            } else {
              message.error(res.data || "Cập nhật thất bại");
            }
          } catch (e: any) {
            console.error("adjustInventory error", e);
            message.error(
              e?.response?.data?.message || e.message || "Cập nhật thất bại"
            );
          } finally {
            setModalLoading(false);
          }
        }}
      />
    </Spin>
  );
};

export default InventoryPage;
