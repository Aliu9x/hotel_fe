import { Modal, Result } from "antd";
import { useEffect } from "react";

export const PaymentSuccessModal = ({
  open,
  onDone,
}: {
  open: boolean;
  onDone: () => void;
}) => {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      onDone();
    }, 2500); 
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <Modal open={open} footer={null} closable={false} centered>
      <Result
        status="success"
        title="Hoàn tất đặt phòng"
        subTitle="Cảm ơn bạn đã đặt phòng. Đang chuyển hướng..."
      />
    </Modal>
  );
};
