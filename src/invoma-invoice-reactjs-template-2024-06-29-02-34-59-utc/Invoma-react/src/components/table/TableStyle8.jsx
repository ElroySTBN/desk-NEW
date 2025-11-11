

export default function TableStyle8({varient, data}) {
  return (
    <table className={`${varient ? varient : ''}`}>
      <thead>
        <tr>
          <th className="tm_width_5 tm_semi_bold tm_white_color tm_accent_bg">
            Description
          </th>
          <th className="tm_width_1 tm_semi_bold tm_white_color tm_accent_bg tm_border_left">
            Qty
          </th>
          <th className="tm_width_2 tm_semi_bold tm_white_color tm_accent_bg tm_border_left">
            Price
          </th>
          <th className="tm_width_2 tm_semi_bold tm_white_color tm_accent_bg tm_border_left">
            Discount
          </th>
          <th className="tm_width_2 tm_semi_bold tm_white_color tm_accent_bg tm_border_left tm_text_right">
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index)=>(
          <tr key={index}>
            <td className="tm_width_5">{item.item}</td>
            <td className="tm_width_1 tm_border_left">{item.qty}</td>
            <td className="tm_width_2 tm_border_left">${item.price}</td>
            <td className="tm_width_2 tm_border_left">{item.discount}%</td>
            <td className="tm_width_2 tm_border_left tm_text_right">{((item.price * item.qty)-((item.price * item.qty * item.discount)/100)).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
