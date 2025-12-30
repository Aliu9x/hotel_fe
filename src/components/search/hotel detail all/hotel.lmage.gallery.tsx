import React, { useMemo, useState } from "react";
import { Image } from "antd";

type Props = { hotelImage?: any };

const HotelImageGallery: React.FC<Props> = ({ hotelImage }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [current, setCurrent] = useState(0);

  const baseUrl = import.meta.env.VITE_BACKEND_URL as string;

  const imageUrls = useMemo(
    () => hotelImage.map((f: any) => `${baseUrl}/images/hotel/${f}`),
    [hotelImage, baseUrl]
  );

  const visibleTiles = imageUrls.slice(0, Math.min(7, imageUrls.length));

  const openPreview = (index: number) => {
    setCurrent(index);
    setPreviewVisible(true);
  };

  if (imageUrls.length === 0) return null;

  return (
    <div className="hotel-gallery">
      <div className="gallery-grid">
        {visibleTiles.map((url: any, idx: any) => {
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
        {imageUrls.map((u: any) => (
          <Image key={u} src={u} style={{ display: "none" }} />
        ))}
      </Image.PreviewGroup>
    </div>
  );
};

export default HotelImageGallery;
