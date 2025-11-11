import { useRef } from "react";
import Buttons from "../components/buttons/Buttons";
import { currentDate5, pageTitle } from "../helper/helper";
import TableStyle12 from "../components/table/TableStyle12";
import PaymentInfo from "../components/paymentInfo/PaymentInfo";
import Header from "../components/header/Header";
import InvoiceToPayTo from "../components/invoiceToPayTo/InvoiceToPayTo";
import SubTotalStyle9 from "../components/subTotal/SubTotalStyle9";
import Terms from "../components/termsAndConditions/Terms";

const tableData = [
  {
    item: 'Toilet Cleaning',
    desc: '',
    price: '20',
    qty: '3',
  },
  {
    item: 'Floor & Windows Cleaning',
    desc: '',
    price: '60',
    qty: '1',
  },
  {
    item: 'Bedroom Cleaning',
    desc: '',
    price: '200',
    qty: '3',
  },
  {
    item: 'Kitchen Cleaning',
    desc: '',
    price: '100',
    qty: '2',
  },
]

const termsAndCondition = [
  'All claims relating to quantity or shipping errors shall be waived by Buyer unless made in writing to Seller within thirty (30) days after delivery of goods to the address stated.',
  'Delivery dates are not guaranteed and Seller has no liability for damages that may be incurred due to any delay in shipment of goods hereunder. Taxes are excluded unless otherwise stated.'
]

export default function CleaningServiceInvoice() {
  pageTitle('Cleaning Service');
  const invoicePage = useRef();

  // calculation
  const subTotal = tableData.reduce((total, item) => total + item.price * item.qty, 0);
  const discountPersent = 15;
  const discountAmount = discountPersent != 0 ? subTotal * discountPersent / 100 : '';
  const taxPersent = 10;
  const taxAmount = (subTotal - discountAmount) * taxPersent / 100;
  const grandTotal = (subTotal - discountAmount) + taxAmount;

  return (
    <>
      <div className="tm_invoice tm_style1" id="tm_download_section" ref={invoicePage}>
        <div className="tm_invoice_in">
          <Header logo='/images/logo.svg' title='Invoice' />
          <div className="tm_invoice_info_2 tm_mb20">
            <p className="tm_invoice_number tm_m0">
              Invoice No: <b className="tm_primary_color">#LL93784</b>
            </p>
            <p className="tm_invoice_date tm_m0">
              Date: <b className="tm_primary_color">{currentDate5()}</b>
            </p>
          </div>
          <div className="tm_invoice_head tm_mb10">
            <InvoiceToPayTo
              varient='tm_invoice_left' 
              title='Invoice To'
              subTitle=' Lowell H. Dominguez <br />
              84 Spilman Street, London <br />
              United Kingdom <br />
              lowell@gmail.com'
            />
            <InvoiceToPayTo
              varient='tm_invoice_right tm_text_right' 
              title='Pay To'
              subTitle='Laralink Ltd <br />
              86-90 Paul Street, London
              <br />
              England EC2A 4NE <br />
              demo@gmail.com'
            />
          </div>
          <div className="tm_table tm_style1 tm_mb40">
            <div className="tm_round_border">
              <div className="tm_table_responsive">
                <TableStyle12 data={tableData} />
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
                <SubTotalStyle9
                  subTotal={subTotal} 
                  taxPersent={taxPersent} 
                  taxAmount={taxAmount} 
                  grandTotal={grandTotal}
                  borderBtm={true}
                  discountPersent={discountPersent}
                  discountAmount={discountAmount}
                />
              </div>
            </div>
          </div>
          <Terms
            varient=''
            title='Terms & Conditions:' 
            data={termsAndCondition}
          />
        </div>
      </div>
      <Buttons invoicePage={invoicePage} />
    </>
  )
}
