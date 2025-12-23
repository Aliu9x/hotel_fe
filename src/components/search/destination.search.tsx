import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
} from "react";
import ReactDOM from "react-dom";
import { App, Input } from "antd";
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

export interface DestinationSearchRef {
  isValid: () => boolean;
  getSelected: () => {
    destination: string;
    context: IDestinationContext;
  } | null;
  validateBeforeSearch: () =>
    | { ok: true; destination: string; context: IDestinationContext }
    | { ok: false };
}

interface DestinationSearchProps {
  initialValue?: string;
  onSelectionChange?: (
    destination: string,
    context: IDestinationContext
  ) => void;
  // Thông báo invalid tuỳ biến (nếu muốn xử lý ngoài)
  onInvalidSearchMessage?: (msg: string) => void;
  className?: string;
}

const USE_PORTAL = true;

const DestinationSearch = React.forwardRef<
  DestinationSearchRef,
  DestinationSearchProps
>(
  (
    { initialValue = "", onSelectionChange, onInvalidSearchMessage, className },
    ref
  ) => {
    const [destination, setDestination] = useState(initialValue);
    const [suggests, setSuggests] = useState<ISuggestItem[]>([]);
    const { message } = App.useApp();
    const [openSuggest, setOpenSuggest] = useState(false);
    const [loadingSuggest, setLoadingSuggest] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const debounceRef = useRef<number | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const interactingWithDropdown = useRef(false);
    const [dropdownPos, setDropdownPos] = useState<{
      left: number;
      top: number;
      width: number;
    }>({ left: 0, top: 0, width: 0 });

    const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
    const flattenedSuggestsRef = useRef<ISuggestItem[]>([]);

    // Trạng thái hợp lệ: CHỈ true khi người dùng CHỌN (click/enter) từ gợi ý
    const [isValidSelection, setIsValidSelection] = useState(false);
    const lastSelectedRef = useRef<{
      label: string;
      context: IDestinationContext;
    } | null>(null);

    useImperativeHandle(ref, () => ({
      isValid: () => isValidSelection,
      getSelected: () =>
        lastSelectedRef.current
          ? {
              destination: lastSelectedRef.current.label,
              context: lastSelectedRef.current.context,
            }
          : null,
      validateBeforeSearch: () => {
        if (isValidSelection && lastSelectedRef.current) {
          return {
            ok: true,
            destination: lastSelectedRef.current.label,
            context: lastSelectedRef.current.context,
          };
        }
        const msg = "hãy nhập thêm thông tin để tìm kiếm chính xác hơn";
        if (onInvalidSearchMessage) onInvalidSearchMessage(msg);
        else message.warning(msg);
        // mở gợi ý để hướng người dùng chọn
        if (!openSuggest) fetchSuggest(destination);
        return { ok: false };
      },
    }));

    const updateDropdownPosition = useCallback(() => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const left = rect.left + window.scrollX + 18;
      const top = rect.top + window.scrollY + rect.height + 4;
      const width = Math.max(180, rect.width - 36);
      setDropdownPos({ left, top, width });
    }, []);

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
    }, [openSuggest, updateDropdownPosition]);

    useEffect(() => {
      return () => {
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        if (abortRef.current) abortRef.current.abort();
      };
    }, []);

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

      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setLoadingSuggest(true);
      try {
        const data = await suggestSearch(q, 12, {
          signal: controller.signal,
        } as any);
        if (controller.signal.aborted) return;
        const items = Array.isArray(data) ? data : data ?? [];
        setSuggests(items);
        setOpenSuggest(true);
        if (USE_PORTAL) updateDropdownPosition();

        flattenedSuggestsRef.current = items;
        setHighlightIndex(items.length ? 0 : null);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setSuggests([]);
        setOpenSuggest(true);
        if (USE_PORTAL) updateDropdownPosition();
      } finally {
        setLoadingSuggest(false);
      }
    };

    const scheduleFetch = (val: string) => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        fetchSuggest(val);
        debounceRef.current = null;
      }, 300);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setDestination(val);
      scheduleFetch(val);
      // Gõ tay => không còn hợp lệ
      if (isValidSelection) setIsValidSelection(false);
      // vẫn cho cha biết text đang nhập (nếu cần)
      onSelectionChange?.(val, {});
    };

    const handleSelectSuggest = (it: ISuggestItem) => {
      const ctx: IDestinationContext = {
        type: it.type,
        province_id: it.province_id,
        district_id: it.district_id,
        ward_id: it.ward_id,
        hotel_id: it.type === "hotel" ? (it as any).hotel_id : undefined,
        hierarchy: it.hierarchy,
        full_path: it.full_path,
      };
      setDestination(it.label);
      lastSelectedRef.current = { label: it.label, context: ctx };
      setIsValidSelection(true);
      setOpenSuggest(false);
      onSelectionChange?.(it.label, ctx);
    };

    // tránh đóng dropdown khi click vào dropdown
    const onDropdownMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      interactingWithDropdown.current = true;
    };
    const onDropdownMouseUp = () => {
      setTimeout(() => (interactingWithDropdown.current = false), 0);
    };

    const handleInputBlur = () => {
      setTimeout(() => {
        if (!interactingWithDropdown.current) setOpenSuggest(false);
      }, 0);
    };

    const handleInputFocus = () => {
      if (destination) fetchSuggest(destination);
      else {
        setOpenSuggest(true);
        if (USE_PORTAL) updateDropdownPosition();
      }
    };

    const grouped = React.useMemo(() => {
      const g: Record<string, ISuggestItem[]> = {};
      suggests.forEach((it) => {
        g[it.category] = g[it.category] || [];
        g[it.category].push(it);
      });
      return g;
    }, [suggests]);

    // Điều hướng phím + hành vi Enter:
    // - Nếu dropdown mở và có item => Enter sẽ CHỌN gợi ý (hợp lệ).
    // - Nếu không có lựa chọn hợp lệ => chặn submit và cảnh báo.
    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const flat = flattenedSuggestsRef.current;

      if (e.key === "Enter") {
        if (openSuggest && flat.length) {
          e.preventDefault();
          const idx = highlightIndex ?? 0;
          const item = flat[idx];
          if (item) handleSelectSuggest(item);
          return;
        }
        if (!isValidSelection) {
          e.preventDefault();
          const msg = "hãy nhập thêm thông tin để tìm kiếm chính xác hơn";
          if (onInvalidSearchMessage) onInvalidSearchMessage(msg);
          else message.warning(msg);
          if (!openSuggest) fetchSuggest(destination);
          return;
        }
        // valid => cho phép form submit
      }

      if (!openSuggest || !flat.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((prev) => {
          if (prev == null) return 0;
          return Math.min(flat.length - 1, prev + 1);
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((prev) => {
          if (prev == null) return flat.length - 1;
          return Math.max(0, prev - 1);
        });
      } else if (e.key === "Escape") {
        setOpenSuggest(false);
      }
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
        onMouseDown={onDropdownMouseDown}
        onMouseUp={onDropdownMouseUp}
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
                {list.map((it) => {
                  const flatIndex = flattenedSuggestsRef.current.findIndex(
                    (x) => x.id === it.id && x.type === it.type
                  );
                  const isHighlighted = flatIndex === highlightIndex;
                  return (
                    <div
                      key={`${it.type}-${it.id}`}
                      style={{
                        padding: "10px 16px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        borderBottom: "1px solid #f5f5f5",
                        background: isHighlighted ? "#eef7ff" : "transparent",
                      }}
                      onClick={() => handleSelectSuggest(it)}
                      onMouseEnter={() => {
                        const idx = flattenedSuggestsRef.current.findIndex(
                          (x) => x.id === it.id && x.type === it.type
                        );
                        if (idx >= 0) setHighlightIndex(idx);
                      }}
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
                  );
                })}
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
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={onKeyDown}
            allowClear
            aria-invalid={!!destination && !isValidSelection}
            style={{
              fontSize: 15,
              fontWeight: 500,
              padding: 0,
              color: "#333",
              boxShadow:
                destination && !isValidSelection
                  ? "inset 0 -2px 0 0 rgba(255,0,0,0.35)"
                  : "none",
            }}
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
  }
);

DestinationSearch.displayName = "DestinationSearch";
export default DestinationSearch;
