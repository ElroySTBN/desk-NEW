
export default function Terms({varient, title, data}) {
  return (
    <div className={`tm_padd_15_20 ${varient ? varient : ''}`}>
      <p className="tm_mb5">
        <b className="tm_primary_color">{title}</b>
      </p>
      <ul className="tm_m0 tm_note_list">
        {data.map((item, index)=>(
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
