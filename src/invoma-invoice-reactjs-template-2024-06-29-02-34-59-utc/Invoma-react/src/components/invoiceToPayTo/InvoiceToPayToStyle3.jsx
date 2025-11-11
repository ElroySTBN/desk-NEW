

export default function InvoiceToPayToStyle3({title, name, phone, email, address}) {
  return (
    <>
      <h2 className="tm_f16 tm_section_heading tm_accent_border_20 tm_mb0">
        <span className="tm_accent_bg_10 tm_radius_0 tm_curve_35 tm_border tm_accent_border_20 tm_border_bottom_0 tm_accent_color">
          <span>{title}</span>
        </span>
      </h2>
      <div className="tm_table tm_style1 tm_mb30">
        <div className="tm_border  tm_accent_border_20 tm_border_top_0">
          <div className="tm_table_responsive">
            <table>
              <tbody>
                <tr>
                  <td className="tm_width_6 tm_border_top_0">
                    <b className="tm_primary_color tm_medium">Name: </b>{name}
                  </td>
                  <td className="tm_width_6 tm_border_top_0 tm_border_left tm_accent_border_20">
                    <b className="tm_primary_color tm_medium">Phone: </b>{phone}
                  </td>
                </tr>
                <tr>
                  <td className="tm_width_6 tm_accent_border_20">
                    <b className="tm_primary_color tm_medium">Email: </b>{email}                    
                  </td>
                  <td className="tm_width_6 tm_border_left tm_accent_border_20">
                    <b className="tm_primary_color tm_medium">Address: </b>{address}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
