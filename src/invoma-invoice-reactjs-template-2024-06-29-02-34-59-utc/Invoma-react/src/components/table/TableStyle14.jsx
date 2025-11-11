import perser from 'html-react-parser';

export default function TableStyle14({data}) {
  return (
    <table>
      <thead>
        <tr>
          <th
            className="tm_width_6 tm_semi_bold tm_primary_color tm_gray_bg"
            colSpan={5}
          >
            Travel Information
          </th>
        </tr>
        <tr className="tm_border_top">
          <th className="tm_width_5 tm_semi_bold tm_primary_color">
            Flight Details
          </th>
          <th className="tm_width_2 tm_semi_bold tm_primary_color">
            Class
          </th>
          <th className="tm_width_2 tm_semi_bold tm_primary_color">
            Base Fare
          </th>
          <th className="tm_width_1 tm_semi_bold tm_primary_color">
            Discount
          </th>
          <th className="tm_width_2 tm_text_right tm_semi_bold tm_primary_color">
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td className="tm_width_5">{perser(item.flightDetails)}</td>
            <td className="tm_width_2">{item.class}</td>
            <td className="tm_width_2">${item.price}</td>
            <td className="tm_width_1">{`${item.discount ? item.discount + '%' : 0}`}</td>
            <td className="tm_width_2 tm_text_right">${((item.price)-((item.price * item.discount)/100)).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
