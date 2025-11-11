export default function TableStyle2({varient, data}) {
  return (
    <table className={`${varient ? varient : ''}`}>
      <thead>
        <tr>
          <th className="tm_width_7 tm_semi_bold tm_accent_color">Item</th>
          <th className="tm_width_2 tm_semi_bold tm_accent_color">Price</th>
          <th className="tm_width_1 tm_semi_bold tm_accent_color">Qty</th>
          <th className="tm_width_2 tm_semi_bold tm_accent_color tm_text_right">Total</th>
        </tr>
      </thead>
      <tbody>
        {data?.map((item, index) => (
          <tr key={index}>
            <td className="tm_width_7">
              <p className="tm_m0 tm_f16 tm_primary_color">{item.item}</p>
              {item.desc}
            </td>
            <td className="tm_width_2">${item.price}</td>
            <td className="tm_width_1">{item.qty}</td>
            <td className="tm_width_2">${(item.price * item.qty).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
