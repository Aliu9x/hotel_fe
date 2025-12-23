import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Rate,
  Row,
  Col,
  Select,
  Descriptions,
  Divider,
  Space,
  message,
  Tag,
} from "antd";
import { getMyHotel, createHotel } from "@/services/api";
import { getProvinces, getDistricts, getWards } from "@/services/api";
import {
  EditOutlined,
  SaveOutlined,
  RollbackOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  FileDoneOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

type Approval = "PENDING" | "APPROVED";

type Hotel = {
  id: string;
  registration_code: string;
  approval_status: Approval;
  name: string;
  description?: string;
  star_rating?: number;
  address_line?: string;
  province_id?: number;
  province_name?: string;
  district_id?: number;
  district_name?: string;
  ward_id?: number;
  ward_name?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  // Contract (read-only here)
  legal_name?: string;
  legal_address?: string;
  signer_full_name?: string;
  signer_phone?: string;
  signer_email?: string;
  identity_doc_filename?: string;
  contract_pdf_filename?: string;
  created_at?: string;
  updated_at?: string;
  created_by_user_id?: string;
};

const HotelInfo: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [form] = Form.useForm();

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const province_id = Form.useWatch("province_id", form);
  const district_id = Form.useWatch("district_id", form);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyHotel();
        setHotel(data);
        // Prefill editable fields (Section 1)
        form.setFieldsValue({
          name: data?.name,
          description: data?.description,
          star_rating: data?.star_rating,
          address_line: data?.address_line,
          province_id: data?.province_id ? Number(data.province_id) : undefined,
          district_id: data?.district_id ? Number(data.district_id) : undefined,
          ward_id: data?.ward_id ? Number(data.ward_id) : undefined,
          contact_name: data?.contact_name,
          contact_email: data?.contact_email,
          contact_phone: data?.contact_phone,
        });
      } catch (e: any) {
        message.error(e?.message || "Không lấy được thông tin khách sạn");
      } finally {
        setLoading(false);
      }
    })();
  }, [form]);

  // Load provinces
  useEffect(() => {
    (async () => {
      try {
        const res = await getProvinces({ limit: 500 });
        const payload = res.data;
        setProvinces(
          (payload?.result || []).map((p: any) => ({
            label: `${p.type} - ${p.name}`,
            value: Number(p.id),
          }))
        );
      } catch {
        // ignore
      }
    })();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    (async () => {
      if (!province_id) {
        setDistricts([]);
        form.setFieldsValue({ district_id: undefined, ward_id: undefined });
        setWards([]);
        return;
      }
      try {
        const res = await getDistricts({
          provinceId: province_id,
          limit: 2000,
        });
        const payload = res.data;
        const newDistricts = (payload?.result || []).map((d: any) => ({
          label: `${d.type} - ${d.name}`,
          value: Number(d.id),
        }));
        setDistricts(newDistricts);
        const currentDistrict = form.getFieldValue("district_id");
        if (
          currentDistrict &&
          !newDistricts.find((d: any) => d.value === Number(currentDistrict))
        ) {
          form.setFieldsValue({ district_id: undefined, ward_id: undefined });
          setWards([]);
        }
      } catch {}
    })();
  }, [province_id, form]);

  useEffect(() => {
    (async () => {
      if (!district_id) {
        setWards([]);
        form.setFieldsValue({ ward_id: undefined });
        return;
      }
      try {
        const res = await getWards({ districtId: district_id, limit: 3000 });
        const payload = res.data;
        const newWards = (payload?.result || []).map((w: any) => ({
          label: `${w.type} - ${w.name}`,
          value: Number(w.id),
        }));
        setWards(newWards);
        const currentWard = form.getFieldValue("ward_id");
        if (
          currentWard &&
          !newWards.find((w: any) => w.value === Number(currentWard))
        ) {
          form.setFieldsValue({ ward_id: undefined });
        }
      } catch {}
    })();
  }, [district_id, form]);

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
    if (hotel && isEditing) {
      form.setFieldsValue({
        name: hotel.name,
        description: hotel.description,
        star_rating: hotel.star_rating,
        address_line: hotel.address_line,
        province_id: hotel.province_id ? Number(hotel.province_id) : undefined,
        district_id: hotel.district_id ? Number(hotel.district_id) : undefined,
        ward_id: hotel.ward_id ? Number(hotel.ward_id) : undefined,
        contact_name: hotel.contact_name,
        contact_email: hotel.contact_email,
        contact_phone: hotel.contact_phone,
      });
    }
  };

  const onSave = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);

      const asStr = (v: any) =>
        typeof v === "string" ? v.trim() : String(v ?? "").trim();
      const asNum = (v: any) =>
        v === undefined || v === null
          ? undefined
          : typeof v === "number"
          ? v
          : Number(v);

      const payload = {
        registration_code: hotel?.registration_code || "",
        approval_status: hotel?.approval_status || "PENDING",
        name: asStr(values.name),
        description: values.description ? asStr(values.description) : undefined,
        star_rating: asNum(values.star_rating),
        address_line: values.address_line
          ? asStr(values.address_line)
          : undefined,
        province_id: asNum(values.province_id),
        district_id: asNum(values.district_id),
        ward_id: asNum(values.ward_id),
        contact_name: values.contact_name
          ? asStr(values.contact_name)
          : undefined,
        contact_email: values.contact_email
          ? asStr(values.contact_email)
          : undefined,
        contact_phone: values.contact_phone
          ? asStr(values.contact_phone)
          : undefined,
      };

      if (!payload.name) {
        message.error("Tên cơ sở lưu trú là bắt buộc");
        return;
      }

      const updated = await createHotel(payload);

      setHotel((prev) => (prev ? { ...prev, ...updated } : updated));
      message.success("Đã cập nhật thông tin mục 1");
      setIsEditing(false);
    } catch (e: any) {
      const list =
        e?.original?.response?.data?.message || e?.response?.data?.message;
      if (Array.isArray(list)) message.error(list.join("; "));
      else
        message.error(
          e?.message || e?.original?.message || "Lỗi cập nhật thông tin"
        );
    }
  };

  const StatusBadge = ({ status }: { status?: Approval }) => {
    if (status === "APPROVED") return <Tag color="green">Đã duyệt</Tag>;
    if (status === "PENDING") return <Tag color="blue">Đang duyệt</Tag>;
    return <Tag>—</Tag>;
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <Card
        bordered={false}
        style={{ marginBottom: 16, background: "#f7fbff" }}
        bodyStyle={{ padding: 18 }}
      >
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Thông tin khách sạn
            </Title>
            <Text type="secondary">
              Mã đăng ký: {hotel?.registration_code} • Trạng thái:{" "}
              <StatusBadge status={hotel?.approval_status as Approval} />
            </Text>
          </div>
          <Space>
            {!isEditing && (
              <Button icon={<EditOutlined />} onClick={toggleEdit}>
                Chỉnh sửa mục 1
              </Button>
            )}
            {isEditing && (
              <>
                <Button icon={<RollbackOutlined />} onClick={toggleEdit}>
                  Hủy
                </Button>
                <Button type="primary" icon={<SaveOutlined />} onClick={onSave}>
                  Lưu thay đổi
                </Button>
              </>
            )}
          </Space>
        </Space>
      </Card>

      {/* Section 1 */}
      <Card
        title={
          <Space>
            <FileDoneOutlined />
            <span>Mục 1 - Thông tin cơ sở</span>
          </Space>
        }
        loading={loading}
        bodyStyle={{ paddingTop: 12 }}
      >
        {!isEditing && hotel ? (
          <>
            <Row gutter={[16, 8]}>
              <Col span={16}>
                <Title level={5} style={{ marginBottom: 8 }}>
                  {hotel.name}
                </Title>
                <div style={{ marginBottom: 8 }}>
                  <Rate disabled value={Number(hotel.star_rating || 0)} />
                </div>
                <Text type="secondary">{hotel.description || "—"}</Text>
              </Col>
              <Col span={8}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <EnvironmentOutlined />
                  <span>{hotel.address_line || "—"}</span>
                </div>
                <div style={{ color: "#666" }}>
                  {hotel.ward_name || "—"}, {hotel.district_name || "—"},{" "}
                  {hotel.province_name || "—"}
                </div>
                <Divider style={{ margin: "12px 0" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <PhoneOutlined />
                  <span>{hotel.contact_phone || "—"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <MailOutlined />
                  <span>{hotel.contact_email || "—"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <UserOutlined />
                  <span>{hotel.contact_name || "—"}</span>
                </div>
              </Col>
            </Row>
          </>
        ) : (
          <Form
            form={form}
            layout="vertical"
            initialValues={{ star_rating: 0 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Tên cơ sở lưu trú"
                  rules={[{ required: true }, { min: 3 }, { max: 255 }]}
                >
                  <Input placeholder="VD: Khách Sạn Ánh Dương Riverside" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="star_rating" label="Hạng sao">
                  <Rate allowClear style={{ fontSize: 24 }} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="description" label="Mô tả">
              <TextArea rows={3} placeholder="Mô tả ngắn về cơ sở..." />
            </Form.Item>
            <Divider orientation="left">Địa chỉ</Divider>
            <Form.Item name="address_line" label="Địa chỉ chi tiết">
              <Input placeholder="Số nhà, đường..." />
            </Form.Item>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="province_id"
                  label="Tỉnh/Thành phố"
                  rules={[{ required: true, message: "Chọn tỉnh/thành" }]}
                >
                  <Select
                    allowClear
                    showSearch
                    placeholder="Chọn tỉnh"
                    options={provinces}
                    filterOption={(input, option) =>
                      (option?.label as string)
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="district_id"
                  label="Quận/Huyện"
                  rules={[
                    {
                      validator: (_, v) => {
                        const p = form.getFieldValue("province_id");
                        if (!p) return Promise.resolve();
                        if (p && !v)
                          return Promise.reject(new Error("Chọn quận/huyện"));
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Select
                    allowClear
                    showSearch
                    disabled={!province_id}
                    placeholder="Chọn quận/huyện"
                    options={districts}
                    filterOption={(input, option) =>
                      (option?.label as string)
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="ward_id"
                  label="Phường/Xã"
                  rules={[
                    {
                      validator: (_, v) => {
                        const d = form.getFieldValue("district_id");
                        if (!d) return Promise.resolve();
                        if (d && !v)
                          return Promise.reject(new Error("Chọn phường/xã"));
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Select
                    allowClear
                    showSearch
                    disabled={!district_id}
                    placeholder="Chọn phường/xã"
                    options={wards}
                    filterOption={(input, option) =>
                      (option?.label as string)
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Divider orientation="left">Thông tin liên hệ</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="contact_name"
                  label="Tên người liên hệ"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="VD: Nguyễn Văn A" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="contact_email"
                  label="Email liên hệ"
                  rules={[{ required: true, type: "email" }]}
                >
                  <Input placeholder="contact@hotel.com" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="contact_phone"
                  label="Điện thoại liên hệ"
                  rules={[
                    { required: true },
                    { pattern: /^[0-9]{9,12}$/, message: "Số 9-12 chữ số" },
                  ]}
                >
                  <Input placeholder="0393726628" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Card>

      <Card
        style={{ marginTop: 16 }}
        loading={loading}
        title="Mục 2 - Hợp đồng (chỉ xem)"
      >
        {hotel ? (
          <>
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="Tên pháp nhân">
                    {hotel.legal_name || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ pháp nhân">
                    {hotel.legal_address || "—"}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="Người ký">
                    {hotel.signer_full_name || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Điện thoại người ký">
                    {hotel.signer_phone || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email người ký">
                    {hotel.signer_email || "—"}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </>
        ) : null}
      </Card>
    </div>
  );
};

export default HotelInfo;
