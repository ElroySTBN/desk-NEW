import { currentDate3 } from "../../helper/helper";

export default function InvoiceInfoStyle7({title, id}) {
  return (
    <div className="tm_flex tm_flex_column_sm tm_justify_between tm_align_center tm_align_start_sm tm_f14 tm_white_color tm_accent_bg tm_medium tm_padd_8_20 tm_mb25">
      <p className="tm_m0">Date: {currentDate3()}</p>
      <p className="tm_m0 tm_f18 tm_bold">{title}</p>
      <p className="tm_m0">Serial No: {id}</p>
    </div>
  )
}
