import { currentDate2 } from "../../helper/helper";

export default function InvoiceInfoStyle5({title, id}) {
  return (
    <div className="tm_flex tm_flex_column_sm tm_justify_between tm_align_center tm_align_start_sm tm_f14 tm_primary_color tm_medium tm_mb5">
      <p className="tm_m0 tm_f18 tm_bold">{title}</p>
      <p className="tm_m0">Invoice Date: {currentDate2()}</p>
      <p className="tm_m0">Invoice No: {id}</p>
    </div>
  )
}
