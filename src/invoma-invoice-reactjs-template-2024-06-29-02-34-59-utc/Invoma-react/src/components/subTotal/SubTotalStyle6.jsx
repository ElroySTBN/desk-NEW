
export default function SubTotalStyle6({subTotal, taxPersent, taxAmount, grandTotal}) {
  return (
    <table>
      <tbody>
        <tr className="tm_border_left tm_border_right tm_accent_border_20">
          <td className="tm_width_3 tm_primary_color tm_accent_border_20 tm_border_none tm_bold">
            Subtoal
          </td>
          <td className="tm_width_3 tm_primary_color tm_accent_border_20 tm_text_right tm_border_none tm_bold">${subTotal.toFixed(2)}</td>
        </tr>
        <tr className="tm_border_left tm_border_right tm_accent_border_20">
          <td className="tm_width_3 tm_primary_color tm_accent_border_20">
            Tax <span className="tm_ternary_color">{`(${taxPersent}%)`}</span>
          </td>
          <td className="tm_width_3 tm_primary_color tm_accent_border_20 tm_text_right">+ ${taxAmount.toFixed(2)}</td>
        </tr>
        <tr className="tm_border_bottom tm_border_left tm_border_right tm_accent_border_20 tm_accent_bg">
          <td className="tm_width_3 tm_bold tm_f16 tm_white_color tm_accent_border_20">
            Grand Total
          </td>
          <td className="tm_width_3 tm_bold tm_f16 tm_white_color tm_accent_border_20 tm_text_right">${grandTotal.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  )
}
