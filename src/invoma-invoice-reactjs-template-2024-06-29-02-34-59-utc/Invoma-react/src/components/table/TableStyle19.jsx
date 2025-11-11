import perser from 'html-react-parser'

export default function TableStyle19({data}) {
  return (
    <table>
      <thead>
        <tr>
          <th className="tm_width_7 tm_semi_bold tm_primary_color">
            Item Details
          </th>
          <th className="tm_width_2 tm_semi_bold tm_primary_color">
            Price
          </th>
          <th className="tm_width_1 tm_semi_bold tm_primary_color">
            Tax
          </th>
          <th className="tm_width_2 tm_semi_bold tm_primary_color tm_text_right">
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td className="tm_width_7">{perser(item.item)}</td>
            <td className="tm_width_2">${item.price}</td>
            <td className="tm_width_1">{item.tax}%</td>
            <td className="tm_width_2 tm_text_right">${((parseFloat(item.price)) + (item.price * item.tax / 100)).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
