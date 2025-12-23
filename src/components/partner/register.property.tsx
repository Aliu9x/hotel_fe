import React, { useEffect, useState, useCallback, useRef } from "react";
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
  loadRegistration,
  createEmptyRegistration,
  updateSection,
  markOverviewCompleted,
  deleteRegistration,
  setHotelId,
  setStatus,
  setFileNames,
  type RegistrationBundle,
} from "@/services/partner.segistration.store";
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

const { Title, Text } = Typography;
const { TextArea } = Input;

type StepKey = "OVERVIEW" | "CONTRACT";
type SubOverview = "BASIC_INFO" | "ADDRESS" | "CONTACT";
type SubContract = "LEGAL_ENTITY_INFO" | "TERMS";

const pickName = (label: any) =>
  typeof label === "string" ? label.split(" - ").pop()?.trim() || "" : "";

const RegisterProperty: React.FC = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const userEmail =
    localStorage.getItem("partnerUserEmail") || "partner@example.com";

  const [bundle, setBundle] = useState<RegistrationBundle | null>(null);
  const [loading, setLoading] = useState(true);

  const [formBasic] = Form.useForm();
  const [formAddress] = Form.useForm();
  const [formContact] = Form.useForm();
  const [formLegal] = Form.useForm();
  const [formTerms] = Form.useForm();

  const [activeMain, setActiveMain] = useState<StepKey>("OVERVIEW");
  const [activeSub, setActiveSub] = useState<SubOverview | SubContract>(
    "BASIC_INFO"
  );

  const prevProvinceRef = useRef<number | undefined>(undefined);
  const prevDistrictRef = useRef<number | undefined>(undefined);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const province_id = Form.useWatch("province_id", formAddress);
  const district_id = Form.useWatch("district_id", formAddress);

  const debounceMap = useRef<Record<string, number>>({});

  const [contractPdfFile, setContractPdfFile] = useState<File | null>(null);
  const [identityDocFile, setIdentityDocFile] = useState<File | null>(null);

  const defaultFlags: RegistrationBundle["stepFlags"] = {
    BASIC_INFO: false,
    ADDRESS: false,
    CONTACT: false,
    LEGAL_ENTITY_INFO: false,
    SIGNATORY_INFO: false,
    TERMS: false,
  };

  useEffect(() => {
    if (!code) {
      message.error("Thiếu mã đăng ký");
      navigate("/partner/dashboard");
      return;
    }
    let reg = loadRegistration(code);
    if (!reg) reg = createEmptyRegistration(code);
    setBundle(reg);
    reg.data.basicInfo && formBasic.setFieldsValue(reg.data.basicInfo);
    reg.data.addressInfo && formAddress.setFieldsValue(reg.data.addressInfo);
    reg.data.contactInfo && formContact.setFieldsValue(reg.data.contactInfo);
    reg.data.legalEntity && formLegal.setFieldsValue(reg.data.legalEntity);
    reg.data.terms && formTerms.setFieldsValue(reg.data.terms);
    setLoading(false);
  }, [
    code,
    navigate,
    formBasic,
    formAddress,
    formContact,
    formLegal,
    formTerms,
  ]);

  // Khi quay lại tab ADDRESS, đồng bộ lại form từ bundle để không mất giá trị đã lưu
  useEffect(() => {
    if (
      activeSub === "ADDRESS" &&
      bundle?.data.addressInfo &&
      Object.keys(bundle.data.addressInfo).length
    ) {
      formAddress.setFieldsValue(bundle.data.addressInfo);
    }
  }, [activeSub, bundle, formAddress]);

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

        // Giữ lại district_id nếu còn tồn tại; nếu không, clear kèm district_name/ward
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
  }, [province_id]); // eslint-disable-line

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
  }, [district_id]); // eslint-disable-line

  const autoSave = useCallback(
    (section: string, values: any, flag?: string) => {
      if (!code) return;
      const key = section;
      if (debounceMap.current[key])
        window.clearTimeout(debounceMap.current[key]);
      debounceMap.current[key] = window.setTimeout(() => {
        updateSection(code, section as any, values, flag as any);
        setBundle(loadRegistration(code));
      }, 300);
    },
    [code]
  );

  const onBasicChange = () =>
    autoSave("basicInfo", formBasic.getFieldsValue(true));
  const onAddressChange = () =>
    autoSave("addressInfo", formAddress.getFieldsValue(true));
  const onContactChange = () =>
    autoSave("contactInfo", formContact.getFieldsValue(true));
  const onLegalChange = () =>
    autoSave("legalEntity", formLegal.getFieldsValue(true));
  const onTermsChange = () => autoSave("terms", formTerms.getFieldsValue(true));

  const submitBasic = async () => {
    await formBasic.validateFields();
    updateSection(
      code!,
      "basicInfo",
      formBasic.getFieldsValue(true),
      "BASIC_INFO"
    );
    setBundle(loadRegistration(code!));
    message.success("Đã lưu mục Thông tin cơ sở");
    setActiveSub("ADDRESS");
  };
  const submitAddress = async () => {
    await formAddress.validateFields();
    updateSection(
      code!,
      "addressInfo",
      formAddress.getFieldsValue(true),
      "ADDRESS"
    );
    setBundle(loadRegistration(code!));
    message.success("Đã lưu mục Địa chỉ");
    setActiveSub("CONTACT");
  };
  const submitContact = async () => {
    await formContact.validateFields();
    updateSection(
      code!,
      "contactInfo",
      formContact.getFieldsValue(true),
      "CONTACT"
    );
    setBundle(loadRegistration(code!));
    message.success("Đã lưu mục Thông tin liên hệ");
  };

  const finalizeOverview = async () => {
    if (!code) return;
    try {
      await formBasic.validateFields();
      await formAddress.validateFields();
      await formContact.validateFields();

      const b = formBasic.getFieldsValue(true);
      const a = formAddress.getFieldsValue(true);
      const c = formContact.getFieldsValue(true);

      console.log("[FINALIZE] address form raw =", a);

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

      console.log("[FINALIZE] createHotel payload =", payload);

      const hotel = await createHotel(payload);
      console.log("[FINALIZE] createHotel response =", hotel);

      const hid = hotel?.id ?? hotel?.data?.id;
      if (!hid) {
        message.error("Không nhận được hotel id từ server");
        return;
      }
      setHotelId(code, hid);

      markOverviewCompleted(code);
      updateSection(code, "basicInfo", b);
      updateSection(code, "addressInfo", a);
      setBundle(loadRegistration(code)!);
      message.success("Tạo khách sạn & hoàn tất Mục 1");
      setActiveMain("CONTRACT");
      setActiveSub("LEGAL_ENTITY_INFO");
    } catch (e: any) {
      console.error("[FINALIZE] ERROR =", e);
      const msg = Array.isArray(e?.response?.data?.message)
        ? e.response.data.message.join("; ")
        : e?.message || "Lỗi hoàn tất Mục 1";
      message.error(msg);
    }
  };
  const submitLegal = async () => {
    await formLegal.validateFields();
    updateSection(
      code!,
      "legalEntity",
      formLegal.getFieldsValue(true),
      "LEGAL_ENTITY_INFO"
    );
    setBundle(loadRegistration(code!));
    message.success("Đã lưu Thông tin pháp nhân");
    setActiveSub("TERMS");
  };

  const submitTerms = async () => {
    await formTerms.validateFields();
    updateSection(code!, "terms", formTerms.getFieldsValue(true), "TERMS");
    setBundle(loadRegistration(code!));
    message.success("Đã lưu Điều khoản");
  };

  const submitAll = async () => {
    if (!code) return;
    try {
      await formBasic.validateFields();
      await formAddress.validateFields();
      await formContact.validateFields();
      await formLegal.validateFields();
      await formTerms.validateFields();

      const current = loadRegistration(code);
      const hotelId = current?.meta.hotelId;
      if (!hotelId) {
        message.error("Chưa có hotelId (cần hoàn tất mục 1)");
        return;
      }

      let uploadRes: {
        contract_pdf_filename?: string;
        identity_doc_filename?: string;
      } = {};
      if (contractPdfFile || identityDocFile) {
        uploadRes = await uploadContractFiles(hotelId, {
          contract_pdf: contractPdfFile || null,
          identity_doc: identityDocFile || null,
        });
        console.log("[WZ] FILES response =", uploadRes);
        setFileNames(code, uploadRes);
      }

      const legal = formLegal.getFieldsValue(true);
      const contact = formContact.getFieldsValue(true);
      const filesStore = current?.data.files || {};

      const contractPdfName =
        uploadRes.contract_pdf_filename ||
        filesStore.contract_pdf_filename ||
        legal.businessLicenseFileName ||
        undefined;

      const identityDocName =
        uploadRes.identity_doc_filename ||
        filesStore.identity_doc_filename ||
        legal.identityDocFileName ||
        undefined;

      const asStr = (v: any) =>
        typeof v === "string" ? v.trim() : String(v ?? "").trim();

      const payloadContract = {
        legal_name: asStr(legal.legalName),
        legal_address: asStr(legal.legalAddress),
        signer_full_name: asStr(contact.contactName),
        signer_phone: asStr(contact.contactPhone),
        signer_email: asStr(contact.contactEmail),
        identity_doc_filename: identityDocName
          ? asStr(identityDocName)
          : undefined,
        contract_pdf_filename: contractPdfName
          ? asStr(contractPdfName)
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

      console.log("[WZ] CONTRACT UPDATE payload =", payloadContract);

      await updateHotelContract(hotelId, payloadContract);
      const result = await submitRegistration(hotelId);
      setStatus(code, result.status === "APPROVED" ? "APPROVED" : "PENDING");
      if (result.status === "APPROVED") {
        message.success("Khách sạn đã được duyệt!");
        deleteRegistration(code);
        navigate(`/owner?hotelId=${result.hotelId}`, { replace: true });
      } else {
        message.info("Khách sạn đang được duyệt.");
        deleteRegistration(code);
        navigate("/partner/dashboard", { replace: true });
      }
    } catch (e: any) {
      console.error("[WZ] SUBMIT ALL ERROR", e);
      const list =
        e?.original?.response?.data?.message || e?.response?.data?.message;
      if (Array.isArray(list)) message.error(list.join("; "));
      else
        message.error(e?.message || e?.original?.message || "Lỗi gửi đăng ký");
    }
  };
  const flags = bundle?.stepFlags ?? defaultFlags;
  const overviewComplete =
    flags.BASIC_INFO &&
    flags.ADDRESS &&
    flags.CONTACT &&
    !!bundle?.meta.completedOverview;
  const canOpenContract = !!bundle?.meta.completedOverview;

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
            <b>{bundle?.data.basicInfo?.name || "(Chưa đặt tên)"}</b>
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
          {/* Sidebar */}
          <div className="rw-sidebar">
            <div
              className={`rw-main ${activeMain === "OVERVIEW" ? "active" : ""}`}
              onClick={() => setActiveMain("OVERVIEW")}
            >
              <div className="rw-main-head">
                <span>Tổng quan cơ sở lưu trú</span>
                {overviewComplete && <span className="rw-check">✔</span>}
              </div>
              <ul className="rw-sub-list">
                <li
                  className={activeSub === "BASIC_INFO" ? "active" : ""}
                  onClick={() => setActiveSub("BASIC_INFO")}
                >
                  Thông tin cơ sở{" "}
                  {flags.BASIC_INFO && <span className="rw-check-sm">✔</span>}
                </li>
                <li
                  className={activeSub === "ADDRESS" ? "active" : ""}
                  onClick={() => setActiveSub("ADDRESS")}
                >
                  Địa chỉ{" "}
                  {flags.ADDRESS && <span className="rw-check-sm">✔</span>}
                </li>
                <li
                  className={activeSub === "CONTACT" ? "active" : ""}
                  onClick={() => setActiveSub("CONTACT")}
                >
                  Thông tin liên hệ{" "}
                  {flags.CONTACT && <span className="rw-check-sm">✔</span>}
                </li>
              </ul>
              <div style={{ marginTop: 10 }}>
                <Button
                  type="primary"
                  disabled={
                    !(
                      flags.BASIC_INFO &&
                      flags.ADDRESS &&
                      flags.CONTACT &&
                      !bundle?.meta.completedOverview
                    )
                  }
                  onClick={finalizeOverview}
                >
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
                <span>Hợp đồng</span>
              </div>
              <ul className="rw-sub-list">
                <li
                  className={activeSub === "LEGAL_ENTITY_INFO" ? "active" : ""}
                  onClick={() =>
                    canOpenContract && setActiveSub("LEGAL_ENTITY_INFO")
                  }
                >
                  Thông tin pháp nhân{" "}
                  {flags.LEGAL_ENTITY_INFO && (
                    <span className="rw-check-sm">✔</span>
                  )}
                </li>
                <li
                  className={activeSub === "TERMS" ? "active" : ""}
                  onClick={() => canOpenContract && setActiveSub("TERMS")}
                >
                  Điều khoản hợp đồng{" "}
                  {flags.TERMS && <span className="rw-check-sm">✔</span>}
                </li>
              </ul>
              <div style={{ marginTop: 12 }}>
                <Button
                  type="primary"
                  disabled={!flags.TERMS || !flags.LEGAL_ENTITY_INFO}
                  onClick={submitAll}
                >
                  Gửi đăng ký
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="rw-content">
            {loading && <Card loading style={{ minHeight: 200 }} />}

            {/* BASIC */}
            {!loading &&
              activeMain === "OVERVIEW" &&
              activeSub === "BASIC_INFO" && (
                <Card className="rw-card">
                  <Title level={4}>Thông tin cơ sở lưu trú</Title>
                  <Form
                    form={formBasic}
                    layout="vertical"
                    onValuesChange={onBasicChange}
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
                    <Button type="primary" onClick={submitBasic}>
                      Lưu mục này
                    </Button>
                  </Form>
                </Card>
              )}

            {/* ADDRESS */}
            {!loading &&
              activeMain === "OVERVIEW" &&
              activeSub === "ADDRESS" && (
                <Card className="rw-card">
                  <Title level={4}>Địa chỉ cơ sở lưu trú</Title>
                  <Form
                    form={formAddress}
                    layout="vertical"
                    onValuesChange={onAddressChange}
                  >
                    {/* Hidden fields for names to store alongside IDs */}
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
                                // clear all dependent names + ids
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
                                if (!province_id) return Promise.resolve(); // chưa chọn tỉnh -> cho qua
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
                                if (!district_id) return Promise.resolve(); // chưa chọn quận -> cho qua
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
                    <Button type="primary" onClick={submitAddress}>
                      Lưu mục này
                    </Button>
                  </Form>
                </Card>
              )}

            {/* CONTACT */}
            {!loading &&
              activeMain === "OVERVIEW" &&
              activeSub === "CONTACT" && (
                <Card className="rw-card">
                  <Title level={4}>Thông tin liên hệ</Title>
                  <Form
                    form={formContact}
                    layout="vertical"
                    onValuesChange={onContactChange}
                  >
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
                    <Button type="primary" onClick={submitContact}>
                      Lưu mục này
                    </Button>
                  </Form>
                </Card>
              )}

            {/* LEGAL + FILES */}
            {!loading &&
              activeMain === "CONTRACT" &&
              activeSub === "LEGAL_ENTITY_INFO" && (
                <Card className="rw-card">
                  <Title level={4}>Thông tin pháp nhân + Tài liệu</Title>
                  <Form
                    form={formLegal}
                    layout="vertical"
                    onValuesChange={onLegalChange}
                  >
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

                    <Button type="primary" onClick={submitLegal}>
                      Lưu mục này
                    </Button>
                  </Form>
                </Card>
              )}

            {/* TERMS */}
            {!loading && activeMain === "CONTRACT" && activeSub === "TERMS" && (
              <Card className="rw-card">
                <Title level={4}>Điều khoản hợp đồng</Title>
                <Form
                  form={formTerms}
                  layout="vertical"
                  onValuesChange={onTermsChange}
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
                  <Button type="primary" onClick={submitTerms}>
                    Lưu mục này
                  </Button>
                </Form>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterProperty;
