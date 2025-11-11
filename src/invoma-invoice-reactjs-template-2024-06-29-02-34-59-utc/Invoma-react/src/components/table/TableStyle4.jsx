
export default function TableStyle4({data}) {
  return (
    <table>
      <thead>
        <tr>
          <th className="tm_width_3 tm_semi_bold tm_primary_color">
            Item
          </th>
          <th className="tm_width_4 tm_semi_bold tm_primary_color tm_border_left">
            Description
          </th>
          <th className="tm_width_2 tm_semi_bold tm_primary_color tm_border_left">
            Price
          </th>
          <th className="tm_width_1 tm_semi_bold tm_primary_color tm_border_left">
            Qty
          </th>
          <th className="tm_width_2 tm_semi_bold tm_primary_color tm_border_left tm_text_right">
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        {data?.map((item, index) => (
          <tr key={index}>
            <td className="tm_width_3">{`${index + 1}. ${item.item}`}</td>
            <td className="tm_width_4 tm_border_left">{item.desc}</td>
            <td className="tm_width_2 tm_border_left">${item.price}</td>
            <td className="tm_width_1 tm_border_left">{item.qty}</td>
            <td className="tm_width_2 tm_border_left tm_text_right">${(item.price * item.qty).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
