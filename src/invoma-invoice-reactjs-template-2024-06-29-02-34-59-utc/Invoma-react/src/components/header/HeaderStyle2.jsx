import TitleAndSubTitle from "../widget/TitleAndSubTitle";

export default function HeaderStyle2({logo, data}) {
  return (
    <div className="tm_invoice_head tm_top_head tm_mb20">
      <div className="tm_invoice_left">
        <div className="tm_logo">
          <img src={logo} alt="Logo" />
        </div>
      </div>
      <div className="tm_invoice_right">
        <div className="tm_grid_row tm_col_3">
          {data?.map((item, index)=>(
            <TitleAndSubTitle 
              key={index}
              title={item.title}
              subTitle={item.subTitle}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
