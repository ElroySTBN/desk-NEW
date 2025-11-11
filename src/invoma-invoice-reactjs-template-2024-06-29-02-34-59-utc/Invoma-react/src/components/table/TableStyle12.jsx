export default function TableStyle12({ data }) {
    return (
        <table>
            <thead>
                <tr>
                    <th className="tm_width_7 tm_semi_bold tm_primary_color tm_gray_bg">
                        Item Details
                    </th>
                    <th className="tm_width_2 tm_semi_bold tm_primary_color tm_gray_bg">
                        Price
                    </th>
                    <th className="tm_width_1 tm_semi_bold tm_primary_color tm_gray_bg">
                        Qty
                    </th>
                    <th className="tm_width_2 tm_semi_bold tm_primary_color tm_gray_bg tm_text_right">
                        Total
                    </th>
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr key={index}>
                        <td className="tm_width_7">
                            {item.item}
                            {item.desc && <p className="tm_ternary_color tm_f13 tm_m0">{item.desc}</p>}   
                        </td>
                        <td className="tm_width_2">${item.price}</td>
                        <td className="tm_width_1">{item.qty}</td>
                        <td className="tm_width_2 tm_text_right">${(item.price * item.qty).toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
