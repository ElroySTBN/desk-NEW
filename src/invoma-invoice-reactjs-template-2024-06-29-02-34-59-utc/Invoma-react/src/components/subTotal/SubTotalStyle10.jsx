export default function SubTotalStyle10({subTotal, discountPersent, discountAmount, grandTotal, borderBtm, textColor}) {
  return (
    <table>
      <tbody>
        <tr>
          <td className={`tm_width_3 ${textColor ? textColor : 'tm_primary_color'} tm_border_none tm_bold`}>
            SubTotal
          </td>
          <td className={`tm_width_3 ${textColor ? textColor : 'tm_primary_color'} tm_text_right tm_border_none tm_bold`}>${subTotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td className={`tm_width_3 ${textColor ? textColor : 'tm_primary_color'} tm_border_none tm_pt0`}>
            Discount <span className={`${textColor==='tm_accent_color' ? textColor : 'tm_ternary_color'}`}>{`(${discountPersent}%)`}</span>
          </td>
          <td className={`tm_width_3 ${textColor ? textColor : 'tm_primary_color'} tm_text_right tm_border_none tm_pt0`}>- ${discountAmount.toFixed(2)}</td>
        </tr>
        <tr className={`tm_border_top ${borderBtm ? 'tm_border_bottom' : ''}`}>
          <td className={`tm_width_3 tm_border_top_0 tm_bold tm_f16 ${textColor ? textColor : 'tm_primary_color'}`}>
            Grand Total
          </td>
          <td className={`tm_width_3 tm_border_top_0 tm_bold tm_f16 ${textColor ? textColor : 'tm_primary_color'} tm_text_right`}>${grandTotal.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  )
}
