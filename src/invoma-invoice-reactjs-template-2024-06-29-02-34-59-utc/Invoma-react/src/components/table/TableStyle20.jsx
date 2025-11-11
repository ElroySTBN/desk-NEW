

export default function TableStyle20({data}) {
  return (
    <table>
      <thead>
        <tr>
          <th className="tm_width_5 tm_semi_bold tm_primary_color">
            Details
          </th>
          <th className="tm_width_5 tm_semi_bold tm_primary_color">
            Due Date
          </th>
          <th className="tm_width_2 tm_semi_bold tm_primary_color tm_text_right">
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((item,index)=>(
          <tr key={index} className={`${index % 2 == 0 ? 'tm_gray_bg': ''}`}>
            <td className="tm_width_5">{item.item}</td>
            <td className="tm_width_5">{item.desc}</td>
            <td className="tm_width_2 tm_text_right">${(parseFloat(item.price)).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
