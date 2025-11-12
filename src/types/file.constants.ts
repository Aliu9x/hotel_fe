export const Folder = {
  AVATAR: "AVATAR",
  HOTEL_THUMBNAIL: "HOTEL_THUMBNAIL",
  HOTEL_SLIDER: "HOTEL_SLIDER",
  ROOM_TYPE_THUMBNAIL: "ROOM_TYPE_THUMBNAIL",
  ROOM_TYPE_SLIDER: "ROOM_TYPE_SLIDER",
} as const;

export type FolderType = (typeof Folder)[keyof typeof Folder];
