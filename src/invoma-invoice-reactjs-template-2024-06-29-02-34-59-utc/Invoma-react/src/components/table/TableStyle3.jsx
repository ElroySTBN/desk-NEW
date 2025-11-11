
export default function TableStyle3({data}) {
  return (
    <table>
      <thead>
        <tr className="tm_accent_bg">
          <th className="tm_width_3 tm_semi_bold tm_white_color">Item</th>
          <th className="tm_width_4 tm_semi_bold tm_white_color">Description</th>
          <th className="tm_width_2 tm_semi_bold tm_white_color">Price</th>
          <th className="tm_width_1 tm_semi_bold tm_white_color">Qty</th>
          <th className="tm_width_2 tm_semi_bold tm_white_color tm_text_right">Total</th>
        </tr>
      </thead>
      <tbody>
        {data?.map((item, index) => (
          <tr key={index}>
            <td className="tm_width_3">{`${index + 1}. ${item.item}`}</td>
            <td className="tm_width_4">{item.desc}</td>
            <td className="tm_width_2">${item.price}</td>
            <td className="tm_width_1">{item.qty}</td>
            <td className="tm_width_2">${(item.price * item.qty).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
