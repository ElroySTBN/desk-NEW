import parser from 'html-react-parser'

export default function TitleAndSubTitle({title, subTitle}) {
  return (
    <div className="tm_mb5">
      <b className="tm_primary_color">{title}</b> <br />
      {parser(subTitle)}
    </div>
  )
}
