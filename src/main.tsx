import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Layout from "@/layout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import LoginPage from "pages/client/auth/login";
import "styles/global.scss";
import { App, ConfigProvider } from "antd";
import { AppProvider } from "components/context/app.context";

import LayoutAdmin from "components/layout/layout.admin";
import { ProtectedRoute } from "./components/auth";
import { RegisterPage } from "./pages/client/auth/register";
import { BookPage } from "./pages/client/book.page";
import { AboutPage } from "./pages/client/about.page";
import DashBoardPage from "./pages/client/admin/dashboard";
import viVN from "antd/locale/vi_VN";
import { OwnerDashBoard } from "./pages/owner/dashboard/owner.dashboard";
import { BookingList } from "./pages/owner/booking/booking.list";
import { RatePlansPage } from "./pages/owner/price/rate.plans";
import { PriceFlexible } from "./pages/owner/price/price.flexible";
import { OwnerSettings } from "./pages/owner/settings/owner.settings";
import { OwnerReview } from "./pages/owner/dashboard/owner.reviews";
import { RoomSetupPage } from "./pages/owner/property/room.setup";
import { CancellationPolicies } from "./pages/owner/property/cancellation.policies";
import { HotelPolicyViewPage } from "./pages/owner/property/hotel.policy.view";
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
        path: "/hotel/:hotelId",
        element: <HotelDetailPage />,
      },
      {
        path: "/book",
        element: <BookPage />,
      },
      {
        path: "/booking",
        element: <BookingStep1 />,
      },
      {
        path: "/booking/comfirm",
        element: <BookingStep2 />,
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
        path: "/admin",
        element: (
          <ProtectedRoute>
            <div>admin page</div>
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
            <OwnerDashBoard />
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
          { index: true, element: <BookingList /> },
          { path: "calendar", element: <InventoryPage /> },
        ],
      },

      {
        path: "price",
        children: [
          { index: true, element: <RatePlansPage /> },
          { path: "flexible", element: <PriceFlexible /> },
        ],
      },
      {
        path: "property",
        children: [
          { index: true, element: <HotelPolicyViewPage /> },
          { path: "rooms", element: <RoomSetupPage /> },
          { path: "cancellation", element: <CancellationPolicies /> },
        ],
      },

      {
        path: "settings",
        element: <OwnerSettings />,
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
