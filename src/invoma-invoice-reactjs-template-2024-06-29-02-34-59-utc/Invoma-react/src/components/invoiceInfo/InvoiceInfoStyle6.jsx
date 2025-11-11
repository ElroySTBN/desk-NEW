import { currentDate3 } from "../../helper/helper";

export default function InvoiceInfoStyle6({id, total}) {
  return (
    <div className="tm_invoice_info tm_mb30 tm_align_center">
      <div className="tm_invoice_info_left tm_mb20_md">
        <p className="tm_mb0">
          <b className="tm_primary_color">Invoice No: </b>{id} <br />
          <b className="tm_primary_color">Invoice Date: </b> {currentDate3()}
        </p>
      </div>
      <div className="tm_invoice_info_right">
        <div className="tm_border tm_accent_border_20 tm_radius_0 tm_accent_bg_10 tm_curve_35 tm_text_center">
          <div>
            <b className="tm_accent_color tm_f26 tm_medium tm_body_lineheight">
              Total: $ {total.toFixed(2)}
            </b>
          </div>
        </div>
      </div>
    </div>
  )
}
