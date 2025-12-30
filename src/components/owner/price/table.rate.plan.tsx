import { ProTable, type ProColumns, type ActionType } from '@ant-design/pro-components';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Tag, Tooltip, Modal, message } from 'antd';
import { PlusOutlined, EyeTwoTone, EditTwoTone, DeleteTwoTone } from '@ant-design/icons';
import { deleteRatePlan, getRatePlans, getRoomType } from '@/services/api';
import CreateRatePlan from './create.rate.plan';
import UpdateRatePlan from './update.rate.plan';
import DetailRatePlan from './detail.rate.plan';

type TSearch = {
  name?: string;
  room_type_id?: string;
};

const TableRatePlan = () => {
  const actionRef = useRef<ActionType>(undefined);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [current, setCurrent] = useState<IRatePlan | null>(null);
  const [roomTypes, setRoomTypes] = useState<IRoomType[]>([]);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      const qs = new URLSearchParams();
      try {
        const res = await getRoomType(qs.toString());
        setRoomTypes(res.data?.result || []);
      } catch {
      }
    };
    fetchRoomTypes();
  }, []);

  const roomTypeNameMap = useMemo(
    () =>
      roomTypes.reduce<Record<string, string>>((acc, rt) => {
        acc[rt.id] = rt.name;
        return acc;
      }, {}),
    [roomTypes],
  );

  const handleDelete = (record: IRatePlan) => {
    Modal.confirm({
      title: 'Xóa gói giá',
      content: `Bạn có chắc muốn xóa gói giá "${record.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      centered: true,
      onOk: async () => {
        try {
          await deleteRatePlan(record.id);
          message.success('Đã xóa thành công');
          actionRef.current?.reload();
        } catch (e: any) {
          message.error(e?.response?.data?.message || 'Xóa thất bại');
        }
      },
    });
  };

  const columns: ProColumns<IRatePlan>[] = [
    { title: 'ID', dataIndex: 'id', width: 70, hideInSearch: true },
    {
      title: 'Tên gói giá',
      dataIndex: 'name',
      fieldProps: { placeholder: 'Tìm theo tên gói giá' },
      copyable: true,
    },
    {
      title: 'Loại phòng',
      dataIndex: 'room_type_id',
      valueType: 'select',
      valueEnum: roomTypes.reduce<Record<string, { text: string }>>((acc, rt) => {
        acc[rt.id] = { text: rt.name };
        return acc;
      }, {}),
      render: (_, r) => roomTypeNameMap[r.room_type_id] || r.room_type_id,
    },
    {
      title: 'Giá (VND)',
      dataIndex: 'price_amount',
      hideInSearch: true,
      render: (_, r) => Number(r.price_amount).toLocaleString('vi-VN'),
    },
 
 
    {
      title: 'Số khách (Cơ bản/Tối đa)',
      dataIndex: 'base_occupancy',
      hideInSearch: true,
      render: (_, r) => `${r.base_occupancy}/${r.max_occupancy}`,
    },
    {
      title: 'Thanh toán trước',
      dataIndex: 'prepayment_required',
      hideInSearch: true,
      render: (_, r) => (r.prepayment_required ? 'Có' : 'Không'),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      width: 160,
      hideInSearch: true,
      sorter: true,
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 150,
      render: (_, record) => [
        <Tooltip title="Xem chi tiết" key="view">
          <EyeTwoTone
            onClick={() => {
              setCurrent(record);
              setOpenDetail(true);
            }}
          />
        </Tooltip>,
        <Tooltip title="Chỉnh sửa" key="edit">
          <EditTwoTone
            twoToneColor="#f57800"
            onClick={() => {
              setCurrent(record);
              setOpenUpdate(true);
            }}
          />
        </Tooltip>,
        <Tooltip title="Xóa" key="delete">
          <DeleteTwoTone twoToneColor="#ff4d4f" onClick={() => handleDelete(record)} />
        </Tooltip>,
      ],
    },
  ];

  return (
    <>
      <ProTable<IRatePlan, TSearch>
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 110 }}
        request={async (params, sort) => {
          const query: IListRatePlanParams = {
            page: params.current || 1,
            limit: params.pageSize || 10,
            q: params.name as string,
            room_type_id: params.room_type_id as string,
          };
          if (sort && sort.created_at) {
            query.orderBy = 'created_at';
            query.order = sort.created_at === 'ascend' ? 'ASC' : 'DESC';
          }
          const res = await getRatePlans(query);
          const data = res.data;
          if (!data) return { data: [], success: false, total: 0 };
          return {
            data: data.result,
            success: true,
            total: data.meta.total,
          };
        }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        headerTitle="Danh sách gói giá"
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpenCreate(true)}
          >
            Thêm gói giá
          </Button>,
        ]}
      />

      <CreateRatePlan
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={() => actionRef.current?.reload()}
        roomTypes={roomTypes}
      />

      <UpdateRatePlan
        open={openUpdate}
        data={current}
        onClose={() => {
          setOpenUpdate(false);
          setCurrent(null);
        }}
        onSuccess={() => actionRef.current?.reload()}
        roomTypes={roomTypes}
      />

      <DetailRatePlan
        open={openDetail}
        data={current}
        onClose={() => {
          setOpenDetail(false);
          setCurrent(null);
        }}
        roomTypeNameMap={roomTypeNameMap}
      />
    </>
  );
};

export default TableRatePlan;