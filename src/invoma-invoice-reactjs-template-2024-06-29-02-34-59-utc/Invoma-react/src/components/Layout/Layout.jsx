import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="tm_container">
      <div className="tm_invoice_wrap">
        <Outlet />
      </div>
    </div>
  )
}