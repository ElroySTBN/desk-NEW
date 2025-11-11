import { currentDate } from "../../helper/helper";

export default function InvoiceInfoStyle3({id}) {
  return (
    <div className="tm_invoice_info_list tm_white_color">
      <p className="tm_invoice_number tm_m0">
        Invoice No: <b>#{id}</b>
      </p>
      <p className="tm_invoice_date tm_m0">
        Date: <b>{currentDate()}</b>
      </p>
    </div>
  )
}
