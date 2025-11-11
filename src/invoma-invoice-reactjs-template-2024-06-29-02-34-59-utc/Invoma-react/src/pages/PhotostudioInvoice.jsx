import { useRef } from "react";
import Buttons from "../components/buttons/Buttons";
import InvoiceInfoStyle8 from "../components/invoiceInfo/InvoiceInfoStyle8";
import InvoiceToPayTo from "../components/invoiceToPayTo/InvoiceToPayTo";
import PaymentInfo from "../components/paymentInfo/PaymentInfo";
import SubTotal from "../components/subTotal/SubTotal";
import TableStyle9 from "../components/table/TableStyle9";
import { pageTitle } from "../helper/helper";

const tableData = [
  {
    item: 'Large size art with large frame',
    desc: 'Six web page designs and three times revision',
    price: '350',
    qty: '3', 
  },
  {
    item: 'Family size photo with medium frame',
    desc: 'Convert pixel-perfect frontend and make it dynamic',
    price: '200',
    qty: '4', 
  },
  {
    item: 'Album size photo with digital print',
    desc: 'Android And Ios Application Development',
    price: '100',
    qty: '1', 
  },
  {
    item: 'Camera rent',
    desc: 'Facebook, Youtube and Google Marketing',
    price: '50',
    qty: '2', 
  },
]

export default function PhotostudioInvoice() {
  pageTitle('Photo Stdio');
  const invoicePage= useRef();

  // calculation
  const subTotal = tableData.reduce((total, item) => total + item.price * item.qty, 0);
  const taxPersent = 15;
  const taxAmount = subTotal * taxPersent / 100;
  const grandTotal = subTotal + taxAmount;
  
  return (
    <>
      <div className="tm_invoice tm_style1 tm_type2" id="tm_download_section" ref={invoicePage}>
        <div className="tm_bars">
          <span className="tm_accent_bg" />
          <span className="tm_accent_bg" />
          <span className="tm_accent_bg" />
        </div>
        <div className="tm_bars tm_type1">
          <span className="tm_accent_bg" />
          <span className="tm_accent_bg" />
          <span className="tm_accent_bg" />
        </div>
        <div className="tm_shape">
          <div className="tm_shape_in tm_accent_bg" />
        </div>
        <div className="tm_shape_2 tm_primary_color">
          <div className="tm_shape_2_in tm_accent_color" />
        </div>
        <div className="tm_shape_2 tm_type1 tm_primary_color">
          <div className="tm_shape_2_in tm_accent_color" />
        </div>
        {/* <div class="tm_shape_4 tm_primary_bg"></div> */}
        <div className="tm_shape tm_type1">
          <div className="tm_shape_in tm_accent_bg" />
        </div>
        <div className="tm_invoice_in">
          <div className="tm_invoice_head tm_align_center tm_mb20">
            <div className="tm_invoice_left">
              <div className="tm_logo">
                <img src="/images/logo.svg" alt="Logo" />
              </div>
            </div>
            <div className="tm_invoice_right tm_text_right"></div>
          </div>
          <InvoiceInfoStyle8
            id='#LL93785'
          />
          <div className="tm_invoice_head tm_mb10">
            <InvoiceToPayTo
              varient='tm_invoice_left'
              title='Invoice To'
              subTitle='Lowell H. Dominguez <br />
              84 Spilman Street, London <br />
              United Kingdom <br />
              lowell@gmail.com'
            />
            <InvoiceToPayTo
              varient='tm_invoice_right'
              title='Pay To'
              subTitle='Laralink Ltd <br />
              86-90 Paul Street, London <br /> 
              England EC2A 4NE <br />
              demo@gmail.com'
            />
          </div>
          <div className="tm_table tm_style1 tm_mb30">
            <div className="tm_mb30">
              <div className="tm_table_responsive">
                <TableStyle9 data={tableData}/>
              </div>
            </div>
            <div className="tm_invoice_footer">
              <PaymentInfo 
                varient='tm_left_footer'
                title='Payment info'
                cardType='Credit Card'
                cardNumber='236***********928'
                amount={grandTotal}
              />
              <div className="tm_right_footer">
                <SubTotal
                  subTotal={subTotal}
                  taxPersent={taxPersent}
                  taxAmount={taxAmount}
                  grandTotal={grandTotal}
                  textColor='tm_accent_color'
                />
                <div className="tm_shape_3 tm_accent_bg_10" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Buttons invoicePage={invoicePage}/>
    </>
  )
}
