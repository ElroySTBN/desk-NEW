
export default function SubTotalStyle4({subTotal, taxPersent, taxAmount, grandTotal}) {
  return (
    <table>
      <tbody>
        <tr>
          <td className="tm_width_3 tm_primary_color tm_border_none tm_bold">
            Subtoal
          </td>
          <td className="tm_width_3 tm_primary_color tm_text_right tm_border_none tm_bold">${subTotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td className="tm_width_3 tm_primary_color">
            Tax <span className="tm_ternary_color">{`(${taxPersent}%)`}</span>
          </td>
          <td className="tm_width_3 tm_primary_color tm_text_right">+ ${taxAmount}</td>
        </tr>
        <tr className="tm_border_bottom tm_accent_bg_10">
          <td className="tm_width_3 tm_bold tm_f16 tm_accent_color">
            Grand Total
          </td>
          <td className="tm_width_3 tm_bold tm_f16 tm_accent_color tm_text_right">${grandTotal.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  )
}
