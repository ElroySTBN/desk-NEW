import parser from 'html-react-parser';

export default function HeaderStyle7({logo, contact, address}) {
  return (
    <div className="tm_grid_row tm_col_3 tm_padd_20 tm_border tm_accent_border_20 tm_accent_bg_10 tm_mb25 tm_align_center">
      <div className="tm_border_right tm_accent_border_20 tm_border_none_sm">
        <div className="tm_logo">
          <img src={logo} alt="Logo" />
        </div>
      </div>
      <div className="tm_border_right tm_accent_border_20 tm_border_none_sm">{parser(address)}</div>
      <div>{parser(contact)}</div>
    </div>
  )
}
