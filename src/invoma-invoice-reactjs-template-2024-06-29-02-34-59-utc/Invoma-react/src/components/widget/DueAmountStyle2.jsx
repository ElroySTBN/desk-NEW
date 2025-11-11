
export default function DueAmountStyle2({totalAmount, paidAmount, dueAmount}) {
  return (
    <table className="tm_gray_bg">
      <tbody>
        <tr>
          <td className="tm_width_3 tm_primary_color tm_bold">
            Total
          </td>
          <td className="tm_width_3 tm_primary_color tm_text_right tm_bold">${totalAmount.toFixed(2)}</td>
        </tr>
        <tr>
          <td className="tm_width_3 tm_primary_color tm_bold">
            Paid
          </td>
          <td className="tm_width_3 tm_primary_color tm_bold tm_text_right">${paidAmount.toFixed(2)}</td>
        </tr>
        <tr className="tm_border_top tm_border_bottom tm_accent_bg">
          <td className="tm_width_3 tm_border_top_0 tm_bold tm_f16 tm_white_color">Due</td>
          <td className="tm_width_3 tm_border_top_0 tm_bold tm_f16 tm_white_color tm_text_right">${dueAmount.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  )
}
