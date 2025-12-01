import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { Input } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import type { ISuggestItem } from "@/types/global";
import { suggestSearch } from "@/services/api";

export interface IDestinationContext {
  type?: ISuggestItem["type"];
  province_id?: number;
  district_id?: number;
  ward_id?: number;
  hotel_id?: string | number;
  hierarchy?: any;
  full_path?: string[];
}

interface DestinationSearchProps {
  initialValue?: string;
  onSelectionChange?: (
    destination: string,
    context: IDestinationContext
  ) => void;
  className?: string;
}
const USE_PORTAL = true;

const DestinationSearch: React.FC<DestinationSearchProps> = ({
  initialValue = "",
  onSelectionChange,
  className,
}) => {
  const [destination, setDestination] = useState(initialValue);
  const [suggests, setSuggests] = useState<ISuggestItem[]>([]);
  const [openSuggest, setOpenSuggest] = useState(false);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    left: number;
    top: number;
    width: number;
  }>({
    left: 0,
    top: 0,
    width: 0,
  });

  const updateDropdownPosition = () => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const left = rect.left + window.scrollX + 18;
    const top = rect.top + window.scrollY + rect.height + 4;
    const width = Math.max(180, rect.width - 36);
    setDropdownPos({ left, top, width });
  };

  useEffect(() => {
    if (!openSuggest || !USE_PORTAL) return;
    updateDropdownPosition();
    const onScrollOrResize = () => updateDropdownPosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [openSuggest]);

  const fetchSuggest = async (val: string) => {
    const q = val.trim();
    if (!q) {
      setSuggests([]);
      setOpenSuggest(false);
      return;
    }
    if (q.length < 2) {
      setSuggests([]);
      setOpenSuggest(true);
      if (USE_PORTAL) updateDropdownPosition();
      return;
    }
    setLoadingSuggest(true);
    try {
      const data = await suggestSearch(q, 12);
      const items = Array.isArray(data) ? data : data ?? [];
      setSuggests(items);
      setOpenSuggest(true);
      if (USE_PORTAL) updateDropdownPosition();
    } catch {
      setSuggests([]);
      setOpenSuggest(true);
      if (USE_PORTAL) updateDropdownPosition();
    } finally {
      setLoadingSuggest(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDestination(val);
    if (debounceTimer) clearTimeout(debounceTimer);
    const t = setTimeout(() => fetchSuggest(val), 300);
    setDebounceTimer(t);
    onSelectionChange?.(val, {});
  };

  const handleSelectSuggest = (it: ISuggestItem) => {
    setDestination(it.label);
    setOpenSuggest(false);
    onSelectionChange?.(it.label, {
      type: it.type,
      province_id: it.province_id,
      district_id: it.district_id,
      ward_id: it.ward_id,
      hotel_id: it.type === "hotel" ? it.hotel_id : undefined,
      hierarchy: it.hierarchy,
      full_path: it.full_path,
    });
  };

  const DropdownBox = (
    <div
      style={{
        background: "#fff",
        boxShadow: "0 8px 22px rgba(0,0,0,0.18)",
        borderRadius: 10,
        marginTop: 0,
        zIndex: 2000,
        maxHeight: 420,
        overflowY: "auto",
        border: "1px solid #e4e4e4",
        width: USE_PORTAL ? dropdownPos.width : undefined,
      }}
      onMouseDown={(e) => e.preventDefault()}
      className="ds-dropdown"
    >
      <div
        style={{
          padding: "10px 16px",
          fontSize: 13,
          fontWeight: 600,
          color: "#555",
          borderBottom: "1px solid #f2f2f2",
          position: "sticky",
          top: 0,
          background: "#fff",
          zIndex: 1,
        }}
      >
        {destination.trim().length < 2
          ? "Nhập thêm ký tự để nhận kết quả chính xác hơn"
          : loadingSuggest
          ? "Đang tải..."
          : "Kết quả tìm kiếm"}
      </div>

      {!loadingSuggest &&
        destination.trim().length >= 2 &&
        suggests.length === 0 && (
          <div style={{ padding: "14px 16px", fontSize: 13, color: "#666" }}>
            Không tìm thấy kết quả phù hợp
          </div>
        )}

      {!loadingSuggest &&
        suggests.length > 0 &&
        (() => {
          const grouped: Record<string, ISuggestItem[]> = {};
          suggests.forEach((it) => {
            grouped[it.category] = grouped[it.category] || [];
            grouped[it.category].push(it);
          });
          return Object.entries(grouped).map(([cat, list]) => (
            <div key={cat}>
              <div
                style={{
                  padding: "6px 16px",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "#888",
                  background: "#fafafa",
                }}
              >
                {cat}
              </div>
              {list.map((it) => (
                <div
                  key={`${it.type}-${it.id}`}
                  style={{
                    padding: "10px 16px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    borderBottom: "1px solid #f5f5f5",
                  }}
                  onClick={() => handleSelectSuggest(it)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f7fbff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        fontSize: 14,
                        lineHeight: "18px",
                        fontWeight: 600,
                      }}
                    >
                      <span style={{ marginRight: 6 }}>{it.icon}</span>
                      {it.label_parts.map((p, i) => (
                        <span
                          key={i}
                          style={{
                            color: p.matched ? "#0071f2" : "#333",
                            fontWeight: p.matched ? 700 : 600,
                          }}
                        >
                          {p.text}
                        </span>
                      ))}
                    </div>
                    <span
                      style={{
                        border: `1px solid ${it.badge_color}`,
                        color: it.badge_color,
                        background: "#fff",
                        borderRadius: 16,
                        padding: "2px 10px",
                        fontSize: 11,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {it.badge}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#555",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 4,
                    }}
                  >
                    {it.hierarchy?.ward && (
                      <span
                        style={{
                          background: "#eef5ff",
                          padding: "2px 6px",
                          borderRadius: 4,
                        }}
                      >
                        {it.hierarchy.ward.name}
                      </span>
                    )}
                    {it.hierarchy?.district && (
                      <span
                        style={{
                          background: "#eef9f1",
                          padding: "2px 6px",
                          borderRadius: 4,
                        }}
                      >
                        {it.hierarchy.district.name}
                      </span>
                    )}
                    {it.hierarchy?.province && (
                      <span
                        style={{
                          background: "#f6eeff",
                          padding: "2px 6px",
                          borderRadius: 4,
                        }}
                      >
                        {it.hierarchy.province.name}
                      </span>
                    )}
                  </div>
                  {it.type === "hotel" && it.subtitle && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "#666",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={it.subtitle}
                    >
                      {it.subtitle}
                    </div>
                  )}
                  {it.type !== "hotel" &&
                    it.full_path &&
                    it.full_path.length > 1 && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "#777",
                          fontStyle: "italic",
                        }}
                      >
                        {it.full_path.join(" • ")}
                      </div>
                    )}
                </div>
              ))}
            </div>
          ));
        })()}
    </div>
  );

  return (
    <div
      style={{ position: "relative" }}
      ref={containerRef}
      className={className}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "14px 20px",
          minHeight: 56,
        }}
      >
        <EnvironmentOutlined
          style={{ color: "#0071f2", fontSize: 22, marginRight: 12 }}
        />
        <Input
          bordered={false}
          placeholder="Thành phố, địa điểm hoặc tên khách sạn"
          value={destination}
          onChange={handleChange}
          onFocus={() => {
            if (destination) fetchSuggest(destination);
            else {
              setOpenSuggest(true);
              if (USE_PORTAL) updateDropdownPosition();
            }
          }}
          onBlur={() => setTimeout(() => setOpenSuggest(false), 180)}
          allowClear
          style={{ fontSize: 15, fontWeight: 500, padding: 0, color: "#333" }}
        />
      </div>

      {!USE_PORTAL && openSuggest && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 18,
            right: 18,
            background: "#fff",
            boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
            borderRadius: 10,
            marginTop: 4,
            zIndex: 1000,
            maxHeight: 420,
            overflowY: "auto",
            border: "1px solid #e4e4e4",
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {DropdownBox.props.children}
        </div>
      )}

      {USE_PORTAL &&
        openSuggest &&
        ReactDOM.createPortal(
          <div
            style={{
              position: "absolute",
              left: dropdownPos.left,
              top: dropdownPos.top,
            }}
          >
            {DropdownBox}
          </div>,
          document.body
        )}
    </div>
  );
};

export default DestinationSearch;
