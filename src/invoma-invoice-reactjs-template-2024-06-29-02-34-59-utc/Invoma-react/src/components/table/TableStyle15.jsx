

export default function TableStyle15({data, serviceCost}) {
  return (
    <table>
      <thead>
        <tr>
          <th className="tm_width_8 tm_semi_bold tm_primary_color">
            Rate Sheet
          </th>
          <th className="tm_width_2 tm_semi_bold tm_primary_color">
            Rate
          </th>
          <th className="tm_width_2 tm_semi_bold tm_primary_color tm_text_right">
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td className="tm_width_8">{item.item}</td>
            <td className="tm_width_2">${`${item.price} x ${item.qty}`}</td>
            <td className="tm_width_2 tm_text_right">${`${item.price * item.qty}`}</td>
          </tr>
        ))}
        <tr>
          <td className="tm_width_8">Service Charges</td>
          <td className="tm_width_2">${serviceCost}</td>
          <td className="tm_width_2 tm_text_right">${serviceCost}</td>
        </tr>
      </tbody>
    </table>
  )
}
