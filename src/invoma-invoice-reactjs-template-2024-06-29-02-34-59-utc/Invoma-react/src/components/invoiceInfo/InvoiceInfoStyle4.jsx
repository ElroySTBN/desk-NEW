import { currentDate2 } from "../../helper/helper";

export default function InvoiceInfoStyle4({title, id, grandTotal}) {
  return (
    <div className="tm_invoice_info_right">
      <div className="tm_f50 tm_text_uppercase tm_text_center tm_invoice_title tm_mb15 tm_ternary_color tm_mobile_hide">{title}</div>
      <div className="tm_grid_row tm_col_3 tm_invoice_info_in tm_round_border tm_gray_bg">
        <div>
          <span>Invoice No:</span> <br />
          <b className="tm_f18 tm_accent_color">{id}</b>
        </div>
        <div>
          <span>Invoice Date:</span> <br />
          <b className="tm_f18 tm_accent_color">{currentDate2()}</b>
        </div>
        <div>
          <span>Grand Total:</span> <br />
          <b className="tm_f18 tm_accent_color">${grandTotal.toFixed(2)}</b>
        </div>
      </div>
    </div>
  )
}
