
export default function HeaderStyle3({logo, title}) {
  return (
    <div className="tm_invoice_head tm_top_head tm_mb15 tm_align_center">
      <div className="tm_invoice_left">
        <div className="tm_logo">
          <img src={logo} alt="Logo" />
        </div>
      </div>
      <div className="tm_invoice_right tm_text_right tm_mobile_hide">
        <div className="tm_f50 tm_text_uppercase tm_white_color">{title}</div>
      </div>
      <div className="tm_shape_bg tm_accent_bg tm_mobile_hide" />
    </div>
  )
}
