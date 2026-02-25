import { createBrowserRouter } from "react-router";
import ReportsListPage from "./pages/ReportsListPage";
import ReportEditorPage from "./pages/ReportEditorPage";
import ReportPreviewPage from "./pages/ReportPreviewPage";
import StatisticsPage from "./pages/StatisticsPage";
import { ReportsWithLayout } from "./pages/ReportsWithLayout";
import { StatisticsWithLayout } from "./pages/StatisticsWithLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: ReportsWithLayout,
  },
  {
    path: "/reports",
    Component: ReportsWithLayout,
  },
  {
    path: "/statistics",
    Component: StatisticsWithLayout,
  },
  {
    path: "/reports/new",
    Component: ReportEditorPage,
  },
  {
    path: "/reports/:id/edit",
    Component: ReportEditorPage,
  },
  {
    path: "/reports/:id/preview",
    Component: ReportPreviewPage,
  },
  {
    path: "*",
    Component: ReportsWithLayout,
  },
]);