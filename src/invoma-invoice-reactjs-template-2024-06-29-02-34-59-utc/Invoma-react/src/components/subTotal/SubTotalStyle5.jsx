
export default function SubTotalStyle5({subTotal, discountAmount, discountPersent, taxPersent, taxAmount, grandTotal}) {
  return (
    <table className="tm_mb15">
      <tbody>
        <tr>
          <td className="tm_width_3 tm_primary_color tm_border_none tm_medium">
            Subtoal
          </td>
          <td className="tm_width_3 tm_primary_color tm_text_right tm_border_none tm_medium">${subTotal.toFixed(2)}</td>
        </tr>
        <tr>
          {discountPersent === 0 ? '' : <td className="tm_width_3 tm_danger_color tm_border_none tm_pt0"> Discount {`${discountPersent}%`}</td>}
          {discountAmount && <td className="tm_width_3 tm_danger_color tm_text_right tm_border_none tm_pt0">- ${discountAmount.toFixed(2)}</td>}
        </tr>
        <tr>
          <td className="tm_width_3 tm_primary_color tm_border_none tm_pt0">
            Tax {`${taxPersent}%`}
          </td>
          <td className="tm_width_3 tm_primary_color tm_text_right tm_border_none tm_pt0">+ ${taxAmount.toFixed(2)}</td>
        </tr>
        <tr className="tm_accent_border_20 tm_border">
          <td className="tm_width_3 tm_bold tm_f16 tm_border_top_0 tm_accent_color tm_accent_bg_10">
            Grand Total
          </td>
          <td className="tm_width_3 tm_bold tm_f16 tm_border_top_0 tm_accent_color tm_text_right tm_accent_bg_10">${grandTotal.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  )
}
