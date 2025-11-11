import { useRef } from "react"
import HeaderStyle3 from "../components/header/HeaderStyle3"
import InvoiceInfoStyle3 from "../components/invoiceInfo/InvoiceInfoStyle3"
import InvoiceToPayTo from "../components/invoiceToPayTo/InvoiceToPayTo"
import SubTotalStyle3 from "../components/subTotal/SubTotalStyle3"
import TableStyle3 from "../components/table/TableStyle3"
import PaymentMethod from "../components/widget/PaymentMethod"
import PaymentInfo from "../components/paymentInfo/PaymentInfo"
import Signature from "../components/widget/Signature"
import TermsStyle2 from "../components/termsAndConditions/TermsStyle2"
import Buttons from "../components/buttons/Buttons"
import { pageTitle } from "../helper/helper"



const tableData = [
  {
    item: 'Website Design ',
    desc: 'Six web page designs and three times revision',
    price: '400',
    qty: '2', 
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
    price: '450',
    qty: '5', 
  },
  {
    item: 'Digital Marketing',
    desc: 'Facebook, Youtube and Google Marketing',
    price: '500',
    qty: '10', 
  },
]


export default function General3() {
  pageTitle('General 3');
  // download page
  const invoicePage = useRef();


  // calculation
  const subTotal = tableData.reduce((total, item) => total + item.price * item.qty, 0);
  const taxPersent = 5;
  const taxAmount = subTotal * taxPersent / 100;
  const grandTotal = (subTotal + taxAmount);


  return (
    <>
      <div className="tm_invoice tm_style1 tm_type1" id="tm_download_section" ref={invoicePage}>
        <div className="tm_invoice_in">
          <HeaderStyle3 
            logo='/images/logo.svg'
            title='Invoice'
          />
          <div className="tm_invoice_info tm_mb25">
            <PaymentMethod title='Paypal, Western Union' />
            <InvoiceInfoStyle3 id='LL93784' />
            <div className="tm_invoice_seperator tm_accent_bg" />
          </div>
          <div className="tm_invoice_head tm_mb10">
            <InvoiceToPayTo
              title='Invoice to'
              subTitle='Lowell H. Dominguez <br />
              84 Spilman Street, London <br />
              United Kingdom <br />
              lowell@gmail.com'
              varient='tm_invoice_left'
            />
            <InvoiceToPayTo 
              title='Pay To'
              subTitle='Laralink Ltd <br />
              86-90 Paul Street, London
              <br />
              England EC2A 4NE <br />
              demo@gmail.com'
              varient='tm_invoice_right tm_text_right'
            />
          </div>
          <div className="tm_table tm_style1">
            <div className="">
              <div className="tm_table_responsive">
                <TableStyle3 data={tableData} />
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
                <SubTotalStyle3
                  subTotal={subTotal}
                  taxPersent={taxPersent}
                  taxAmount={taxAmount}
                  grandTotal={grandTotal}
                  bg='tm_gray_bg'
                  textColor='tm_primary_color'
                  gtBg='tm_accent_bg'
                  gtTextColor='tm_white_color'
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
          <TermsStyle2
            title='Terms and Conditions'
            subTitle='
            All claims relating to quantity or shipping errors shall be waived
            by Buyer unless made in writing to <br />
            Seller within thirty (30) days after delivery of goods to the
            address stated.'
          />
        </div>
      </div>
      <Buttons invoicePage={invoicePage} />
    </>
  )
}
