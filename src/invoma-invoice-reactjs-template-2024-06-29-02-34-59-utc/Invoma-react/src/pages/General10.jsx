import { useRef } from "react";
import HeaderStyle8 from "../components/header/HeaderStyle8";
import InvoiceInfoStyle9 from "../components/invoiceInfo/InvoiceInfoStyle9";
import InvoiceToPayTo from "../components/invoiceToPayTo/InvoiceToPayTo";
import TableStyle7 from "../components/table/TableStyle7";
import PaymentInfo from "../components/paymentInfo/PaymentInfo";
import SubTotal from "../components/subTotal/SubTotal";
import Terms from "../components/termsAndConditions/Terms";
import Buttons from "../components/buttons/Buttons";
import { pageTitle } from "../helper/helper";


const tableData = [
  {
    item: 'Website Design ',
    desc: 'Six web page designs and three times revision',
    price: '400',
    qty: '3', 
  },
  {
    item: 'Web Development',
    desc: 'Convert pixel-perfect frontend and make it dynamic',
    price: '400',
    qty: '4', 
  },
  {
    item: 'App Development',
    desc: 'Android And Ios Application Development',
    price: '350',
    qty: '1', 
  },
  {
    item: 'Digital Marketing',
    desc: 'Facebook, Youtube and Google Marketing',
    price: '500',
    qty: '2', 
  },
]

const termsAndCondition = [
  'All claims relating to quantity or shipping errors.',
  'Delivery dates are not guaranteed and Seller.'
]

export default function General10() {
  pageTitle('General 10');
  // download page
  const invoicePage = useRef();

  // calculation
  const subTotal = tableData.reduce((total, item) => total + item.price * item.qty, 0);
  const taxPersent = 10;
  const taxAmount = subTotal * taxPersent / 100;
  const grandTotal = subTotal + taxAmount;

  return (
    <>
      <div className="tm_invoice tm_style1 tm_type3" id="tm_download_section" ref={invoicePage}>
        <div className="tm_shape_1">
          <svg width="850" height="151" viewBox="0 0 850 151" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M850 0.889398H0V150.889H184.505C216.239 150.889 246.673 141.531 269.113 124.872L359.112 58.0565C381.553 41.3977 411.987 32.0391 443.721 32.0391H850V0.889398Z" fill="#007AFF" fill-opacity="0.1"/>
          </svg>                       
        </div>      
        <div className="tm_shape_2">
          <svg width="850" height="151" viewBox="0 0 850 151" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 150.889H850V0.889408H665.496C633.762 0.889408 603.327 10.2481 580.887 26.9081L490.888 93.7224C468.447 110.381 438.014 119.74 406.279 119.74H0V150.889Z" fill="#007AFF" fill-opacity="0.1"/>
          </svg>            
        </div> 
        <div className="tm_invoice_in">
          <HeaderStyle8 logo="/images/logo.svg" title='Invoice'/>
          <InvoiceInfoStyle9 id='#LL93784'/>
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
              varient='tm_invoice_right tm_text_right'
              title='Pay To'
              subTitle='Laralink Ltd <br />
              86-90 Paul Street, London <br />
              England EC2A 4NE <br />
              demo@gmail.com'
            />
          </div>
          <div className="tm_table tm_style1 tm_mb30">
            <div className="tm_table_responsive">
              <TableStyle7  data={tableData}/>
            </div>
            <div className="tm_invoice_footer">
              <PaymentInfo
                varient='tm_left_footer'
                title='Payment Info'
                cardType='Cradit Card'
                cardNumber='236***********928'
                amount={grandTotal}
              />
              <div className="tm_right_footer">
                <SubTotal 
                  subTotal={subTotal}
                  grandTotal={grandTotal}
                  taxPersent={taxPersent}
                  taxAmount={taxAmount}
                />
              </div>
            </div>
          </div>
          <Terms 
            title='Terms & Conditions:' 
            data={termsAndCondition}
          />
          {/* .tm_note */}
        </div>
      </div>
      <Buttons invoicePage={invoicePage} />
    </>
  )
}
