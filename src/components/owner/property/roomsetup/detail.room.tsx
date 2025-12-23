import { getAmenityMappings, loadImageRoomType } from "@/services/api";
import { FORMATE_DATE } from "@/services/helper";
import {
  AppstoreOutlined,
  CheckOutlined,
  EyeOutlined,
  HomeOutlined,
  LeftOutlined,
  PictureOutlined,
  RightOutlined,
  StarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Carousel,
  Descriptions,
  Divider,
  Drawer,
  Image,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";

interface IProps {
  openViewDetail: boolean;
  setOpenViewDetail: (v: boolean) => void;
  dataViewDetail: IRoomType | null;
  setDataViewDetail: (v: IRoomType | null) => void;
}
export const DetailRoomType = (props: IProps) => {
  const { Title, Text } = Typography;

  const {
    dataViewDetail,
    openViewDetail,
    setDataViewDetail,
    setOpenViewDetail,
  } = props;
  const onClose = () => [setOpenViewDetail(false), setDataViewDetail(null)];
  const [dataImage, setDataImage] = useState<ILoadImage>();
  const [categories, setCategories] = useState<ICategory[]>([]);
  useEffect(() => {
    if (!dataViewDetail?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getAmenityMappings(dataViewDetail.id);
        if (!cancelled && res?.data) {
          setCategories(res.data);
        }
        const resImage = await loadImageRoomType(dataViewDetail.id);
        if (resImage && !cancelled) {
          setDataImage(resImage.data);
        }
      } catch (e) {}
    })();
    return () => {
      cancelled = true;
    };
  }, [dataViewDetail?.id]);
  const allImages = [dataImage?.thumbnail, ...(dataImage?.slider || [])].filter(
    Boolean
  );
  const carouselRef = React.useRef<any>(null);

  return (
    <>
      <Drawer title={null} width={720} onClose={onClose} open={openViewDetail}>
        <div>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Title level={4} style={{ margin: 0 }}>
                <HomeOutlined style={{ color: "#1677ff", marginRight: 8 }} />
                {dataViewDetail?.name || "—"}
              </Title>
              <Tag
                color={dataViewDetail?.is_active ? "green" : "red"}
                style={{ fontWeight: 500 }}
              >
                {dataViewDetail?.is_active
                  ? "Đang hoạt động"
                  : "Không hoạt động"}
              </Tag>
            </div>

            <Text type="secondary" style={{ fontSize: 15 }}>
              {dataViewDetail?.description ||
                "Chưa có mô tả cho loại phòng này."}
            </Text>

            <Divider plain style={{ margin: "12px 0" }}>
              <StarOutlined /> Thông tin cơ bản
            </Divider>

            <Descriptions bordered size="middle" column={2}>
              <Descriptions.Item label="Cảnh quan">
                {dataViewDetail?.view || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Diện tích (m²)">
                {dataViewDetail?.room_size_label || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng phòng">
                {dataViewDetail?.total_rooms
                  ? `${dataViewDetail.total_rooms} phòng`
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Cấu hình giường">
                {dataViewDetail?.bed_config || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Tầng">
                {dataViewDetail?.floor_level || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {dataViewDetail?.created_at
                  ? dayjs(dataViewDetail.created_at).format("DD/MM/YYYY HH:mm")
                  : "—"}
              </Descriptions.Item>
            </Descriptions>

            <Divider plain style={{ margin: "12px 0" }}>
              <TeamOutlined /> Sức chứa
            </Divider>
            <Descriptions bordered size="middle" column={2}>
              <Descriptions.Item label="Tối đa khách">
                {dataViewDetail?.max_occupancy
                  ? `${dataViewDetail.max_occupancy} người`
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Người lớn tối đa">
                {dataViewDetail?.max_adults
                  ? `${dataViewDetail.max_adults} người`
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Trẻ em tối đa">
                {dataViewDetail?.max_children
                  ? `${dataViewDetail.max_children} trẻ`
                  : "—"}
              </Descriptions.Item>
            </Descriptions>

            <Divider plain style={{ margin: "12px 0" }}>
              <EyeOutlined /> Cài đặt & Trạng thái
            </Divider>
            <Descriptions bordered size="middle" column={1}>
              <Descriptions.Item label="Cho phép hút thuốc">
                {dataViewDetail?.smoking_allowed === undefined ||
                dataViewDetail?.smoking_allowed === null ? (
                  <Badge status="default" text="Không xác định" />
                ) : dataViewDetail.smoking_allowed ? (
                  <Badge status="success" text="Cho phép hút thuốc" />
                ) : (
                  <Badge status="error" text="Không cho phép hút thuốc" />
                )}
              </Descriptions.Item>
            </Descriptions>
            {categories.length > 0 ? (
              <>
                <Divider plain style={{ margin: "12px 0" }}>
                  <AppstoreOutlined /> Tiện nghi
                </Divider>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 24,
                    width: "100%",
                  }}
                >
                  {categories.map((category: any) => (
                    <div key={category.category_id}>
                      <Title level={5} style={{ marginBottom: 8 }}>
                        {category.category_name}
                      </Title>

                      <Space
                        direction="vertical"
                        size="small"
                        style={{ marginLeft: 8 }}
                      >
                        {category.amenities.map((amenity: any) => (
                          <div
                            key={amenity.mapping_id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: 15,
                            }}
                          >
                            <CheckOutlined
                              style={{ color: "#52c41a", fontSize: 14 }}
                            />
                            <Text>{amenity.name}</Text>
                          </div>
                        ))}
                      </Space>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <Text type="secondary">
                Chưa có tiện nghi nào được thiết lập.
              </Text>
            )}

            <Divider plain style={{ margin: "12px 0" }}>
              <PictureOutlined /> Hình ảnh
            </Divider>
            <Descriptions bordered size="middle" column={1}>
              <Descriptions.Item>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: 900,
                    margin: "0 auto",
                  }}
                >
                  <Carousel
                    dots={false}
                    slidesToShow={3}
                    slidesToScroll={1}
                    ref={carouselRef}
                    draggable
                  >
                    {allImages.map((img, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "0 6px",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Tooltip
                          title={
                            allImages.length === 0 ? (
                              <Text strong type="success">
                                Ảnh bìa
                              </Text>
                            ) : (
                              <span
                                style={{ color: "#1890ff", fontWeight: 500 }}
                              >
                                Ảnh không gian
                              </span>
                            )
                          }
                        >
                          <Image
                            src={`${
                              import.meta.env.VITE_BACKEND_URL
                            }/images/roomType/${img}`}
                            alt={`hotel-img-${index}`}
                            width={240}
                            height={160}
                            style={{
                              objectFit: "cover",
                              borderRadius: 10,
                              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                              transition:
                                "transform 0.25s ease, box-shadow 0.25s ease",
                            }}
                            preview={true}
                            className="hover:scale-105 hover:shadow-lg cursor-pointer"
                          />
                        </Tooltip>
                      </div>
                    ))}
                  </Carousel>

                  <button
                    onClick={() => carouselRef.current?.prev()}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: -25,
                      transform: "translateY(-50%)",
                      background: "rgba(255,255,255,0.8)",
                      borderRadius: "50%",
                      border: "none",
                      cursor: "pointer",
                      padding: 6,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    <LeftOutlined />
                  </button>

                  {/* Nút phải */}
                  <button
                    onClick={() => carouselRef.current?.next()}
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: -25,
                      transform: "translateY(-50%)",
                      background: "rgba(255,255,255,0.8)",
                      borderRadius: "50%",
                      border: "none",
                      cursor: "pointer",
                      padding: 6,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    <RightOutlined />
                  </button>
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Space>
        </div>
      </Drawer>
    </>
  );
};
