
export default function Header({logo, title}) {
  return (
    <div className="tm_invoice_head tm_align_center tm_mb20">
      <div className="tm_invoice_left">
        <div className="tm_logo">
          <img src={logo} alt="Logo" />
        </div>
      </div>
      <div className="tm_invoice_right tm_text_right">
        <div className="tm_primary_color tm_f50 tm_text_uppercase">{title}</div>
      </div>
    </div>
  )
}
