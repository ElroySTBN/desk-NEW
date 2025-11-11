
export default function TableStyle10({data}) {
  return (
    <table>
      <thead>
        <tr>
          <th className="tm_width_6 tm_semi_bold tm_primary_color">
            Item
          </th>
          <th className="tm_width_2 tm_semi_bold tm_primary_color">
            Price
          </th>
          <th className="tm_width_2 tm_semi_bold tm_primary_color">
            Qty
          </th>
          <th className="tm_width_2 tm_semi_bold tm_primary_color tm_text_right">
            Total
          </th>
        </tr>
      </thead>
      <tbody>
      {data?.map((item, index) => (
        <tr key={index}>
          <td className="tm_width_6">
            {item.item} <br />
            <b className="tm_medium tm_primary_color">
              {item.desc}
            </b>
          </td>
          <td className="tm_width_2">${item.price}</td>
          <td className="tm_width_2">{item.qty}</td>
          <td className="tm_width_2 tm_text_right">${(item.price * item.qty).toFixed(2)}</td>
        </tr>  
      ))}
      </tbody>
    </table>
  )
}
