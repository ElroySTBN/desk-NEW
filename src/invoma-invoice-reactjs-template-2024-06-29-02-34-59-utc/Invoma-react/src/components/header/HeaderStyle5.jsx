import parser from 'html-react-parser'

export default function HeaderStyle5({logo, data}) {
  console.log(data)
  return (
    <div className="tm_grid_row tm_col_4 tm_padd_20 tm_accent_bg tm_mb25 tm_white_color tm_align_center">
      <div>
        <div className="tm_logo">
          <img src={logo} alt="Logo" />
        </div>
      </div>
      {data?.map((item, index)=>(<div key={index}>{parser(item.subTitle)}</div>))}
    </div>
  )
}
