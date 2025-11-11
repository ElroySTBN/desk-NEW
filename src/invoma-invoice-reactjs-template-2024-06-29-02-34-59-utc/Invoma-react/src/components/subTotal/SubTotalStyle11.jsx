

export default function SubTotalStyle11({subTotal, discountAmount, discountPersent, grandTotal}) {
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
          <td className="tm_width_3 tm_border_none tm_pt0">
            Discount {`${discountPersent}%`}
          </td>
          <td className="tm_width_3 tm_text_right tm_border_none tm_pt0 tm_danger_color">
            - ${discountAmount.toFixed(2)}
          </td>
        </tr>
        <tr>
          <td className="tm_width_3 tm_border_top_0 tm_bold tm_f16 tm_white_color tm_accent_bg tm_radius_6_0_0_6">
            Grand Total
          </td>
          <td className="tm_width_3 tm_border_top_0 tm_bold tm_f16 tm_primary_color tm_text_right tm_white_color tm_accent_bg tm_radius_0_6_6_0">
            ${grandTotal.toFixed(2)}
          </td>
        </tr>
      </tbody>
    </table>
  )
}
