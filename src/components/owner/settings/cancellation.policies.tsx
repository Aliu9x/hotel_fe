import { Descriptions, Divider, Space } from "antd";
import {
  FileTextOutlined,
  ClockCircleOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getHotelPolicies } from "@/services/api";
import { useState } from "react";

const HotelPolicyView = () => {
  const [viewHotelPolicy, setViewHotelPolicy] = useState<IHotelPolicy>();
  const t = async () => {
    const res = await getHotelPolicies();
    if (res.data && res) {
      setViewHotelPolicy(res.data);
    }
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      <Divider plain style={{ margin: "12px 0" }}>
        <FileTextOutlined /> Chính sách khách sạn
      </Divider>

      <Descriptions bordered size="middle" column={2}>
        <Descriptions.Item
          label={
            <>
              <ClockCircleOutlined />
              &nbsp;Giờ nhận phòng
            </>
          }
        >
          {viewHotelPolicy?.default_checkin_time
            ? dayjs(viewHotelPolicy.default_checkin_time, "HH:mm:ss").format(
                "HH:mm"
              )
            : "—"}
        </Descriptions.Item>

        <Descriptions.Item label="Giờ trả phòng">
          {viewHotelPolicy?.default_checkout_time
            ? dayjs(viewHotelPolicy.default_checkout_time, "HH:mm:ss").format(
                "HH:mm"
              )
            : "—"}
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <>
              <HomeOutlined />
              &nbsp;Nội quy
            </>
          }
        >
          {viewHotelPolicy?.house_rules || "—"}
        </Descriptions.Item>

        <Descriptions.Item label="Chính sách trẻ em">
          {viewHotelPolicy?.children_policy || "—"}
        </Descriptions.Item>

        <Descriptions.Item label="Chính sách hút thuốc">
          {viewHotelPolicy?.smoking_policy || "—"}
        </Descriptions.Item>

        <Descriptions.Item label="Chính sách thú cưng">
          {viewHotelPolicy?.pets_policy || "—"}
        </Descriptions.Item>

        <Descriptions.Item label="Chính sách khác" span={2}>
          {viewHotelPolicy?.other_policies || "—"}
        </Descriptions.Item>
      </Descriptions>
    </Space>
  );
};

export default HotelPolicyView;
