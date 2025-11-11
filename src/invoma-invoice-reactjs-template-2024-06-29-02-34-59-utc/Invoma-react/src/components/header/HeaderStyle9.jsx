import perser from 'html-react-parser'

export default function HeaderStyle9({logo, title, subTitle}) {
  return (
    <div className="tm_invoice_head tm_align_center tm_accent_bg">
      <div className="tm_invoice_left">
        <div className="tm_logo">
          <img src={logo} alt="Logo" />
        </div>
      </div>
      <div className="tm_invoice_right">
        <div className="tm_head_address tm_white_color">{perser(subTitle)}</div>
      </div>
      <div className="tm_primary_color tm_text_uppercase tm_watermark_title tm_white_color">{title}</div>
    </div>
  )
}
