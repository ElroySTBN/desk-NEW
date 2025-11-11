import { Outlet } from "react-router-dom";

export default function LayoutStyle2() {
  return (
    <div className='tm_dark_invoice_body'>
      <div className="tm_container">
        <div className="tm_invoice_wrap">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
