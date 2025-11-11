import parser from 'html-react-parser'

export default function InvoiceToPayToStyle2({ titleUp, title, subTitle,}) {
  return (
    <>
      <p className="tm_mb2">
        {titleUp && <b>{titleUp}:</b>}
      </p>
      <p>
        <b className="tm_f16 tm_primary_color">{title}</b><br />
        {parser(subTitle)}
      </p>
    </>
  )
}
