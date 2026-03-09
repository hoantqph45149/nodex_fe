import Sidebar from "../components/common/Sidebar";
import { Outlet } from "react-router-dom";

export default function SidebarOnlyLayout() {
  return (
    <div className="flex w-full max-w-6xl mx-auto">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
