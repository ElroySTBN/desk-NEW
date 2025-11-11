
export default function TableStyle11({ data }) {
    return (
        <table className="tm_border_bottom tm_border_top">
            <thead>
                <tr>
                    <th className="tm_width_3 tm_semi_bold tm_primary_color tm_gray_bg">
                        Item
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
                    <tr className="tm_table_baseline" key={index}>
                        <td className="tm_width_7 tm_primary_color">{item.item}</td>
                        <td className="tm_width_2">${item.price}</td>
                        <td className="tm_width_1">{item.qty}</td>
                        <td className="tm_width_2 tm_text_right">${(item.price * item.qty).toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
