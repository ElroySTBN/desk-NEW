import { useRef } from "react";
import Buttons from "../components/buttons/Buttons";
import { currentDate3, pageTitle } from "../helper/helper";
import HeaderStyle2 from "../components/header/HeaderStyle2";
import InvoiceToPayToStyle2 from "../components/invoiceToPayTo/InvoiceToPayToStyle2";
import PaymentInfo from "../components/paymentInfo/PaymentInfo";
import TableStyle19 from "../components/table/TableStyle19";
import SubTotalStyle11 from "../components/subTotal/SubTotalStyle11";

const headerData = [
  {
    title : 'Email',
    subTitle : 'support@gmail.com <br/> career@gmail.com'
  },
  {
    title : 'Phone',
    subTitle : '+99-131-124-567 <br/> Monday to Friday'
  },
  {
    title : 'Address',
    subTitle : '9 Paul Street, London <br /> England EC2A 4NE'
  },
]

const tableData = [
  {
    item: '1 Domain - (.com Domain Registration with SSL) 2 Years domainname.com',
    desc: '',
    price: '1000',
    tax: '10', 
  },
  {
    item: '25 GB Hosting - (Business Package #SHP2564874) 2 Years',
    desc: '',
    price: '500',
    tax: '100',
  },
]


export default function DomainHosting() {
  pageTitle("Domain And Hosting");
  const invoicePage= useRef();

    // calculation
    const subTotal = tableData.reduce((total, item) => total + (parseFloat(item.price)) + ((item.price * item.tax)/100), 0);
    const discountPersent = 15;
    const discountAmount = (subTotal * discountPersent) / 100;
    const grandTotal = (subTotal - discountAmount);
  
  return (
    <>
      <div className="tm_invoice tm_style2" id="tm_download_section" ref={invoicePage}>
        <div className="tm_invoice_in">
          <HeaderStyle2
            logo='/images/logo.svg'
            data={headerData}
          />
          <div className="tm_invoice_info tm_mb10">
            <div className="tm_invoice_info_left">
              <InvoiceToPayToStyle2
                titleUp='Bill To'
                title='Lowell H. Dominguez'
                subTitle='84 Spilman Street, London <br />
                United Kingdom. <br />
                lowell@gmail.com <br />
                +99-327-123-987'
              />
            </div>
            <div className="tm_invoice_info_right">
              <div className="tm_ternary_color tm_f50 tm_text_uppercase tm_text_center tm_invoice_title tm_mb15 tm_mobile_hide">
                Invoice
              </div>
              <div className="tm_grid_row tm_col_3 tm_invoice_info_in tm_gray_bg tm_round_border">
                <div>
                  <span>Customer ID:</span> <br />
                  <b className="tm_primary_color">#326725</b>
                </div>
                <div>
                  <span>Invoice Date:</span> <br />
                  <b className="tm_primary_color">{currentDate3()}</b>
                </div>
                <div>
                  <span>Invoice No:</span> <br />
                  <b className="tm_primary_color">#LL93784</b>
                </div>
              </div>
            </div>
          </div>
          <div className="tm_table tm_style1">
            <div className="tm_round_border">
              <div className="tm_table_responsive">
                <TableStyle19 data={tableData}/>
              </div>
            </div>
            <div className="tm_invoice_footer">
              <PaymentInfo
                varient='tm_left_footer  tm_padd_left_15_md'
                title='Payment Info'
                cardType='Cradit Card'
                cardNumber='236***********928'
                amount={grandTotal}
                author="Jhon Doe"
              />
              <div className="tm_right_footer">
                <SubTotalStyle11 
                  subTotal={subTotal}
                  discountPersent={discountPersent}
                  discountAmount={discountAmount}
                  grandTotal={grandTotal}
                />
              </div>
            </div>
          </div>
          <div className="tm_note tm_text_center tm_m0_md">
            <p className="tm_m0">
              Invoice was created on a computer and is valid without the signature and
              seal.
            </p>
          </div>
          {/* .tm_note */}
        </div>
      </div>
      <Buttons invoicePage={invoicePage}/>
    </>
  )
}
