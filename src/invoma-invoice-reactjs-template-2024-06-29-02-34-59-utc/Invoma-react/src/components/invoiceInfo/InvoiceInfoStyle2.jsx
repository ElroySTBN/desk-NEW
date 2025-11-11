import { currentDate2 } from "../../helper/helper";

export default function InvoiceInfoStyle2({title, grandTotal, id, bg, border, titleColor, subTitleColor}) {
  return (
    <>
      <div className="tm_ternary_color tm_f50 tm_text_uppercase tm_text_center tm_invoice_title tm_mb15 tm_mobile_hide">{title}</div>
      <div className={`tm_grid_row tm_col_3 tm_invoice_info_in ${bg} ${border ? border : ''}`}>
        <div>
          <span className={`${subTitleColor}`}>Invoice No:</span> <br />
          <b className={`tm_f16 ${titleColor}`}>{id}</b>
        </div>
        <div>
          <span className={`${subTitleColor}`}>Invoice Date:</span> <br />
          <b className={`tm_f16 ${titleColor}`}>{currentDate2()}</b>
        </div>
        <div>
          <span className={`${subTitleColor}`}>Grand Total:</span> <br />
          <b className={`tm_f16 ${titleColor}`}>${grandTotal.toFixed(2)}</b>
        </div>
      </div>
    </>
  )
}
