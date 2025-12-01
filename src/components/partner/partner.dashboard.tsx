import React, { useEffect, useState } from "react";
import { Card, Button, Tag, Typography, Space, Empty, message } from "antd";
import { EnvironmentOutlined, CopyOutlined } from "@ant-design/icons";
import "./partner.dashboard.scss";
import { useNavigate } from "react-router-dom";
import {
  generateRegistrationCode,
  createEmptyRegistration,
  getRegistrationIndex,
  loadRegistration,
} from "@/services/partner.segistration.store";
import { getMyHotel } from "@/services/api";
import PartnerAvatarDropdown from "./partner.avatar.dropdown";

const { Title, Text } = Typography;

type HotelStatus = "PENDING" | "APPROVED" | "IN_PROGRESS" | "NONE";

interface DashboardItem {
  code?: string;
  name: string;
  district?: string;
  country?: string;
  updatedAt?: string;
  status: HotelStatus;
  hotelId?: string | number;
}

const PartnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const userEmail =
    localStorage.getItem("partnerUserEmail") || "partner@example.com";

  const loadData = async () => {
    setLoading(true);
    try {
      // 1) Fetch server hotel for current user (authoritative)
      const serverHotel = await getMyHotel().catch(() => null);

      if (serverHotel && serverHotel.id) {
        const status: HotelStatus =
          serverHotel.approval_status === "APPROVED" ? "APPROVED" : "PENDING";
        const item: DashboardItem = {
          name: serverHotel.name || "(Chưa đặt tên)",
          district: serverHotel.district_name || "",
          country: "VIETNAM",
          updatedAt: serverHotel.updated_at,
          status,
          hotelId: serverHotel.id,
        };
        setItems([item]);
        setLoading(false);
        return;
      }

      // 2) If no server hotel, show local “in-progress” registrations (if any)
      const codes = getRegistrationIndex();
      const mapped: DashboardItem[] = codes
        .map((c) => {
          const reg = loadRegistration(c);
          if (!reg) return null;
          const status: HotelStatus =
            reg.meta.status === "APPROVED"
              ? "APPROVED"
              : reg.meta.status === "PENDING"
              ? "PENDING"
              : "IN_PROGRESS";
          return {
            code: reg.meta.code,
            name: reg.data.basicInfo?.name || "(Chưa đặt tên)",
            district: reg.data.addressInfo?.district_id
              ? `District ${reg.data.addressInfo?.district_id}`
              : "",
            country: "VIETNAM",
            updatedAt: reg.meta.updatedAt,
            status,
            hotelId: reg.meta.hotelId,
          };
        })
        .filter(Boolean) as DashboardItem[];

      setItems(mapped.length > 0 ? mapped : []);
    } catch (e: any) {
      message.error(e?.message || "Không tải được dữ liệu dashboard");
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const startRegister = () => {
    const code = generateRegistrationCode(); // numeric-only
    createEmptyRegistration(code);
    navigate(`/partner/register/${code}`);
  };

  const openItem = (it: DashboardItem) => {
    if (it.status === "APPROVED" && it.hotelId) {
      navigate(`/owner?hotelId=${it.hotelId}`);
      return;
    }
    if (it.status === "PENDING") {
      message.info("Khách sạn đang được duyệt. Vui lòng chờ Admin duyệt.");
      return;
    }
    if (it.code) {
      navigate(`/partner/register/${it.code}`);
    } else {
      startRegister();
    }
  };

  const copyCode = (code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      message.success("Đã sao chép mã đăng ký");
    });
  };

  const renderStatusTag = (status: HotelStatus) => {
    switch (status) {
      case "APPROVED":
        return <Tag color="green">Đã duyệt</Tag>;
      case "PENDING":
        return <Tag color="blue">Đang duyệt</Tag>;
      case "IN_PROGRESS":
        return <Tag color="gold">Chưa hoàn tất đăng ký</Tag>;
      default:
        return null;
    }
  };

  const hasServerHotel = items.length === 1 && !items[0].code;

  return (
    <div className="partner-dashboard">
      <div className="pd-header">
        <div className="pd-logo">
          <span className="pd-logo-main">traveloka</span>
          <span className="pd-logo-sub">TERA</span>
        </div>
        <div className="pd-actions">
          <Button type="link">Hỗ trợ ▾</Button>
          <Button type="link">VI ▾</Button>
          <PartnerAvatarDropdown email={userEmail} />
        </div>
      </div>

      <div className="pd-container">
        <Title level={3} className="pd-title">
          Đăng ký cơ sở lưu trú
        </Title>

        {items.length === 0 && (
          <Card className="pd-empty">
            <Empty description="Chưa có đăng ký nào đang thực hiện" />
            <Button
              type="primary"
              style={{ marginTop: 18 }}
              onClick={startRegister}
            >
              Đăng ký ngay
            </Button>
          </Card>
        )}

        {items.length > 0 && (
          <div className="pd-list-wrapper">
            {items.map((it) => (
              <div
                className="pd-highlightCard"
                key={(it.code || it.hotelId || Math.random()).toString()}
              >
                <Card
                  className="pd-h-card"
                  loading={loading}
                  hoverable={it.status !== "PENDING"}
                  onClick={() => openItem(it)}
                >
                  <div className="pd-h-top">
                    <Space size="small" align="center">
                      {it.code && (
                        <>
                          <Text className="pd-id">{it.code}</Text>
                          <Button
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              copyCode(it.code);
                            }}
                          />
                        </>
                      )}
                    </Space>
                    {renderStatusTag(it.status)}
                  </div>

                  <div className="pd-h-name">{it.name}</div>

                  <div className="pd-h-location">
                    <EnvironmentOutlined /> {it.district || "—"}, {it.country}
                  </div>

                  <div className="pd-h-updated">
                    Cập nhật mới nhất:{" "}
                    {it.updatedAt
                      ? new Date(it.updatedAt).toLocaleDateString("vi-VN")
                      : "—"}
                  </div>

                  <div className="pd-h-footer">
                    <Button
                      size="small"
                      type="primary"
                      disabled={it.status === "PENDING"}
                      onClick={(e) => {
                        e.stopPropagation();
                        openItem(it);
                      }}
                    >
                      {it.status === "APPROVED" && it.hotelId
                        ? "Quản lý"
                        : it.status === "PENDING"
                        ? "Đang duyệt"
                        : "Tiếp tục đăng ký"}
                    </Button>
                  </div>
                </Card>
              </div>
            ))}

            {!hasServerHotel && (
              <div className="pd-registerSection">
                <div className="pd-reg-left">
                  <Title level={4}>Đăng ký cơ sở lưu trú</Title>
                  <Text>
                    Liệt kê danh sách cơ sở lưu trú của bạn và quảng bá đến hàng
                    triệu khách tiềm năng!
                  </Text>
                </div>
                <div className="pd-reg-right">
                  <Button type="primary" onClick={startRegister}>
                    Đăng ký ngay
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerDashboard;
