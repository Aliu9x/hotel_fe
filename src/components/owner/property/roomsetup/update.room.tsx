import {
  commitUpload,
  createAmenityMappings,
  createRoomType,
  getAmenityCategory,
  getAmenityMappings,
  loadImageRoomType,
  updateRoomType,
  uploadFileAPI,
} from "@/services/api";
import { MAX_UPLOAD_IMAGE_SIZE } from "@/services/helper";
import { Folder } from "@/types/file.constants";

import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Row,
  Switch,
  Upload,
  type FormProps,
  type GetProp,
} from "antd";
import type { UploadChangeParam, UploadProps } from "antd/es/upload";
import type { UploadFile } from "antd/lib";
import type { RcFile } from "antd/lib/upload";
import type { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

type FieldType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

type UserUploadType = "thumbnail" | "slider";

interface IProps {
  dataUpdate: IRoomType | null;
  setDataUpdate: (v: IRoomType | null) => void;
  openViewUpdate: boolean;
  setOpenViewUpdate: (v: boolean) => void;
  refreshTable: () => void;
}

export const UpdateRoomType = (props: IProps) => {
  const {
    openViewUpdate,
    setOpenViewUpdate,
    refreshTable,
    dataUpdate,
    setDataUpdate,
  } = props;
  const [form] = Form.useForm();

  const [isSubmit, setIsSubmit] = useState<boolean>();
  const { message, notification } = App.useApp();
  const onClose = () => [
    setOpenViewUpdate(false),
    form.resetFields(),
    setFileListSlider([]),
    setFileListThumbnail([]),
    setSelectedAmenity([]),
    setDataUpdate(null),
  ];

  const [loadingThumbnail, setLoadingThumbnail] = useState<boolean>(false);
  const [loadingSlider, setLoadingSlider] = useState<boolean>(false);

  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>("");

  const [fileListThumbnail, setFileListThumbnail] = useState<UploadFile[]>([]);
  const [fileListSlider, setFileListSlider] = useState<UploadFile[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selectedAmenity, setSelectedAmenity] = useState<string[]>([]);
  const [dataImage, setDataImage] = useState<ILoadImage>();

  const handleCheckboxChange = (id: string) => {
    setSelectedAmenity((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  useEffect(() => {
    const fetchData = async () => {
      const res = await getAmenityCategory("ROOM");
      if (res?.data) setCategories(res.data);
    };

    fetchData();
  }, []);
  const genId = () => (crypto?.randomUUID ? crypto.randomUUID() : uuidv4());

  useEffect(() => {
    if (!dataUpdate?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getAmenityMappings(dataUpdate.id);
        if (!cancelled && res?.data) {
          setCategories(res.data);
        }
        const resImage = await loadImageRoomType(dataUpdate.id);
        if (resImage && !cancelled) {
          setDataImage(resImage.data);

          const baseURL = String(
            import.meta.env.VITE_BACKEND_URL || ""
          ).replace(/\/+$/, "");
          const hotelId = dataUpdate?.hotel_id;
          const roomTypeId = dataUpdate?.id;
          const toUploadItem = (filename: string): UploadFile => ({
            uid: genId(),
            name: filename,
            status: "done",
            url: `${baseURL}/images/hotel/${hotelId}/roomType/${roomTypeId}/${encodeURIComponent(
              filename
            )}`,
          });
          const rawThumb = resImage?.data?.thumbnail;
          const sliderNames = Array.isArray(resImage?.data?.slider)
            ? resImage.data.slider
            : [];

          const safeThumbName =
            typeof rawThumb === "string" ? rawThumb.trim() : "";
          const arrThumbnail: UploadFile[] = safeThumbName
            ? [toUploadItem(safeThumbName)]
            : [];
          const arrSlider: UploadFile[] = sliderNames
            .filter(
              (s): s is string => typeof s === "string" && s.trim().length > 0
            )
            .map((s) => toUploadItem(s.trim()));

          form.setFieldsValue({
            id: dataUpdate.id,
            name: dataUpdate.name,
            description: dataUpdate.description,
            total_rooms: dataUpdate.total_rooms,
            max_adults: dataUpdate.max_adults,
            max_children: dataUpdate.max_children,
            max_occupancy: dataUpdate.max_occupancy,
            bed_config: dataUpdate.bed_config,
            room_size_label: dataUpdate.room_size_label,
            floor_level: dataUpdate.floor_level,
            smoking_allowed: dataUpdate.smoking_allowed,
            view: dataUpdate.view,
            is_active: dataUpdate.is_active,
            thumbnail: arrThumbnail,
            slider: arrSlider,
          });
          setFileListThumbnail(arrThumbnail as any);
          setFileListSlider(arrSlider as any);
        }
      } catch (e) {}
    })();
    return () => {
      cancelled = true;
    };
  }, [dataUpdate?.id]);

  const sliderFiles = fileListSlider.map((f) => ({
    tmpFileName: f.name,
    originalName: f.name,
  }));
  const thumbnailFiles = fileListThumbnail.map((f) => ({
    tmpFileName: f.name,
    originalName: f.name,
  }));

  const onFinish: FormProps<IRoomType>["onFinish"] = async (value) => {
    try {
      setIsSubmit(true);
      const payload = { ...(value as any) };
      delete payload.thumbnail;
      delete payload.slider;
      delete payload.id;
      const res = await updateRoomType(
        dataUpdate!.id,
        payload as Partial<IRoomType>
      );
      if (res.data && res) {
        await createAmenityMappings(res.data.id, selectedAmenity);
        const sliderPayload = {
          folderType: Folder.ROOM_TYPE_SLIDER,
          roomTypeId: dataUpdate?.id,
          files: sliderFiles,
        };
        const thumbnailPayload = {
          folderType: Folder.ROOM_TYPE_THUMBNAIL,
          roomTypeId: dataUpdate?.id,
          files: thumbnailFiles,
        };

        await Promise.all([
          commitUpload(sliderPayload),
          commitUpload(thumbnailPayload),
        ]);

        message.success("Cập nhập loại phòng thành công!");
        onClose();
        refreshTable();
      } else {
        message.error("Không thể cập nhập loại phòng. Vui lòng thử lại!");
      }
    } catch (error) {
      message.error("Đã xảy ra lỗi khi cập nhập loại phòng!");
    } finally {
      setIsSubmit(false);
    }
  };

  const getBase64 = (file: FieldType): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };
  const beforeUpload = (file: FieldType) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < MAX_UPLOAD_IMAGE_SIZE;
    if (!isLt2M) {
      message.error(`Image must smaller than ${MAX_UPLOAD_IMAGE_SIZE}MB!`);
    }
    return (isJpgOrPng && isLt2M) || Upload.LIST_IGNORE;
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange = (
    info: UploadChangeParam,
    type: "thumbnail" | "slider"
  ) => {
    if (info.file.status === "uploading") {
      type === "slider" ? setLoadingSlider(true) : setLoadingThumbnail(true);
      return;
    }

    if (info.file.status === "done") {
      type === "slider" ? setLoadingSlider(false) : setLoadingThumbnail(false);
    }
  };

  const handleRemove = async (file: UploadFile, type: UserUploadType) => {
    if (type === "thumbnail") {
      setFileListThumbnail([]);
    }
    if (type === "slider") {
      const newSlider = fileListSlider.filter((x) => x.uid !== file.uid);
      setFileListSlider(newSlider);
    }
  };
  const handleUploadFile = async (
    options: RcCustomRequestOptions,
    type: UserUploadType
  ) => {
    const { onSuccess } = options;
    const file = options.file as UploadFile;
    try {
      const res = await uploadFileAPI(file, "book");
      if (res?.data) {
        const uploadedFile: UploadFile = {
          uid: file.uid,
          name: res.data.fileUploaded,
          url: `${import.meta.env.VITE_BACKEND_URL}/images/tmp/${
            res.data.fileUploaded
          }`,
        };
        if (type === "thumbnail") {
          setFileListThumbnail([uploadedFile]);
        } else {
          setFileListSlider((prev) => [...prev, uploadedFile]);
        }
        onSuccess?.("ok");
      } else {
        message.error(res?.message || "Upload thất bại");
        onSuccess?.("error");
      }
    } catch (e) {
      message.error("Lỗi mạng khi upload");
      onSuccess?.("error");
    }
  };

  const normFile = (e: any) => (Array.isArray(e) ? e : e?.fileList || []);
  return (
    <>
      <Modal
        open={openViewUpdate}
        onOk={() => form.submit()}
        onCancel={onClose}
        confirmLoading={isSubmit}
        okButtonProps={{ loading: isSubmit }}
        maskClosable={false}
        footer={null}
        width={1000}
      >
        <Form
          initialValues={{ thumbnail: [], slider: [] }}
          layout="vertical"
          form={form}
          onFinish={onFinish}
          autoComplete="off"
          style={{
            maxHeight: "70vh",
            overflowY: "auto",
            paddingRight: 12,
          }}
        >
          <Divider orientation="left">Thông tin chung</Divider>
          <Row gutter={16}>
            <Form.Item label="id" name="id" hidden></Form.Item>
            <Col span={12}>
              <Form.Item
                label="Tên loại phòng"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên loại phòng" },
                ]}
              >
                <Input placeholder="VD: Phòng Deluxe Hướng Biển" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Số lượng phòng" name="total_rooms">
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  placeholder="VD: 10"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea
              rows={3}
              placeholder="Nhập mô tả ngắn gọn về loại phòng..."
            />
          </Form.Item>

          <Divider orientation="left">Sức chứa</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Người lớn tối đa"
                name="max_adults"
                rules={[
                  { required: true, message: "Nhập số người lớn tối đa" },
                ]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Trẻ em tối đa"
                name="max_children"
                rules={[{ required: true, message: "Nhập số trẻ em tối đa" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Tổng số khách tối đa"
                name="max_occupancy"
                rules={[
                  { required: true, message: "Nhập tổng số khách tối đa" },
                ]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Cấu hình phòng</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Cấu hình giường" name="bed_config">
                <Input placeholder="VD: 1 giường đôi hoặc 2 giường đơn" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Diện tích phòng" name="room_size_label">
                <Input placeholder="VD: 35 m²" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Tầng" name="floor_level">
                <Input placeholder="VD: Tầng 3" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Hướng nhìn" name="view">
                <Input placeholder="VD: Hướng biển / Hướng vườn" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Cho phép hút thuốc"
                name="smoking_allowed"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch checkedChildren="Có" unCheckedChildren="Không" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Trạng thái"
                name="is_active"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch
                  checkedChildren="Hoạt động"
                  unCheckedChildren="Tạm đóng"
                />
              </Form.Item>
            </Col>
          </Row>
          <Divider orientation="left">Tiện ích loại phòng</Divider>
          {categories.map((cat) => (
            <Card key={String(cat.id)} style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 10 }}>{cat.name_category}</h3>
              <Row gutter={[16, 16]}>
                {(cat.amenities ?? []).map((item) => {
                  const idStr = String(item.id);
                  return (
                    <Col span={8} key={idStr}>
                      <Checkbox
                        checked={selectedAmenity.includes(idStr)}
                        onChange={() => handleCheckboxChange(idStr)}
                      >
                        {item.name}
                      </Checkbox>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          ))}

          <Divider orientation="left">Tải ảnh lên</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item<UserUploadType>
                name="thumbnail"
                labelCol={{ span: 24 }}
                label="Ảnh bìa"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tải ảnh bìa",
                  },
                ]}
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload
                  listType="picture-card"
                  className="avatar-uploader"
                  maxCount={1}
                  multiple={false}
                  customRequest={(options) =>
                    handleUploadFile(options, "thumbnail")
                  }
                  beforeUpload={beforeUpload}
                  onChange={(info) => handleChange(info, "thumbnail")}
                  onPreview={handlePreview}
                  onRemove={(file) => handleRemove(file, "thumbnail")}
                >
                  <div>
                    {loadingThumbnail ? <LoadingOutlined /> : <PlusOutlined />}
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item<UserUploadType>
                name="slider"
                labelCol={{ span: 24 }}
                label="Ảnh không gian"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tải ảnh không gian!",
                  },
                ]}
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload
                  multiple
                  listType="picture-card"
                  className="avatar-uploader"
                  customRequest={(options) =>
                    handleUploadFile(options, "slider")
                  }
                  beforeUpload={beforeUpload}
                  onChange={(info) => handleChange(info, "slider")}
                  onRemove={(file) => handleRemove(file, "slider")}
                  onPreview={handlePreview}
                >
                  <div>
                    {loadingSlider ? <LoadingOutlined /> : <PlusOutlined />}
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="right">---</Divider>
          <div style={{ textAlign: "right" }}>
            <Button onClick={onClose} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={isSubmit}>
              cập nhập
            </Button>
          </div>
        </Form>
      </Modal>
      <Image
        style={{ display: "none" }}
        preview={{
          visible: previewOpen,
          src: previewImage,
          onVisibleChange: (v) => setPreviewOpen(v),
        }}
      />
    </>
  );
};
