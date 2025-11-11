import { currentDate4 } from "../../helper/helper";
import parser from 'html-react-parser';

export default function InvoiceToPayToStyle4({title, address, contact, total, paymentMethod}) {
  return (
    <div className="tm_padd_20 tm_border tm_accent_border_20 tm_mb25">
      <p className="tm_primary_color tm_mb2 tm_f16 tm_bold">{title}</p>
      <div className="tm_grid_row tm_col_3 tm_align_center">
        <div className="tm_border_right tm_accent_border_20 tm_border_none_sm">{parser(address)}</div>
        <div className="tm_border_right tm_accent_border_20 tm_border_none_sm">{parser(contact)}</div>
        <div>
          Date: {currentDate4()} <br />
          Total: <b className="tm_primary_color">${total.toFixed(2)}</b> <br />
          Payment Method: {paymentMethod}
        </div>
      </div>
    </div>
  )
}
