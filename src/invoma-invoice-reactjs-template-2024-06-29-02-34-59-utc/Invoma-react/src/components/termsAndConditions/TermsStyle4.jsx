import perser from 'html-react-parser';

export default function TermsStyle4({title, subTitle, varient}) {
  return (
    <div className={`${varient ? varient : ''}`}>
      <p className="tm_bold tm_primary_color tm_m0">{title}</p>
      <p className="tm_m0">{perser(subTitle)}</p>
    </div>
  )
}
