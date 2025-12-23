import React, { useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Image,
  Row,
  Space,
  Upload,
  Typography,
  Tag,
} from "antd";
import {
  LoadingOutlined,
  PlusOutlined,
  EditOutlined,
  SaveOutlined,
  RollbackOutlined,
  PictureOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/lib";
import type { RcFile } from "antd/lib/upload";
import type { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";

import {
  getAmenityCategory,
  getAmenityMappingsHotel,
  createAmenityMappings,
  uploadFileAPI,
  commitUpload,
  loadImageHotel,
} from "@/services/api";
import { Folder } from "@/types/file.constants";
import { MAX_UPLOAD_IMAGE_SIZE } from "@/services/helper";

const { Title, Text } = Typography;

type UserUploadType = "thumbnail" | "slider";
type FieldType = RcFile;

type ICategory = {
  id: string | number;
  name_category: string;
  amenities?: Array<{ id: string | number; name: string }>;
};

const HOTEL_SLIDER_MAX = 20;

const MediaAmenities: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const [isEditing, setIsEditing] = useState(false);

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selectedAmenity, setSelectedAmenity] = useState<string[]>([]);

  const [fileListThumbnail, setFileListThumbnail] = useState<UploadFile[]>([]);
  const [fileListSlider, setFileListSlider] = useState<UploadFile[]>([]);
  const [loadingThumb, setLoadingThumb] = useState(false);
  const [loadingSlider, setLoadingSlider] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const resCatalog = await getAmenityCategory("Hotel");
        if (resCatalog?.data) setCategories(resCatalog.data);
      } catch {
        message.error("Không tải được danh mục tiện ích khách sạn");
      }
    })();
  }, [message]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAmenityMappingsHotel();
        if (res?.data) {
          const selectedIds: string[] = [];
          for (const cat of res.data as any[]) {
            const amenities = Array.isArray(cat?.amenities)
              ? cat.amenities
              : [];
            for (const a of amenities) {
              const idStr = String(a?.amenity_id ?? a?.id ?? "").trim();
              if (idStr) selectedIds.push(idStr);
            }
          }
          setSelectedAmenity(Array.from(new Set(selectedIds)));
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await loadImageHotel();

        const thumb =
          typeof res.data?.thumbnail === "string"
            ? res.data.thumbnail.trim()
            : "";
        const sliderNames: string[] = Array.isArray(res.data?.slider)
          ? res.data.slider
          : [];

        const toUploadItem = (filename: string): UploadFile => ({
          uid: filename,
          name: filename,
          status: "done",
          url: `${
            import.meta.env.VITE_BACKEND_URL
          }/images/hotel/${encodeURIComponent(filename)}`,
        });

        const arrThumbnail: UploadFile[] = thumb ? [toUploadItem(thumb)] : [];
        const arrSlider: UploadFile[] = sliderNames
          .filter(
            (s): s is string => typeof s === "string" && s.trim().length > 0
          )
          .map((s) => toUploadItem(s.trim()));

        if (!cancelled) {
          setFileListThumbnail(arrThumbnail);
          setFileListSlider(arrSlider);
          form.setFieldsValue({
            thumbnail: arrThumbnail,
            slider: arrSlider,
          });

          const hasImageData = arrThumbnail.length + arrSlider.length > 0;
          setIsEditing(!hasImageData);
        }
      } catch {
        setFileListThumbnail([]);
        setFileListSlider([]);
        form.setFieldsValue({ thumbnail: [], slider: [] });
        setIsEditing(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const handleCheckboxChange = (id: string) => {
    if (!isEditing) return;
    setSelectedAmenity((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const beforeUpload = (file: FieldType) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Chỉ cho phép JPG/PNG!");
    }
    const isLtMax = file.size / 1024 / 1024 < MAX_UPLOAD_IMAGE_SIZE;
    if (!isLtMax) {
      message.error(`Ảnh phải nhỏ hơn ${MAX_UPLOAD_IMAGE_SIZE}MB!`);
    }
    return (isJpgOrPng && isLtMax) || Upload.LIST_IGNORE;
  };

  const handleUploadFile = async (
    options: RcCustomRequestOptions,
    type: UserUploadType
  ) => {
    const { onSuccess, onError } = options;
    const file = options.file as RcFile;

    if (!isEditing) {
      onError?.(new Error("Not editing"));
      return;
    }

    type === "slider" ? setLoadingSlider(true) : setLoadingThumb(true);

    try {
      const res = await uploadFileAPI(file, "book");
      if (res?.data) {
        const uploadedFile: UploadFile = {
          uid: (file as any).uid,
          name: res.data.fileUploaded,
          status: "done",
          url: `${import.meta.env.VITE_BACKEND_URL}/images/tmp/${
            res.data.fileUploaded
          }`,
        };

        if (type === "thumbnail") {
          const next = [uploadedFile];
          setFileListThumbnail(next);
          form.setFieldsValue({ thumbnail: next });
        } else {
          const nextCount = fileListSlider.length + 5;
          if (nextCount > HOTEL_SLIDER_MAX) {
            message.error(`Ảnh không gian tối đa ${HOTEL_SLIDER_MAX} ảnh`);
          } else {
            const next = [...fileListSlider, uploadedFile];
            setFileListSlider(next);
            form.setFieldsValue({ slider: next });
          }
        }
        onSuccess?.("ok");
      } else {
        message.error(res?.message || "Upload thất bại");
        onError?.(new Error(res?.message || "Upload thất bại"));
      }
    } catch (e) {
      message.error("Lỗi mạng khi upload");
      onError?.(e as any);
    } finally {
      type === "slider" ? setLoadingSlider(false) : setLoadingThumb(false);
    }
  };

  const handleRemove = async (file: UploadFile, type: UserUploadType) => {
    if (!isEditing) return;
    if (type === "thumbnail") {
      setFileListThumbnail([]);
      form.setFieldsValue({ thumbnail: [] });
    }
    if (type === "slider") {
      const newSlider = fileListSlider.filter((x) => x.uid !== file.uid);
      setFileListSlider(newSlider);
      form.setFieldsValue({ slider: newSlider });
    }
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview && file.originFileObj) {
      const reader = new FileReader();
      reader.readAsDataURL(file.originFileObj as RcFile);
      file.preview = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const thumbnailFiles = useMemo(
    () =>
      fileListThumbnail.map((f) => ({
        tmpFileName: f.name,
        originalName: f.name,
      })),
    [fileListThumbnail]
  );

  const sliderFiles = useMemo(
    () =>
      fileListSlider.map((f) => ({
        tmpFileName: f.name,
        originalName: f.name,
      })),
    [fileListSlider]
  );

  const hasAnyImage = fileListThumbnail.length > 0 || fileListSlider.length > 0;

  const toggleEdit = () => setIsEditing((prev) => !prev);

  const onSubmit = async () => {
    try {
      await createAmenityMappings(undefined as any, selectedAmenity);

      if (thumbnailFiles.length !== 1) {
        message.error("Ảnh bìa khách sạn phải có đúng 1 ảnh");
        return;
      }
      if (sliderFiles.length < 1) {
        message.error("Ảnh không gian khách sạn phải có ít nhất 1 ảnh");
        return;
      }
      if (sliderFiles.length > HOTEL_SLIDER_MAX) {
        message.error(`Ảnh không gian tối đa ${HOTEL_SLIDER_MAX} ảnh`);
        return;
      }

      const jobs: Promise<any>[] = [
        commitUpload({ folderType: Folder.HOTEL_SLIDER, files: sliderFiles }),
        commitUpload({
          folderType: Folder.HOTEL_THUMBNAIL,
          files: thumbnailFiles,
        }),
      ];
      await Promise.all(jobs);

      message.success("Đã lưu tiện ích và ảnh khách sạn");
      setIsEditing(false);
    } catch (e: any) {
      message.error(e?.message || "Lưu dữ liệu thất bại");
    }
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
              Tiện ích & Hình ảnh khách sạn
            </Title>
            <Text type="secondary">
              Quản lý media và tiện ích cho khách sạn
            </Text>
          </div>
          <Space>
            {!isEditing ? (
              <Button icon={<EditOutlined />} onClick={toggleEdit}>
                {hasAnyImage ? "Chỉnh sửa" : "Tạo mới"}
              </Button>
            ) : (
              <>
                <Button icon={<RollbackOutlined />} onClick={toggleEdit}>
                  Hủy
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={onSubmit}
                >
                  {hasAnyImage ? "Lưu" : "Tạo mới dữ liệu"}
                </Button>
              </>
            )}
          </Space>
        </Space>
      </Card>

      <Card
        title={
          <Space>
            <PictureOutlined />
            <span>Hình ảnh khách sạn</span>
            {!isEditing && <Tag>Chế độ xem</Tag>}
          </Space>
        }
        bodyStyle={{ paddingTop: 12 }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ thumbnail: [], slider: [] }}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Divider orientation="left">Ảnh bìa khách sạn</Divider>
              <Form.Item
                name="thumbnail"
                valuePropName="fileList"
                getValueFromEvent={(e) =>
                  Array.isArray(e) ? e : e?.fileList || []
                }
              >
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  multiple={false}
                  customRequest={(opt) => handleUploadFile(opt, "thumbnail")}
                  beforeUpload={beforeUpload}
                  onChange={(info) => {
                    if (!isEditing) return;
                    if (info.file.status === "uploading") setLoadingThumb(true);
                    if (
                      info.file.status === "done" ||
                      info.file.status === "error" ||
                      info.file.status === "removed"
                    )
                      setLoadingThumb(false);
                  }}
                  onPreview={handlePreview}
                  onRemove={(file) => handleRemove(file, "thumbnail")}
                  fileList={fileListThumbnail}
                  disabled={!isEditing}
                >
                  {isEditing && (
                    <div>
                      {loadingThumb ? <LoadingOutlined /> : <PlusOutlined />}
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Divider orientation="left">Ảnh không gian khách sạn</Divider>
              <Form.Item
                name="slider"
                valuePropName="fileList"
                getValueFromEvent={(e) =>
                  Array.isArray(e) ? e : e?.fileList || []
                }
              >
                <Upload
                  listType="picture-card"
                  multiple
                  customRequest={(opt) => handleUploadFile(opt, "slider")}
                  beforeUpload={beforeUpload}
                  onChange={(info) => {
                    if (!isEditing) return;
                    if (info.file.status === "uploading")
                      setLoadingSlider(true);
                    if (
                      info.file.status === "done" ||
                      info.file.status === "error" ||
                      info.file.status === "removed"
                    )
                      setLoadingSlider(false);
                  }}
                  onPreview={handlePreview}
                  onRemove={(file) => handleRemove(file, "slider")}
                  fileList={fileListSlider}
                  disabled={!isEditing}
                >
                  {isEditing && (
                    <div>
                      {loadingSlider ? <LoadingOutlined /> : <PlusOutlined />}
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        style={{ marginTop: 16 }}
        title={
          <Space>
            <AppstoreOutlined />
            <span>Tiện ích khách sạn</span>
            {!isEditing && <Tag>Chế độ xem</Tag>}
          </Space>
        }
        bodyStyle={{ paddingTop: 12 }}
      >
        {categories.length === 0 ? (
          <div>Đang tải danh mục tiện ích…</div>
        ) : (
          categories.map((cat) => (
            <Card
              key={String(cat.id)}
              size="small"
              style={{ marginBottom: 16 }}
            >
              <b>{cat.name_category}</b>
              <Row gutter={[16, 12]} style={{ marginTop: 8 }}>
                {(cat.amenities ?? []).map((a) => {
                  const idStr = String(a.id);
                  const checked = selectedAmenity.includes(idStr);
                  return (
                    <Col span={8} key={idStr}>
                      <Checkbox
                        checked={checked}
                        onChange={() => handleCheckboxChange(idStr)}
                        disabled={!isEditing}
                      >
                        {a.name}
                      </Checkbox>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          ))
        )}
      </Card>
      <Image
        style={{ display: "none" }}
        preview={{
          visible: previewOpen,
          src: previewImage,
          onVisibleChange: (v) => setPreviewOpen(v),
        }}
      />
    </div>
  );
};

export default MediaAmenities;
