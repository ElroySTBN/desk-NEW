export default function TableStyle5({data}) {
  return (
    <table>
      <thead>
        <tr>
          <th className="tm_width_3 tm_semi_bold tm_accent_color tm_accent_bg_10">
            Item
          </th>
          <th className="tm_width_4 tm_semi_bold tm_accent_color tm_accent_bg_10">
            Description
          </th>
          <th className="tm_width_2 tm_semi_bold tm_accent_color tm_accent_bg_10">
            Price
          </th>
          <th className="tm_width_1 tm_semi_bold tm_accent_color tm_accent_bg_10">
            Qty
          </th>
          <th className="tm_width_2 tm_semi_bold tm_accent_color tm_accent_bg_10 tm_text_right">
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td className="tm_width_3 tm_accent_border_20">{`${index + 1}. ${item.item}`}</td>
            <td className="tm_width_4 tm_accent_border_20">{item.desc}</td>
            <td className="tm_width_2 tm_accent_border_20">${item.price}</td>
            <td className="tm_width_1 tm_accent_border_20">{item.qty}</td>
            <td className="tm_width_2 tm_accent_border_20 tm_text_right">${(item.price * item.qty).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>

  )
}
