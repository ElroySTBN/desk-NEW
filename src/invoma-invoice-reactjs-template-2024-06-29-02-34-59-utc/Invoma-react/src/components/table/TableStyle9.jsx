

export default function TableStyle9({data}) {
  return (
    <table className="tm_border_bottom">
      <thead>
        <tr>
          <th className="tm_width_1 tm_medium tm_white_color tm_accent_bg tm_text_center">
            SL
          </th>
          <th className="tm_width_6 tm_medium tm_white_color tm_accent_bg">
            Description
          </th>
          <th className="tm_width_2 tm_medium tm_white_color tm_accent_bg">
            Price
          </th>
          <th className="tm_width_1 tm_medium tm_white_color tm_accent_bg tm_text_center">
            Qty
          </th>
          <th className="tm_width_2 tm_medium tm_white_color tm_accent_bg tm_text_right">
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((item,index)=>(
          <tr key={index}>
            <td className="tm_width_1 tm_text_center">{index + 1}</td>
            <td className="tm_width_6">{item.item}</td>
            <td className="tm_width_2">${item.price}</td>
            <td className="tm_width_1 tm_text_center">{item.qty}</td>
            <td className="tm_width_2 tm_text_right">${(item.price * item.qty).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
