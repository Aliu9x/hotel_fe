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
import { HomePage } from "./pages/client/home.page";
import { BookPage } from "./pages/client/book.page";
import { AboutPage } from "./pages/client/about.page";
import DashBoardPage from "./pages/client/admin/dashboard";
import ManageBookPage from "./pages/client/admin/manage.book";
import ManageOrderPage from "./pages/client/admin/manage.order";
import ManageUserPage from "./pages/client/admin/manage.user";
import viVN from "antd/locale/vi_VN";
import { OwnerDashBoard } from "./pages/owner/dashboard/owner.dashboard";
import { BookingList } from "./pages/owner/booking/booking.list";
import { BookingCalendar } from "./pages/owner/booking/booking.calendar";
import { PriceDaily } from "./pages/owner/price/price.daily";
import { PriceFlexible } from "./pages/owner/price/price.flexible";
import { OwnerSettings } from "./pages/owner/settings/owner.settings";
import { OwnerReview } from "./pages/owner/dashboard/owner.reviews";
import { RoomSetup } from "./pages/owner/property/room.setup";
import { CancellationPolicies } from "./pages/owner/property/cancellation.policies";
import { PageHotelPolicyView } from "./pages/owner/property/hotel.policy.view";

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
        path: "book",
        element: (
          <ProtectedRoute>
            <ManageBookPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "order",
        element: (
          <ProtectedRoute>
            <ManageOrderPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "user",
        element: (
          <ProtectedRoute>
            <ManageUserPage />
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
    element: <LayoutAdmin />,
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
          { path: "calendar", element: <BookingCalendar /> },
        ],
      },

      {
        path: "price",
        children: [
          { index: true, element: <PriceDaily /> },
          { path: "flexible", element: <PriceFlexible /> },
        ],
      },
      {
        path: "property",
        children: [
          { index: true, element: <PageHotelPolicyView /> },
          { path: "rooms", element: <RoomSetup /> },
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
    <App>
      <AppProvider>
        <ConfigProvider locale={viVN}>
          <RouterProvider router={router} />
        </ConfigProvider>
      </AppProvider>
    </App>
  </StrictMode>
);
