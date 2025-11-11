export default function Table({data, itemCount}) {
  return (
    <table>
      <thead>
        <tr>
          <th className="tm_width_3 tm_semi_bold tm_primary_color tm_gray_bg">Item</th>
          <th className="tm_width_4 tm_semi_bold tm_primary_color tm_gray_bg">Description</th>
          <th className="tm_width_2 tm_semi_bold tm_primary_color tm_gray_bg">Price</th>
          <th className="tm_width_1 tm_semi_bold tm_primary_color tm_gray_bg">Qty</th>
          <th className="tm_width_2 tm_semi_bold tm_primary_color tm_gray_bg tm_text_right">Total</th>
        </tr>
      </thead>
      <tbody>
        {data?.map((item, index) => (
          <tr key={index}>
            <td className="tm_width_3">{`${itemCount ? index + 1 + '.' : ''} ${item.item}`}</td>
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
