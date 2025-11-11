

export default function SubTotalStyle3({subTotal, taxPersent, taxAmount, grandTotal, bg, textColor, gtBg, gtTextColor}) {
  return (
    <table className="tm_mb15">
      <tbody>
        <tr className={`${bg}`}>
          <td className={`tm_width_3 ${textColor}  tm_bold`}>
            Subtoal
          </td>
          <td className={`tm_width_3 ${textColor} tm_bold tm_text_right`}>${subTotal.toFixed(2)}</td>
        </tr>
        <tr className={`${bg}`}>
          <td className={`tm_width_3  ${textColor}`}>
            Tax <span className={`tm_ternary_color`}>{`(${taxPersent}%)`}</span>
          </td>
          <td className={`tm_width_3 ${textColor} tm_text_right`}>+ ${taxAmount.toFixed(2)}</td>
        </tr>
        <tr className={`${gtBg}`}>
          <td className="tm_width_3 tm_border_top_0 tm_bold tm_f16 tm_white_color">
            Grand Total
          </td>
          <td className={` tm_width_3 tm_border_top_0 tm_bold tm_f16 ${gtTextColor} tm_text_right `}>${grandTotal.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  )
}
