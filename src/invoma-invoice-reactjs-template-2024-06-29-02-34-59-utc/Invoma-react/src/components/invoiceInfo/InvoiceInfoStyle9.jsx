import { currentDate5 } from "../../helper/helper";

export default function InvoiceInfoStyle9({id}) {
  return (
    <div className="tm_invoice_info tm_mb20">
      <div className="tm_invoice_seperator">
        <img src="/images/arrow_bg.svg" alt="" />
      </div>
      <div className="tm_invoice_info_list">
        <p className="tm_invoice_number tm_m0">
          Invoice No: <b className="tm_primary_color">{id}</b>
        </p>
        <p className="tm_invoice_date tm_m0">
          Date: <b className="tm_primary_color">{currentDate5()}</b>
        </p>
        <div className="tm_invoice_info_list_bg tm_accent_bg_10" />
      </div>
    </div>
  )
}
