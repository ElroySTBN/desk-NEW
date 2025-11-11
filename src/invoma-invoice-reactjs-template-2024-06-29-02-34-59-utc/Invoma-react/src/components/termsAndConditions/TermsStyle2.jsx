import parser from 'html-react-parser'

export default function TermsStyle2({title, subTitle}) {
  return (
    <div className="tm_note tm_font_style_normal tm_text_center">
      <hr className="tm_mb15" />
      <p className="tm_mb2">
        <b className="tm_primary_color">{parser(title)}</b>
      </p>
      <p className="tm_m0">{parser(subTitle)}</p>
    </div>
  )
}
