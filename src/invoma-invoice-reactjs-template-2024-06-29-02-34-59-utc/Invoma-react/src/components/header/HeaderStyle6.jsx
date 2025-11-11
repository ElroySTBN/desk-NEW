import React from 'react'
import Iconbox from '../widget/Iconbox'

export default function HeaderStyle6({logo, data}) {
  return (
    <div className="tm_invoice_head tm_mb20 tm_m0_md">
      <div className="tm_invoice_left">
        <div className="tm_logo">
          <img src={logo} alt="Logo" />
        </div>
      </div>
      <div className="tm_invoice_right">
        <div className="tm_grid_row tm_col_3">
          {data?.map((item, index) => (
            <Iconbox key={index} icon={item.icon} title={item.subTitle} />
          ))}
        </div>
      </div>
      <div className="tm_shape_bg tm_accent_bg_10 tm_border tm_accent_border_20" />
    </div>
  )
}
