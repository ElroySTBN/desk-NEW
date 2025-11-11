
export default function TableStyle17({data, serviceCost}) {
  return (
    <table className="tm_border_top">
      <thead>
        <tr>
          <th className="tm_width_5 tm_semi_bold tm_primary_color tm_gray_bg">
            Description
          </th>
          <th className="tm_width_5 tm_semi_bold tm_primary_color tm_gray_bg">
            Period Date
          </th>
          <th className="tm_width_2 tm_semi_bold tm_primary_color tm_gray_bg tm_text_right">
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        {data?.map((item, index)=>(
          <tr key={index}>
            <td className="tm_width_5">{item.item}</td>
            <td className="tm_width_5">{item.desc}</td>
            <td className="tm_width_2 tm_text_right">${(parseFloat(item.price)).toFixed(2)}</td>
          </tr>
        ))}
        <tr>
          <td className="tm_width_5" colSpan={2}>Monthly services</td>
          <td className="tm_width_2 tm_text_right">${serviceCost.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  )
}
