import perser from 'html-react-parser'

export default function InvoiceToPayToStyle5({title, subTitle}) {
  return (
    <div className="tm_invoice_info_left tm_gray_bg">
      {title && <p className="tm_mb2">
        <b className="tm_primary_color">{title}:</b>
      </p>}
      <p className="tm_mb0">{perser(subTitle)}</p>
    </div>
  )
}
