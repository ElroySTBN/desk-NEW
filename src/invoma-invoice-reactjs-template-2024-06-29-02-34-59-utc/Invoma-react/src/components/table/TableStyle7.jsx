
export default function TableStyle7({data}) {
  return (
    <table className="tm_border_bottom">
      <thead>
        <tr className="tm_border_top">
          <th className="tm_width_3 tm_semi_bold tm_primary_color tm_accent_bg_10">
            Item
          </th>
          <th className="tm_width_4 tm_semi_bold tm_primary_color tm_accent_bg_10">
            Description
          </th>
          <th className="tm_width_2 tm_semi_bold tm_primary_color tm_accent_bg_10">
            Price
          </th>
          <th className="tm_width_1 tm_semi_bold tm_primary_color tm_accent_bg_10">
            Qty
          </th>
          <th className="tm_width_2 tm_semi_bold tm_primary_color tm_accent_bg_10 tm_text_right">
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td className="tm_width_3">{`${index + 1}. ${item.item}`}</td>
            <td className="tm_width_4">{item.desc}</td>
            <td className="tm_width_2">${item.price}</td>
            <td className="tm_width_1">{item.qty}</td>
            <td className="tm_width_2 tm_text_right">${(item.price * item.qty).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
