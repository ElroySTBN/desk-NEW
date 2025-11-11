

export default function TableStyle18({data}) {
  return (
    <table>
      <thead>
        <tr>
          <th className="tm_width_7 tm_semi_bold tm_primary_color">
            Description
          </th>
          <th className="tm_width_2 tm_semi_bold tm_primary_color">
            Price
          </th>
          <th className="tm_width_1 tm_semi_bold tm_primary_color">
            Hours
          </th>
          <th className="tm_width_2 tm_semi_bold tm_primary_color tm_text_right">
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td className="tm_width_7">{item.item}</td>
            <td className="tm_width_2">${item.price}</td>
            <td className="tm_width_1">{item.hours}</td>
            <td className="tm_width_2 tm_text_right">${(item.price * item.hours).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
