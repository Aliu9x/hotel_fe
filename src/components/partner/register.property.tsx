import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  Form,
  Input,
  Checkbox,
  Button,
  message,
  Typography,
  Rate,
  Select,
  Row,
  Col,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import "./register.property.scss";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProvinces,
  getDistricts,
  getWards,
  createHotel,
  uploadContractFiles,
  updateHotelContract,
  submitRegistration,
} from "@/services/api";
import PartnerAvatarDropdown from "./partner.avatar.dropdown";
import { useCurrentApp } from "../context/app.context";

const { Title, Text } = Typography;
const { TextArea } = Input;

type StepKey = "OVERVIEW" | "CONTRACT";

const pickName = (label: any) =>
  typeof label === "string" ? label.split(" - ").pop()?.trim() || "" : "";

const RegisterProperty: React.FC = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const userEmail =
    localStorage.getItem("partnerUserEmail") || "partner@example.com";

  const [loading, setLoading] = useState(true);

  // Gộp form thành 2 bước, mỗi bước có thể gồm nhiều phần nhưng chỉ 1 nút lưu/submit
  const [formBasic] = Form.useForm();
  const [formAddress] = Form.useForm();
  const [formContact] = Form.useForm();
  const [formLegal] = Form.useForm();
  const [formTerms] = Form.useForm();

  const [activeMain, setActiveMain] = useState<StepKey>("OVERVIEW");

  const prevProvinceRef = useRef<number | undefined>(undefined);
  const prevDistrictRef = useRef<number | undefined>(undefined);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const province_id = Form.useWatch("province_id", formAddress);
  const district_id = Form.useWatch("district_id", formAddress);

  const [contractPdfFile, setContractPdfFile] = useState<File | null>(null);
  const [identityDocFile, setIdentityDocFile] = useState<File | null>(null);

  const [hotelId, setHotelId] = useState<number | null>(null);

  const { setIsAuthenticated, setUser } = useCurrentApp();
  useEffect(() => {
    if (!code) {
      message.error("Thiếu mã đăng ký");
      navigate("/partner/dashboard");
      return;
    }
    setLoading(false);
  }, [code, navigate]);

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
        message.error("Không tải được tỉnh");
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (province_id === undefined || province_id === null) {
        if (districts.length) setDistricts([]);
        if (wards.length) setWards([]);
        return;
      }
      if (prevProvinceRef.current === province_id) return;

      prevProvinceRef.current = province_id;

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

        const currentDistrict = formAddress.getFieldValue("district_id");
        if (
          currentDistrict &&
          !newDistricts.find((d: any) => d.value === Number(currentDistrict))
        ) {
          formAddress.setFieldsValue({
            district_id: undefined,
            ward_id: undefined,
            district_name: undefined,
            ward_name: undefined,
          });
          setWards([]);
          prevDistrictRef.current = undefined;
        }
      } catch {
        message.error("Không tải được quận/huyện");
      }
    })();
  }, [province_id]);

  useEffect(() => {
    (async () => {
      if (district_id === undefined || district_id === null) {
        if (wards.length) setWards([]);
        return;
      }

      if (prevDistrictRef.current === district_id) return;

      prevDistrictRef.current = district_id;

      try {
        const res = await getWards({ districtId: district_id, limit: 3000 });
        const payload = res.data;
        const newWards = (payload?.result || []).map((w: any) => ({
          label: `${w.type} - ${w.name}`,
          value: Number(w.id),
        }));
        setWards(newWards);

        const currentWard = formAddress.getFieldValue("ward_id");
        if (
          currentWard &&
          !newWards.find((w: any) => w.value === Number(currentWard))
        ) {
          formAddress.setFieldsValue({
            ward_id: undefined,
            ward_name: undefined,
          });
        }
      } catch {
        message.error("Không tải được phường/xã");
      }
    })();
  }, [district_id]);

  const finalizeOverview = async () => {
    if (!code) return;
    try {
      await formBasic.validateFields();
      await formAddress.validateFields();
      await formContact.validateFields();

      const b = formBasic.getFieldsValue(true);
      const a = formAddress.getFieldsValue(true);
      const c = formContact.getFieldsValue(true);

      const asStr = (v: any) =>
        typeof v === "string" ? v.trim() : String(v ?? "").trim();
      const asNum = (v: any) =>
        v === undefined || v === null
          ? undefined
          : typeof v === "number"
          ? v
          : Number(v);

      if (a.province_id && !a.district_id) {
        message.error("Vui lòng chọn Quận/Huyện");
        return;
      }
      if (a.district_id && !a.ward_id) {
        message.error("Vui lòng chọn Phường/Xã");
        return;
      }

      const payload = {
        registration_code: code,
        approval_status: "PENDING" as const,
        name: asStr(b.name),
        description: b.description ? asStr(b.description) : undefined,
        star_rating: asNum(b.star_rating),
        address_line: a.address_line ? asStr(a.address_line) : undefined,
        province_id: asNum(a.province_id),
        district_id: asNum(a.district_id),
        ward_id: asNum(a.ward_id),
        contact_name: c.contactName ? asStr(c.contactName) : undefined,
        contact_email: c.contactEmail ? asStr(c.contactEmail) : undefined,
        contact_phone: c.contactPhone ? asStr(c.contactPhone) : undefined,
      };

      if (!payload.name) {
        message.error("Tên cơ sở lưu trú là bắt buộc");
        return;
      }

      const hotel = await createHotel(payload);
      const hid = hotel?.id ?? hotel?.data?.id;
      if (!hid) {
        message.error("Không nhận được hotel id từ server");
        return;
      }

      setHotelId(hid);
      message.success("Tạo khách sạn & hoàn tất Mục 1");
      setActiveMain("CONTRACT");
    } catch (e: any) {
      const msg = Array.isArray(e?.response?.data?.message)
        ? e.response.data.message.join("; ")
        : e?.message || "Lỗi hoàn tất Mục 1";
      message.error(msg);
    }
  };

  const submitAll = async () => {
    if (!code) return;
    try {
      if (!hotelId) {
        message.error("Chưa có hotelId (cần hoàn tất mục 1)");
        return;
      }

      await formLegal.validateFields();
      await formTerms.validateFields();

      const legal = formLegal.getFieldsValue(true);
      const contact = formContact.getFieldsValue(true);
      let uploadRes: {
        contract_pdf_filename?: string;
        identity_doc_filename?: string;
      } = {};
      if (contractPdfFile || identityDocFile) {
        uploadRes = await uploadContractFiles({
          id_hotel: String(hotelId),
          contract_pdf: contractPdfFile || null,
          identity_doc: identityDocFile || null,
        });
      }

      const asStr = (v: any) =>
        typeof v === "string" ? v.trim() : String(v ?? "").trim();
      const payloadContract = {
        id_hotel: String(hotelId),
        legal_name: asStr(legal.legalName),
        legal_address: asStr(legal.legalAddress),
        signer_full_name: asStr(contact.contactName),
        signer_phone: asStr(contact.contactPhone),
        signer_email: asStr(contact.contactEmail),
        identity_doc_filename: uploadRes.identity_doc_filename
          ? asStr(uploadRes.identity_doc_filename)
          : legal.identityDocFileName
          ? asStr(legal.identityDocFileName)
          : undefined,
        contract_pdf_filename: uploadRes.contract_pdf_filename
          ? asStr(uploadRes.contract_pdf_filename)
          : legal.businessLicenseFileName
          ? asStr(legal.businessLicenseFileName)
          : undefined,
      };

      const required = [
        "legal_name",
        "legal_address",
        "signer_full_name",
        "signer_phone",
        "signer_email",
      ] as const;
      const missing = required.filter(
        (k) =>
          !payloadContract[k] || (payloadContract[k] as string).trim() === ""
      );
      if (missing.length) {
        message.error("Thiếu dữ liệu: " + missing.join(", "));
        return;
      }
      await updateHotelContract(payloadContract);
      const result = await submitRegistration(hotelId);

      if (result.status === "APPROVED") {
        message.success("Khách sạn đã được duyệt!");
        navigate(`/owner?hotelId=${result.hotelId}`, { replace: true });
      } else {
        message.info("Khách sạn đang được duyệt.");
        navigate("/partner/dashboard", { replace: true });
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("access_token");
      }
    } catch (e: any) {
      const list =
        e?.original?.response?.data?.message || e?.response?.data?.message;
      if (Array.isArray(list)) message.error(list.join("; "));
      else
        message.error(e?.message || e?.original?.message || "Lỗi gửi đăng ký");
    }
  };

  const canOpenContract = !!hotelId;
  return (
    <div className="reg-wizard">
      <div className="rw-header-top">
        <div className="rw-header-left">
          <span className="rw-logo-main">traveloka</span>
          <span className="rw-logo-sub">TERA</span>
        </div>
        <div className="rw-header-mid">
          <div className="rw-info-block">
            <Text type="secondary">Tên cơ sở</Text>{" "}
            <b>{formBasic.getFieldValue("name") || "(Chưa đặt tên)"}</b>
          </div>
          <div className="rw-info-block">
            <Text type="secondary">Mã đăng ký</Text> <b>{code}</b>
          </div>
        </div>
        <div className="rw-header-right">
          <Button type="link">Hỗ trợ ▾</Button>
          <Button type="link">VI ▾</Button>
          <PartnerAvatarDropdown email={userEmail} />
        </div>
      </div>

      <div className="rw-container">
        <Title level={3} className="rw-title">
          Đăng ký cơ sở lưu trú
        </Title>

        <div className="rw-grid">
          <div className="rw-sidebar">
            <div
              className={`rw-main ${activeMain === "OVERVIEW" ? "active" : ""}`}
              onClick={() => setActiveMain("OVERVIEW")}
            >
              <div className="rw-main-head">
                <span>Mục 1: Tổng quan cơ sở lưu trú</span>
              </div>
              <div style={{ marginTop: 10 }}>
                <Button type="primary" onClick={finalizeOverview}>
                  Hoàn tất mục 1
                </Button>
              </div>
            </div>

            <div
              className={`rw-main ${
                activeMain === "CONTRACT" ? "active" : ""
              } ${canOpenContract ? "" : "disabled"}`}
              onClick={() => canOpenContract && setActiveMain("CONTRACT")}
            >
              <div className="rw-main-head">
                <span>Mục 2: Hợp đồng</span>
              </div>
              <div style={{ marginTop: 12 }}>
                <Button
                  type="primary"
                  disabled={!canOpenContract}
                  onClick={submitAll}
                >
                  Gửi đăng ký
                </Button>
              </div>
            </div>
          </div>

          <div className="rw-content">
            {loading && <Card loading style={{ minHeight: 200 }} />}

            {!loading && activeMain === "OVERVIEW" && (
              <>
                <Card className="rw-card">
                  <Title level={4}>Thông tin cơ sở lưu trú</Title>
                  <Form
                    form={formBasic}
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
                          <Input placeholder="VD: Hilton Hanoi Opera" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="star_rating"
                          label="Hạng sao"
                          tooltip="Đánh giá (1-5)"
                        >
                          <Rate allowClear style={{ fontSize: 24 }} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="description" label="Mô tả">
                      <TextArea rows={3} placeholder="Mô tả ngắn..." />
                    </Form.Item>
                  </Form>
                </Card>

                <Card className="rw-card">
                  <Title level={4}>Địa chỉ cơ sở lưu trú</Title>
                  <Form form={formAddress} layout="vertical">
                    <Form.Item name="province_name" hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item name="district_name" hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item name="ward_name" hidden>
                      <Input />
                    </Form.Item>

                    <Form.Item name="address_line" label="Địa chỉ chi tiết">
                      <Input placeholder="Số nhà, đường..." />
                    </Form.Item>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          name="province_id"
                          label="Tỉnh/Thành phố"
                          rules={[
                            { required: true, message: "Chọn tỉnh/thành" },
                          ]}
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
                            onSelect={(_, option: any) => {
                              formAddress.setFieldsValue({
                                province_name: pickName(option?.label),
                              });
                            }}
                            onChange={(value, option: any) => {
                              if (!value) {
                                formAddress.setFieldsValue({
                                  province_name: undefined,
                                  district_id: undefined,
                                  ward_id: undefined,
                                  district_name: undefined,
                                  ward_name: undefined,
                                });
                              }
                            }}
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
                                if (!province_id) return Promise.resolve();
                                if (province_id && !v)
                                  return Promise.reject(
                                    new Error("Chọn quận/huyện")
                                  );
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
                            onSelect={(_, option: any) => {
                              formAddress.setFieldsValue({
                                district_name: pickName(option?.label),
                              });
                            }}
                            onChange={(value) => {
                              if (!value) {
                                formAddress.setFieldsValue({
                                  district_name: undefined,
                                  ward_id: undefined,
                                  ward_name: undefined,
                                });
                              }
                            }}
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
                                if (!district_id) return Promise.resolve();
                                if (district_id && !v)
                                  return Promise.reject(
                                    new Error("Chọn phường/xã")
                                  );
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
                            onSelect={(_, option: any) => {
                              formAddress.setFieldsValue({
                                ward_name: pickName(option?.label),
                              });
                            }}
                            onChange={(value) => {
                              if (!value) {
                                formAddress.setFieldsValue({
                                  ward_name: undefined,
                                });
                              }
                            }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </Card>

                <Card className="rw-card">
                  <Title level={4}>Thông tin liên hệ</Title>
                  <Form form={formContact} layout="vertical">
                    <Form.Item
                      name="contactName"
                      label="Tên người liên hệ"
                      rules={[{ required: true }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="contactEmail"
                      label="Email liên hệ"
                      rules={[{ required: true, type: "email" }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="contactPhone"
                      label="Điện thoại liên hệ"
                      rules={[
                        { required: true },
                        { pattern: /^[0-9]{9,12}$/, message: "Số 9-12 chữ số" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Form>
                </Card>

                <div style={{ textAlign: "right" }}>
                  <Button type="primary" onClick={finalizeOverview}>
                    Hoàn tất mục 1
                  </Button>
                </div>
              </>
            )}

            {!loading && activeMain === "CONTRACT" && (
              <>
                <Card className="rw-card">
                  <Title level={4}>Thông tin pháp nhân + Tài liệu</Title>
                  <Form form={formLegal} layout="vertical">
                    <Form.Item
                      name="legalName"
                      label="Tên pháp nhân hoặc tên cá nhân"
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="Nhập tên pháp nhân/cá nhân" />
                    </Form.Item>
                    <Form.Item
                      name="legalAddress"
                      label="Địa chỉ pháp nhân/cá nhân"
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="Nhập địa chỉ pháp nhân/cá nhân" />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="businessLicenseFileName"
                          label="Hợp đồng (PDF)"
                        >
                          <Upload
                            beforeUpload={(file) => {
                              if (file.type !== "application/pdf") {
                                message.error("Chỉ chấp nhận PDF");
                                return Upload.LIST_IGNORE;
                              }
                              setContractPdfFile(file);
                              formLegal.setFieldsValue({
                                businessLicenseFileName: file.name,
                              });
                              return false;
                            }}
                            maxCount={1}
                            fileList={
                              contractPdfFile
                                ? [
                                    {
                                      uid: "-1",
                                      name: contractPdfFile.name,
                                      status: "done",
                                      size: contractPdfFile.size,
                                    },
                                  ]
                                : []
                            }
                            onRemove={() => {
                              setContractPdfFile(null);
                              formLegal.setFieldsValue({
                                businessLicenseFileName: undefined,
                              });
                            }}
                          >
                            <Button icon={<UploadOutlined />}>Chọn PDF</Button>
                          </Upload>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="identityDocFileName"
                          label="Ảnh CCCD (JPG/PNG)"
                        >
                          <Upload
                            beforeUpload={(file) => {
                              if (
                                !["image/jpeg", "image/png"].includes(file.type)
                              ) {
                                message.error("Chỉ JPG/PNG");
                                return Upload.LIST_IGNORE;
                              }
                              setIdentityDocFile(file);
                              formLegal.setFieldsValue({
                                identityDocFileName: file.name,
                              });
                              return false;
                            }}
                            maxCount={1}
                            fileList={
                              identityDocFile
                                ? [
                                    {
                                      uid: "-2",
                                      name: identityDocFile.name,
                                      status: "done",
                                      size: identityDocFile.size,
                                    },
                                  ]
                                : []
                            }
                            onRemove={() => {
                              setIdentityDocFile(null);
                              formLegal.setFieldsValue({
                                identityDocFileName: undefined,
                              });
                            }}
                          >
                            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                          </Upload>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </Card>

                <Card className="rw-card">
                  <Title level={4}>Điều khoản hợp đồng</Title>
                  <Form
                    form={formTerms}
                    layout="vertical"
                    initialValues={{ acceptTerms: false }}
                  >
                    <Form.Item
                      name="acceptTerms"
                      valuePropName="checked"
                      rules={[
                        {
                          validator: (_, v) =>
                            v
                              ? Promise.resolve()
                              : Promise.reject(
                                  new Error("Cần chấp nhận điều khoản")
                                ),
                        },
                      ]}
                    >
                      <Checkbox>Tôi đã đọc và chấp nhận điều khoản</Checkbox>
                    </Form.Item>
                  </Form>
                </Card>

                <div style={{ textAlign: "right" }}>
                  <Button
                    type="primary"
                    disabled={!canOpenContract}
                    onClick={submitAll}
                  >
                    Gửi đăng ký
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterProperty;
