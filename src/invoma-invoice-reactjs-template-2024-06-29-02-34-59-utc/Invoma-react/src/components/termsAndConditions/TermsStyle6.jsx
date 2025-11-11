
export default function TermsStyle6({title, data}) {
  return (
    <>
      <p className="tm_mb2">
        <b className="tm_primary_color">{`${title ? title + ':' : ''}`}</b>
      </p>
      <ol className="tm_m0">
        {data?.map((item, index)=> <li key={index}>{item}</li>)}
      </ol>
    </>
  )
}
