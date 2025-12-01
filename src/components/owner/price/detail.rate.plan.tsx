import { Drawer, Descriptions, Tag } from 'antd';

interface IProps {
  open: boolean;
  onClose: () => void;
  data: IRatePlan | null;
  roomTypeNameMap?: Record<string, string>;
}

const DetailRatePlan = ({ open, onClose, data, roomTypeNameMap }: IProps) => {
  if (!data) return null;

  const typeMap: Record<RatePlanType, { color: string; text: string }> = {
    REFUNDABLE: { color: 'green', text: 'Hoàn/Hủy linh hoạt' },
    NON_REFUNDABLE: { color: 'red', text: 'Không hoàn hủy' },
    SEMI_FLEX: { color: 'orange', text: 'Bán linh hoạt' },
  };

  const mealMap: Record<string, string> = {
    NONE: 'Không',
    BREAKFAST: 'Bữa sáng',
    HALF_BOARD: 'Bữa sáng + Bữa tối',
    FULL_BOARD: '3 bữa',
  };

  return (
    <Drawer
      title={`Chi tiết gói giá #${data.id}`}
      placement="right"
      width="50vw"
      open={open}
      onClose={onClose}
    >
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Tên gói giá">{data.name}</Descriptions.Item>
        <Descriptions.Item label="Loại phòng">
          {roomTypeNameMap?.[data.room_type_id] || data.room_type_id}
        </Descriptions.Item>
        <Descriptions.Item label="Giá (VND)">
          {Number(data.price_amount).toLocaleString('vi-VN')}
        </Descriptions.Item>
        <Descriptions.Item label="Loại hoàn/hủy">
          <Tag color={typeMap[data.type].color}>{typeMap[data.type].text}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Gói bữa ăn">
          {mealMap[data.meal_plan || 'NONE'] || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Số khách">
          Cơ bản: {data.base_occupancy} / Tối đa: {data.max_occupancy}
        </Descriptions.Item>
        <Descriptions.Item label="Phụ thu người lớn">
          {Number(data.extra_adult_fee).toLocaleString('vi-VN')}
        </Descriptions.Item>
        <Descriptions.Item label="Phụ thu trẻ em">
          {Number(data.extra_child_fee).toLocaleString('vi-VN')}
        </Descriptions.Item>
        <Descriptions.Item label="Yêu cầu thanh toán trước">
          {data.prepayment_required ? 'Có' : 'Không'}
        </Descriptions.Item>
        <Descriptions.Item label="Mô tả">
          {data.description || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Tạo lúc">
          {data.created_at}
        </Descriptions.Item>
        <Descriptions.Item label="Cập nhật lúc">
          {data.updated_at}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};

export default DetailRatePlan;