import { Pie, Line } from "@ant-design/charts";
import { Card, Row, Col } from "antd";

export const OwnerDashBoard = () => {
  const roomData = [
    { type: "Đang ở", value: 45 },
    { type: "Trống", value: 25 },
    { type: "Đã đặt (HOLD)", value: 15 },
    { type: "Đang dọn phòng", value: 10 },
    { type: "Bảo trì", value: 5 },
  ];

  const revenueData = [
    { date: "01/12", revenue: 12000000 },
    { date: "02/12", revenue: 18500000 },
    { date: "03/12", revenue: 9800000 },
    { date: "04/12", revenue: 22000000 },
    { date: "05/12", revenue: 17500000 },
    { date: "06/12", revenue: 26000000 },
    { date: "07/12", revenue: 19800000 },
    { date: "08/12", revenue: 198000000},
  ];

  const roomConfig = {
    data: roomData,
    angleField: "value",
    colorField: "type",
    radius: 0.85,
    label: {
      type: "outer",
      content: (d: any) =>
        `${d.type}: ${d.value} phòng (${(d.percent * 100).toFixed(1)}%)`,
    },
    legend: {
      position: "right",
    },
  };

  const revenueConfig = {
    data: revenueData,
    xField: "date",
    yField: "revenue",
    smooth: true,
    tooltip: {
      formatter: (d: any) => ({
        name: "Doanh thu",
        value: `${d.revenue.toLocaleString("vi-VN")} ₫`,
      }),
    },
    yAxis: {
      label: {
        formatter: (v: string) => `${Number(v).toLocaleString("vi-VN")} ₫`,
      },
    },
  };

  return (
    <Row gutter={16}>
      <Col span={10}>
        <Card title="Công suất phòng hôm nay">
          <Pie {...roomConfig} />
        </Card>
      </Col>

      <Col span={14}>
        <Card title="Doanh thu 7 ngày gần nhất">
          <Line {...revenueConfig} />
        </Card>
      </Col>
    </Row>
  );
};
