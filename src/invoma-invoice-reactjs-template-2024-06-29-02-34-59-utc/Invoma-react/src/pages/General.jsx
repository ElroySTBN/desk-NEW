import { useRef } from "react"
import Buttons from "../components/buttons/Buttons"
import Table from "../components/table/Table"
import Terms from "../components/termsAndConditions/Terms"
import InvoiceToPayTo from "../components/invoiceToPayTo/InvoiceToPayTo"
import Header from "../components/header/Header"
import InvoiceInfo from "../components/invoiceInfo/InvoiceInfo"
import PaymentInfo from "../components/paymentInfo/PaymentInfo"
import SubTotal from "../components/subTotal/SubTotal"
import { pageTitle } from "../helper/helper"

const tableData = [
  {
    item: 'Website Design ',
    desc: 'Six web page designs and three times revision',
    price: '400',
    qty: '5', 
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
    qty: '3', 
  },
  {
    item: 'Digital Marketing',
    desc: 'Facebook, Youtube and Google Marketing',
    price: '500',
    qty: '1', 
  },
]

const termsAndCondition = [
  'All claims relating to quantity or shipping errors shall be waived by Buyer unless made in writing to Seller within thirty (30) days after delivery of goods to the address stated.',
  'Delivery dates are not guaranteed and Seller has no liability for damages that may be incurred due to any delay in shipment of goods hereunder. Taxes are excluded unless otherwise stated.'
]

export default function General() {
  pageTitle('General');
  // download page
  const invoicePage = useRef();
  
  // calculation
  const subTotal = tableData.reduce((total, item) => total + item.price * item.qty, 0);
  const taxPersent = 10;
  const taxAmount = subTotal * taxPersent / 100;
  const grandTotal = (subTotal + taxAmount);

  return (
    <>
      <div className="tm_invoice tm_style1" id="tm_download_section" ref={invoicePage}>
        <div className="tm_invoice_in">
          <Header
            logo='/images/logo.svg'
            title='Invoice'
          />
          <InvoiceInfo
            id='LL93784'
          />
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
            <div className="tm_round_border">
              <div className="tm_table_responsive">
                <Table data={tableData} itemCount={true}/>
              </div>
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
                  taxPersent={taxPersent} 
                  taxAmount={taxAmount} 
                  grandTotal={grandTotal}
                  borderBtm={true}
                />
              </div>
            </div>
          </div>
          <Terms 
            varient='tm_round_border'
            title='Terms & Conditions:' 
            data={termsAndCondition}
          />
        </div>
      </div>
      <Buttons  invoicePage={invoicePage}/>
    </>
  )
}
