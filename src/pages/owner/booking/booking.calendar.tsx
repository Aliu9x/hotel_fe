import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Calendar,
  Select,
  Badge,
  Spin,
  Empty,
  Tag,
  Space,
  Divider,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import type { CalendarProps } from "antd";
import { getInventories, getRoomType } from "@/services/api";

interface IRoomType {
  id: string;
  name: string;
}
// yyyy-MM-dd
interface IInventory {
  id: string;
  inventoryDate: string;
  totalRooms: number;
  availableRooms: number;
  blockedRooms: number;
  roomsSold: number;
  stopSell: boolean;
}

const InventoryPage = () => {
  const [roomTypes, setRoomTypes] = useState<IRoomType[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState<string>();
  const [inventories, setInventories] = useState<IInventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState<Dayjs>(dayjs());

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const res = await getRoomType("");
        const list: IRoomType[] = res.data?.result || [];
        setRoomTypes(list);

        const lastSelected = localStorage.getItem("selectedRoomType");
        const initialId =
          list.find((rt) => rt.id === lastSelected)?.id ?? list[0]?.id;
        if (!selectedRoomType && initialId) {
          setSelectedRoomType(initialId);
        }
      } catch {
        setRoomTypes([]);
      }
    };
    fetchRoomTypes();
  }, []);
  useEffect(() => {
    if (selectedRoomType) {
      localStorage.setItem("selectedRoomType", selectedRoomType);
    }
  }, [selectedRoomType]);
  useEffect(() => {
    if (!selectedRoomType) return;
    const fetchInventories = async () => {
      setLoading(true);
      try {
        const startDate = visibleMonth.startOf("month").format("YYYY-MM-DD");
        const endDate = visibleMonth.endOf("month").format("YYYY-MM-DD");

        const res = await getInventories({
          roomTypeId: selectedRoomType,
          startDate,
          endDate,
        });
        setInventories(res.data || []);
      } catch {
        setInventories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInventories();
  }, [selectedRoomType, visibleMonth]);

  const inventoryMap = useMemo(() => {
    const map = new Map<string, IInventory>();
    inventories.forEach((inv) => {
      map.set(inv.inventoryDate, inv);
    });
    return map;
  }, [inventories]);

  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format("YYYY-MM-DD");
    const inv = inventoryMap.get(dateStr);

    if (!inv) {
      return <div style={{ color: "#999", textAlign: "center" }}>No data</div>;
    }

    const effective = Math.max(
      0,
      (inv.availableRooms ?? 0) - (inv.blockedRooms ?? 0) - (inv.roomsSold ?? 0)
    );

    if (inv.stopSell) {
      return (
        <div style={{ textAlign: "center" }}>
          <Tag color="red">Stop sell</Tag>
          <div style={{ fontSize: 12, color: "#999" }}>
            Tổng: {inv.totalRooms}
          </div>
        </div>
      );
    }

    return (
      <div style={{ textAlign: "center" }}>
        {effective > 0 ? (
          <Tag color="green">Trống {effective}</Tag>
        ) : (
          <Tag color="red">Hết phòng</Tag>
        )}

        <div style={{ marginTop: 4 }}>
          <Space size={4} wrap>
            <Tag color="cyan">Còn bán {inv.availableRooms}</Tag>
            {inv.roomsSold > 0 && (
              <Tag color="blue">Đã bán {inv.roomsSold}</Tag>
            )}
            {inv.blockedRooms > 0 && (
              <Tag color="orange">Đã chặn {inv.blockedRooms}</Tag>
            )}
          </Space>
        </div>

        <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
          Tổng: {inv.totalRooms}
        </div>
      </div>
    );
  };

  const disabledDate: CalendarProps<Dayjs>["disabledDate"] = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    const inv = inventoryMap.get(dateStr);
    if (!inv) return true;
    if (inv.stopSell) return true;
    const effective =
      (inv.availableRooms ?? 0) -
      (inv.blockedRooms ?? 0) -
      (inv.roomsSold ?? 0);
    if (effective <= 0) return true;
    return false;
  };

  const onPanelChange: CalendarProps<Dayjs>["onPanelChange"] = (value) => {
    setVisibleMonth(value.startOf("month"));
  };

  return (
    <Card title="Lịch tồn kho theo loại phòng">
      <Select
        style={{ width: 300, marginBottom: 16 }}
        placeholder="Chọn loại phòng"
        value={selectedRoomType}
        onChange={setSelectedRoomType}
        allowClear
      >
        {roomTypes.map((rt) => (
          <Select.Option key={rt.id} value={rt.id}>
            {rt.name}
          </Select.Option>
        ))}
      </Select>
      <Space size={8} wrap>
        <Tag color="green" style={{ marginLeft: "10px" }}>
          Trống
        </Tag>
        <Tag color="cyan">Còn bán</Tag>
        <Tag color="blue">Đã bán</Tag>
        <Tag color="orange">Đã chặn</Tag>
        <Tag color="red">Hết phòng / Stop sell</Tag>
      </Space>
      <Divider style={{ margin: "8px 0" }} />
      {!selectedRoomType ? (
        <Empty description="Vui lòng chọn loại phòng" />
      ) : loading ? (
        <Spin />
      ) : (
        <Calendar
          dateCellRender={dateCellRender}
          disabledDate={disabledDate}
          onPanelChange={onPanelChange}
          value={visibleMonth}
        />
      )}
    </Card>
  );
};

export default InventoryPage;
