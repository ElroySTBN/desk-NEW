

export default function TableStyle6({varient, data}) {
  return (
    <table className={`${varient ? varient : ''}`}>
      <thead>
        <tr className="tm_accent_bg">
          <th className="tm_width_1 tm_semi_bold tm_white_color">
            No.
          </th>
          <th className="tm_width_6 tm_semi_bold tm_white_color">
            Description
          </th>
          <th className="tm_width_2 tm_semi_bold tm_white_color">
            Price
          </th>
          <th className="tm_width_1 tm_semi_bold tm_white_color">
            Qty
          </th>
          <th className="tm_width_2 tm_semi_bold tm_white_color tm_text_right">
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td className="tm_width_1 tm_accent_border_20">{index + 1}.</td>
            <td className="tm_width_6 tm_accent_border_20">
              <b className="tm_primary_color tm_medium">{item.item}</b>
              <br />
              {item.desc}
            </td>
            <td className="tm_width_2 tm_accent_border_20">${item.price}</td>
            <td className="tm_width_1 tm_accent_border_20">{item.qty}</td>
            <td className="tm_width_2 tm_accent_border_20 tm_text_right">${(item.price * item.qty).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
