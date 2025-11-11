import { useRef } from "react";
import Buttons from "../components/buttons/Buttons";
import InvoiceToPayTo from "../components/invoiceToPayTo/InvoiceToPayTo";
import { currentDate5, pageTitle } from "../helper/helper";
import Signature from "../components/widget/Signature";
import SubTotalStyle12 from "../components/subTotal/SubTotalStyle12";
import PaymentInfo from "../components/paymentInfo/PaymentInfo";
import TableStyle21 from "../components/table/TableStyle21";

const tableData = [
  {
    item: 'Finest Ramen',
    desc: 'Six web page designs and three times revision',
    price: '12',
    qty: '5', 
  },
  {
    item: 'Sushi tray',
    desc: 'Convert pixel-perfect frontend and make it dynamic',
    price: '9',
    qty: '2', 
  },
  {
    item: 'Finest Gyoza',
    desc: 'Android And Ios Application Development',
    price: '8',
    qty: '3', 
  },
  {
    item: 'Extra Condiments',
    desc: 'Facebook, Youtube and Google Marketing',
    price: '3',
    qty: '1', 
  },
  {
    item: '	Cucumber Lemonade',
    desc: 'Facebook, Youtube and Google Marketing',
    price: '6',
    qty: '7', 
  },
]

export default function RestaurantInvoice() {
  pageTitle("Restaurant");
  const invoicePage= useRef();

  // calculation
  const subTotal = tableData.reduce((total, item) => total + item.price * item.qty, 0);
  const taxPersent = 15;
  const taxAmount = subTotal * taxPersent / 100;
  const grandTotal = (subTotal + taxAmount);
  
  return (
    <>
      <div className="tm_invoice tm_style1 tm_type1" id="tm_download_section" ref={invoicePage}>
        <div className="tm_invoice_in">
          <div className="tm_invoice_head tm_top_head tm_mb15 tm_align_center">
            <div className="tm_invoice_left">
              <div className="tm_logo">
                <img src="/images/logo.svg" alt="Logo" />
              </div>
            </div>
            <div className="tm_invoice_right tm_text_right tm_mobile_hide">
              <div className="tm_f50 tm_text_uppercase tm_accent_color">Invoice</div>
            </div>
            <div className="tm_shape_bg tm_accent_bg_20 tm_mobile_hide" />
          </div>
          <div className="tm_invoice_info tm_mb25">
            <div className="tm_card_note tm_mobile_hide">
              <b className="tm_primary_color">Payment Method: </b>Paypal, Western
              Union
            </div>
            <div className="tm_invoice_info_list tm_accent_color">
              <p className="tm_invoice_number tm_m0">
                Invoice No: <b>#LL93784</b>
              </p>
              <p className="tm_invoice_date tm_m0">
                Date: <b>{currentDate5()}</b>
              </p>
            </div>
            <div className="tm_invoice_seperator tm_accent_bg_20" />
          </div>
          <div className="tm_invoice_head tm_mb10">
            <InvoiceToPayTo 
              title='Invoice To' 
              subTitle='Lowell H. Dominguez 84 <br/> Spilman Street, London <br /> England EC2A 4NE <br /> demo@gmail.com'
              varient='tm_invoice_left'
            />
            <InvoiceToPayTo
              title='Pay To' 
              subTitle='Laralink Ltd <br /> 86-90 Paul Street, London <br /> England EC2A 4NE <br /> demo@gmail.com'
              varient='tm_invoice_right tm_text_right'
            />
          </div>
          <div className="tm_table tm_style1 tm_mb30">
            <div>
              <div className="tm_table_responsive">
                <TableStyle21 data={tableData}/>
              </div>
            </div>
            <div className="tm_invoice_footer tm_border_top tm_mb15 tm_m0_md">
              <PaymentInfo
                varient='tm_left_footer'
                title='Payment Info'
                cardType='Cradit Card'
                cardNumber='236***********928'
                amount={grandTotal}
              />
              <div className="tm_right_footer">
                <SubTotalStyle12 
                  subTotal={subTotal} 
                  taxPersent={taxPersent}
                  taxAmount={taxAmount}
                  grandTotal={grandTotal}
                />
              </div>
            </div>
            <div className="tm_invoice_footer tm_type1">
              <div className="tm_left_footer" />
              <div className="tm_right_footer">
                <Signature
                  imgUrl='/images/sign.svg'
                  name='Jhon Donate'
                  designation='Accounts Manager'
                />
              </div>
            </div>
          </div>
          <hr className="tm_mb20" />
          <p className="tm_mb0 tm_text_center tm_accent_color">
            Thank you for choosing to dine with us. See you soon 🙂
          </p>
        </div>
      </div>
      <Buttons invoicePage={invoicePage}/>
    </>
  )
}
