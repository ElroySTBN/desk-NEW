import parser from 'html-react-parser'
export default function Note({title, desc}) {
  return (
    <>
      <p className="tm_mb2">
        <b className="tm_primary_color">{title}</b>
      </p>
      <p className="tm_m0">{parser(desc)}</p>
    </>
  )
}
