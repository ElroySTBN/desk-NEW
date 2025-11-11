

export default function SubTotalStyle7({subTotal, discountPersent, discountAmount, taxPersent, taxAmount, grandTotal}) {
  return (
    <table>
      <tbody>
        <tr className="tm_gray_bg tm_border_top tm_border_left tm_border_right">
          <td className="tm_width_3 tm_primary_color tm_border_none tm_bold">
            Subtoal
          </td>
          <td className="tm_width_3 tm_primary_color tm_text_right tm_border_none tm_bold">
            ${subTotal.toFixed(2)}
          </td>
        </tr>
        <tr className="tm_gray_bg tm_border_left tm_border_right">
          <td className="tm_width_3 tm_primary_color tm_border_none tm_pt0">
            Discount <span className="tm_ternary_color">{`(${discountPersent}%)`}</span>
          </td>
          <td className="tm_width_3 tm_text_right tm_border_none tm_pt0 tm_danger_color">
            - ${discountAmount.toFixed(2)}
          </td>
        </tr>
        <tr className="tm_gray_bg tm_border_left tm_border_right">
          <td className="tm_width_3 tm_primary_color tm_border_none tm_pt0">
            Tax <span className="tm_ternary_color">{`(${taxPersent}%)`}</span>
          </td>
          <td className="tm_width_3 tm_primary_color tm_text_right tm_border_none tm_pt0">
            + ${taxAmount.toFixed(2)}
          </td>
        </tr>
        <tr className="tm_border_top tm_gray_bg tm_border_left tm_border_right">
          <td className="tm_width_3 tm_border_top_0 tm_bold tm_f16 tm_primary_color">
            Grand Total
          </td>
          <td className="tm_width_3 tm_border_top_0 tm_bold tm_f16 tm_primary_color tm_text_right">
            ${grandTotal.toFixed(2)}
          </td>
        </tr>
      </tbody>
    </table>
  )
}
