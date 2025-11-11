
export default function TableStyle21({data}) {
  return (
    <table>
      <thead>
        <tr className="tm_accent_bg_20">
          <th className="tm_width_2 tm_semi_bold tm_accent_color">No.</th>
          <th className="tm_width_5 tm_semi_bold tm_accent_color">
            Item Description
          </th>
          <th className="tm_width_2 tm_semi_bold tm_accent_color">
            Price
          </th>
          <th className="tm_width_1 tm_semi_bold tm_accent_color">Qty</th>
          <th className="tm_width_2 tm_semi_bold tm_accent_color tm_text_right">
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((item,index)=>(
          <tr key={index}>
            <td className="tm_width_2 tm_border_top_0">{index + 1}</td>
            <td className="tm_width_5 tm_border_top_0">{item.item}</td>
            <td className="tm_width_2 tm_border_top_0">${(parseFloat(item.price)).toFixed(2)}</td>
            <td className="tm_width_1 tm_border_top_0">{item.qty}</td>
            <td className="tm_width_2 tm_border_top_0 tm_text_right">${(item.price * item.qty).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
