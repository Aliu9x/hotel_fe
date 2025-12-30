import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Layout from "@/layout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import LoginPage from "pages/client/auth/login";
import "styles/global.scss";
import { App, ConfigProvider } from "antd";
import { AppProvider } from "components/context/app.context";

import LayoutAdmin from "components/layout/layout.admin";
import { RegisterPage } from "./pages/client/auth/register";
import { BookPage } from "./pages/client/book.page";
import { AboutPage } from "./pages/client/about.page";
import DashBoardPage from "./pages/client/admin/dashboard";
import viVN from "antd/locale/vi_VN";
import { OwnerDashBoardPage } from "./pages/owner/dashboard/owner.dashboard";
import { RatePlansPage } from "./pages/owner/price/rate.plans";
import { PriceFlexible } from "./pages/owner/price/price.flexible";
import { OwnerReview } from "./pages/owner/dashboard/owner.reviews";
import { RoomSetupPage } from "./pages/owner/property/room.setup.page";
import { CancellationPolicies } from "./pages/owner/property/cancellation.policies";
import { HotelPolicyViewPage } from "./pages/owner/settings/hotel.policy.view.page";
import LayoutOwner from "./components/layout/layout.owner";
import { ManageAmenity } from "./pages/client/admin/manage.amenity";
import ManageHotelPage from "./pages/client/admin/manage.hotel";
import InventoryPage from "./pages/owner/booking/booking.calendar";
import ProvincePage from "./pages/client/admin/manage location/province.page";
import DistrictsPage from "./pages/client/admin/manage location/district.page";
import WardsPage from "./pages/client/admin/manage location/ward.page";
import HomePage from "./pages/client/home.page";
import { SearchResultsPage } from "./pages/client/search.result.page";
import { HotelDetailPage } from "./pages/client/hotel.detail.page";
import BookingStep1 from "./components/booking/BookingStep1";
import BookingStep2 from "./components/booking/BookingStep2";
import LayoutPartner from "./pages/client/partner/partner.layout";
import PartnerDashboard from "./components/partner/partner.dashboard";
import RegisterProperty from "./components/partner/register.property";
import { HotelInfoPage } from "./pages/owner/settings/hotel.info.page";
import { MediaAmenitiesPage } from "./pages/owner/settings/media.amenities.page";
import { CustomersPage } from "./pages/client/admin/manage users/customer.page";
import { OwnerPage } from "./pages/client/admin/manage users/owners.page";
import { ImageModerationPage } from "./pages/client/admin/image.moderation.page";
import { RoomPage } from "./pages/client/admin/manage.room.page";
import { RoomRatePlanPage } from "./pages/client/admin/manage.rate.plans.page";
import Retrieve from "./components/retrieve/retrieve";
import { ProtectedRoute } from "./components/auth";
import { BookingListPage } from "./pages/owner/booking/booking.list";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/search-results",
        element: <SearchResultsPage />,
      },
      {
        path: "/hotel-detail/:hotelId",
        element: <HotelDetailPage />,
      },
      {
        path: "/retrieve",
        element: <Retrieve />,
      },
      {
        path: "/book",
        element: <BookPage />,
      },
      {
        path: "/about",
        element: <AboutPage />,
      },
      {
        path: "/checkout",
        element: (
          <ProtectedRoute>
            <div>checkout page</div>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/booking",
    element: <BookingStep1 />,
  },
  {
    path: "/booking/confirm",
    element: <BookingStep2 />,
  },
  {
    path: "admin",
    element: <LayoutAdmin />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <DashBoardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "amenity",
        element: (
          <ProtectedRoute>
            <ManageAmenity />
          </ProtectedRoute>
        ),
      },
      {
        path: "hotel",
        element: (
          <ProtectedRoute>
            <ManageHotelPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "location/province",
        element: (
          <ProtectedRoute>
            <ProvincePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "location/district",
        element: (
          <ProtectedRoute>
            <DistrictsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "location/ward",
        element: (
          <ProtectedRoute>
            <WardsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "image-moderation",
        element: (
          <ProtectedRoute>
            <ImageModerationPage />
          </ProtectedRoute>
        ),
      },
      //////////////////////////
      {
        path: "image-moderation",
        element: (
          <ProtectedRoute>
            <ImageModerationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "image-moderation",
        element: (
          <ProtectedRoute>
            <ImageModerationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "room-types",
        element: (
          <ProtectedRoute>
            <RoomPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "rate-plans",
        element: (
          <ProtectedRoute>
            <RoomRatePlanPage />
          </ProtectedRoute>
        ),
      },
      //////////////////////////
      {
        path: "user/customer",
        element: (
          <ProtectedRoute>
            <OwnerPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "user/owner",
        element: (
          <ProtectedRoute>
            <CustomersPage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  {
    path: "owner",
    element: <LayoutOwner />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <OwnerDashBoardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "reviews",
        element: (
          <ProtectedRoute>
            <OwnerReview />
          </ProtectedRoute>
        ),
      },
      {
        path: "booking",
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute>
                <BookingListPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "calendar",
            element: (
              <ProtectedRoute>
                <InventoryPage />
              </ProtectedRoute>
            ),
          },
        ],
      },

      {
        path: "price",
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute>
                <RatePlansPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "flexible",
            element: (
              <ProtectedRoute>
                <PriceFlexible />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: "property",
        children: [
          {
            path: "rooms",
            element: (
              <ProtectedRoute>
                <RoomSetupPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "cancellation",
            element: (
              <ProtectedRoute>
                <CancellationPolicies />
              </ProtectedRoute>
            ),
          },
        ],
      },

      {
        path: "settings",
        children: [
          {
            path: "hotel-info",
            element: (
              <ProtectedRoute>
                <HotelInfoPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "media-amenities",
            element: (
              <ProtectedRoute>
                <MediaAmenitiesPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "policy",
            element: (
              <ProtectedRoute>
                <HotelPolicyViewPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },

  {
    path: "partner",
    element: <LayoutPartner />,
    children: [
      {
        index: true,
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",

        element: <RegisterPage />,
      },
    ],
  },
  {
    path: "partner/dashboard",
    element: (
      <ProtectedRoute>
        <PartnerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "partner/register/:code",
    element: (
      <ProtectedRoute>
        <RegisterProperty />
      </ProtectedRoute>
    ),
  },

  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <ConfigProvider locale={viVN}>
        <App>
          <RouterProvider router={router} />
        </App>
      </ConfigProvider>
    </AppProvider>
  </StrictMode>
);
