import React, { useEffect, useMemo, useState } from "react";
import { Image, Skeleton } from "antd";
import { loadloadImageByHotel } from "@/services/api";

type Props = { hotelId?: number };

const HotelImageGallery: React.FC<Props> = ({ hotelId }) => {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [current, setCurrent] = useState(0);

  const baseUrl = import.meta.env.VITE_BACKEND_URL as string;

  useEffect(() => {
    if (!hotelId) return;
    setLoading(true);
    loadloadImageByHotel(String(hotelId))
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data : res.data?.data;
        const list = Array.isArray(raw) ? raw : [];
        setFiles(list.filter(Boolean));
      })
      .catch((err) => {
        console.error("loadloadImageByHotel error:", err);
        setFiles([]);
      })
      .finally(() => setLoading(false));
  }, [hotelId]);

  const imageUrls = useMemo(
    () => files.map((f) => `${baseUrl}/images/hotel/${f}`),
    [files, baseUrl]
  );

  const visibleTiles = imageUrls.slice(0, Math.min(7, imageUrls.length));

  const openPreview = (index: number) => {
    setCurrent(index);
    setPreviewVisible(true);
  };

  if (!hotelId) return null;

  if (loading) {
    return (
      <div className="hotel-gallery">
        <Skeleton.Image
          active
          style={{ width: "100%", height: 260, borderRadius: 16 }}
        />
      </div>
    );
  }

  if (imageUrls.length === 0) return null;

  return (
    <div className="hotel-gallery">
      <div className="gallery-grid">
        {visibleTiles.map((url, idx) => {
          const isCover = idx === 0;
          const isShowAllTile = imageUrls.length > 7 && idx === 6;
          const restCount = imageUrls.length - 7;

          return (
            <button
              key={url + idx}
              type="button"
              className={`gallery-tile ${isCover ? "cover" : ""}`}
              onClick={() => openPreview(idx)}
              aria-label={isCover ? "Ảnh bìa khách sạn" : `Ảnh ${idx + 1}`}
            >
              <img
                src={url}
                alt={isCover ? "Ảnh bìa khách sạn" : `Ảnh ${idx + 1}`}
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://via.placeholder.com/800x600?text=No+Image";
                }}
              />
              {isShowAllTile && (
                <span className="show-all-overlay">
                  Xem tất cả hình ảnh{restCount > 0 ? ` (+${restCount})` : ""}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Image.PreviewGroup
        preview={{
          visible: previewVisible,
          current,
          onVisibleChange: (v) => setPreviewVisible(v),
          onChange: (idx) => setCurrent(idx),
        }}
      >
        {imageUrls.map((u) => (
          <Image key={u} src={u} style={{ display: "none" }} />
        ))}
      </Image.PreviewGroup>
    </div>
  );
};

export default HotelImageGallery;