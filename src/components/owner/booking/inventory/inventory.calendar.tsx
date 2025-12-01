import React, { useMemo } from 'react';
import { Calendar, Badge, Tooltip, Tag, Progress, Space, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

const { Text } = Typography;

interface InventoryCalendarProps {
  inventories: IInventory[] | any; // tạm thời nới lỏng để debug
  onCellClick?: (inv: IInventory | null, dateISO: string) => void;
}

export const InventoryCalendar: React.FC<InventoryCalendarProps> = ({
  inventories,
  onCellClick,
}) => {
  // Bảo vệ nếu inventories không phải array
  const safeInventories: IInventory[] = Array.isArray(inventories) ? inventories : [];

  const mapByDate = useMemo(() => {
    const m = new Map<string, IInventory>();
    safeInventories.forEach(inv => {
      if (inv && inv.inventoryDate) {
        m.set(inv.inventoryDate, inv);
      }
    });
    return m;
  }, [safeInventories]);

  const dateCellRender = (value: Dayjs) => {
    const dateISO = value.format('YYYY-MM-DD');
    const inv = mapByDate.get(dateISO);

    if (!inv) {
      return (
        <div style={{ padding: 6, cursor: 'pointer' }} onClick={() => onCellClick?.(null, dateISO)}>
          <Tooltip title="Chưa có dữ liệu inventory">
            <Tag>no data</Tag>
          </Tooltip>
        </div>
      );
    }

    const soldRatio = inv.totalRooms > 0 ? Math.round((inv.roomsSold / inv.totalRooms) * 100) : 0;
    const avail = inv.availableRooms;
    const badgeStatus =
      inv.stopSell ? 'default'
      : avail === 0 ? 'default'
      : avail <= 3 ? 'warning'
      : 'success';

    return (
      <div style={{ padding: 6, cursor: 'pointer' }} onClick={() => onCellClick?.(inv, dateISO)}>
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          {inv.stopSell ? (
            <Tag color="red">Stop sell</Tag>
          ) : (
            <Badge status={badgeStatus as any} text={<Text strong>Avail: {inv.availableRooms}</Text>} />
          )}
          <Tooltip title={`Sold ${inv.roomsSold}/${inv.totalRooms}`}>
            <Progress percent={soldRatio} size="small" />
          </Tooltip>
          <Space size={8} wrap>
            <Tag color="blue">Total {inv.totalRooms}</Tag>
            <Tag color="gold">Blocked {inv.blockedRooms}</Tag>
            <Tag color="purple">Sold {inv.roomsSold}</Tag>
          </Space>
        </Space>
      </div>
    );
  };

  return (
    <Calendar
      fullscreen
      dateCellRender={dateCellRender}
      onSelect={(date) => {
        const iso = dayjs(date).format('YYYY-MM-DD');
        const inv = mapByDate.get(iso) || null;
        onCellClick?.(inv, iso);
      }}
    />
  );
};