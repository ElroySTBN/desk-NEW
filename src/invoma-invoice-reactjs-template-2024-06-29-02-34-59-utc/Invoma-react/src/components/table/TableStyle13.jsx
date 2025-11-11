

export default function TableStyle13({data, serviceCharge}) {
  return (
    <table>
      <thead>
        <tr>
          <th className="tm_width_6 tm_semi_bold tm_primary_color">
            Description
          </th>
          <th className="tm_width_4 tm_semi_bold tm_primary_color">
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
            <td className="tm_width_6">{item.item}</td>
            <td className="tm_width_4">${`${item.price} X ${item.qty} ${item.desc}`}</td>
            <td className="tm_width_2 tm_text_right">${`${(item.price * item.qty).toFixed(2)}`}</td>
          </tr>
        ))}
        <tr>
          <td className="tm_width_6">Service Fee (Included VAT)</td>
          <td className="tm_width_4">${serviceCharge}</td>
          <td className="tm_width_2 tm_text_right">${serviceCharge.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  )
}
