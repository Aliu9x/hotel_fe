export {};

declare global {
  interface IBackendRes<T> {
    error?: string | string[];
    message: string;
    statusCode: number | string;
    data?: T;
  }

  interface IModelPaginate<T> {
    meta: {
      page: number;
      limit: number;
      pages: number;
      total: number;
    };
    result: T[];
  }
  interface ILogin {
    access_token: string;
    user: IUser;
  }
  interface IUser {
    email: string;
    phone: string;
    fullName: string;
    role: string;
    avatar: string;
    id: string;
  }

  interface IFetchAccount {
    user: IUser;
  }

  interface IUserTable {
    _id: string;
    email: string;
    phone: string;
    fullName: string;
    role: string;
    avatar: string;
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  // ////////////////////////////////////////////////

  interface IRoomType {
    id: string;
    hotel_id: string;
    name: string;
    description?: string | null;
    total_rooms?: number | null;
    max_adults: number;
    max_children: number;
    max_occupancy: number;
    bed_config?: string | null;
    room_size_label?: string | null;
    floor_level?: string | null;
    smoking_allowed: boolean;
    view?: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }

  interface ICommitFile {
    tmpFileName: string;
    originalName?: string;
  }

  interface ICommitUpload {
    folderType: FolderType;
    hotelId?: string;
    roomTypeId?: string;
    userId?: string;
    files: ICommitFile[];
  }

  interface IAmenity {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
  }

  interface ICategory {
    id: string;
    name_category: string;
    applies_to: "Hotel" | "RoomType" | "Both";
    is_active: boolean;
    amenities: IAmenity[];
  }
   interface IHotelPolicy {
  hotel_id?: string;
  default_checkin_time?: string;
  default_checkout_time?: string;
  house_rules?: string;
  children_policy?: string;
  smoking_policy?: string;
  pets_policy?: string;
  other_policies?: string;
}

interface ILoadImage{
  thumbnail:string
  slider: string[];
}

}
