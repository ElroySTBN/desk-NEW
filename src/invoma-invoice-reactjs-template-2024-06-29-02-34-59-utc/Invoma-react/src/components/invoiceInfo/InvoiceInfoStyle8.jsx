import { currentDate5 } from "../../helper/helper";

export default function InvoiceInfoStyle8({id}) {
  return (
    <div className="tm_invoice_info tm_mb20">
      <div className="tm_invoice_info_list">
        <p className="tm_invoice_date tm_m0">
          Date: <b className="tm_primary_color">{currentDate5()}</b>
        </p>
        <p className="tm_invoice_number tm_m0">
          Invoice No: <b className="tm_primary_color">{id}</b>
        </p>
      </div>
    </div>
  )
}
