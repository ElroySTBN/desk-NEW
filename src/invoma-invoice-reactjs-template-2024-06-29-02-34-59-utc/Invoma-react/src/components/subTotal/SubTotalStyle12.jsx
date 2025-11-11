
export default function SubTotalStyle12({subTotal, taxPersent, taxAmount, grandTotal}) {
  return (
    <table className="tm_mb15">
      <tbody>
        <tr>
          <td className="tm_width_3 tm_primary_color tm_bold">Subtoal</td>
          <td className="tm_width_3 tm_primary_color tm_bold tm_text_right">${subTotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td className="tm_width_3 tm_primary_color">
            Tax <span className="tm_ternary_color">{`(${taxPersent}%)`}</span>
          </td>
          <td className="tm_width_3 tm_primary_color tm_text_right">+ ${taxAmount.toFixed(2)}</td>
        </tr>
        <tr className="tm_accent_bg_20">
          <td className="tm_width_3 tm_border_top_0 tm_bold tm_f16 tm_accent_color">
            Grand Total
          </td>
          <td className="tm_width_3 tm_border_top_0 tm_bold tm_f16 tm_accent_color tm_text_right">${grandTotal.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  )
}
