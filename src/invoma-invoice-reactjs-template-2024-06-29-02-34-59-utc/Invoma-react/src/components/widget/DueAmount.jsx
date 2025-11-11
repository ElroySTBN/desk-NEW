
export default function DueAmount({due, cardType}) {
  return (
    <div className="tm_invoice_right tm_text_center">
      <p className="tm_mb3">
        <b className="tm_primary_color">Amount Due</b>
      </p>
      <div className="tm_f30 tm_bold tm_accent_color tm_padd_15 tm_accent_bg_10 tm_border_1 tm_accent_border_20 tm_mb5">${due.toFixed(2)}</div>
      <p className="tm_mb0">
        <i>Payment method: {cardType}</i>
      </p>
    </div>
  )
}
