import { useRef } from "react";
import Buttons from "../components/buttons/Buttons";
import { currentDate5, pageTitle } from "../helper/helper";
import Header from "../components/header/Header";
import TableStyle12 from "../components/table/TableStyle12";
import InvoiceToPayTo from "../components/invoiceToPayTo/InvoiceToPayTo";
import SubTotalStyle9 from "../components/subTotal/SubTotalStyle9";
import TermsStyle6 from "../components/termsAndConditions/TermsStyle6";


const tableData = [
  {
    item: 'Full Board and Lodging',
    desc: '',
    price: '4000',
    qty: '5', 
  },
  {
    item: 'Rental Car 1 Week',
    desc: 'SUV with $75 per week charges',
    price: '420',
    qty: '2', 
  },
  {
    item: 'Tour, Concert Tickets and Other Rentals',
    desc: 'A package for 6 individuals $350 each',
    price: '450',
    qty: '3', 
  },
  {
    item: 'Air Transport',
    desc: '5 return tickets',
    price: '500',
    qty: '1', 
  },
]

const termsAndCondition = [
  '10% cancellation charge will be applied on total',
  'Its your responsibility if you miss that flight.',
]

export default function TravelAgency() {
  pageTitle('Travel Agency');
  const invoicePage= useRef();

  // calculation
  const subTotal = tableData.reduce((total, item) => total + item.price * item.qty, 0);
  const discountPersent = 10;
  const discountAmount = discountPersent != 0 ? subTotal * discountPersent / 100 : '';
  const taxPersent = 15;
  const taxAmount = (subTotal - discountAmount) * taxPersent / 100;
  const grandTotal = (subTotal - discountAmount) + taxAmount;
  
  return (
    <>
      <div className="tm_invoice tm_style1" id="tm_download_section" ref={invoicePage}>
        <div className="tm_invoice_in">
          <Header
            logo='/images/logo.svg'
            title='Invoice'
          />
          <div className="tm_invoice_info tm_mb20">
            <div className="tm_invoice_seperator tm_gray_bg" />
            <div className="tm_invoice_info_list">
              <p className="tm_invoice_number tm_m0">
                Invoice No: <b className="tm_primary_color">#LL93784</b>
              </p>
              <p className="tm_invoice_number tm_m0">
                Invoice Date: <b className="tm_primary_color">{currentDate5()}</b>
              </p>
              <p className="tm_invoice_date tm_m0">
                Journy Date: <b className="tm_primary_color">01.10.2022</b>
              </p>
            </div>
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
              86-90 Paul Street, London <br />
              England EC2A 4NE <br />
              demo@gmail.com'
            />
          </div>
          <div className="tm_table tm_style1">
            <div className="tm_round_border">
              <div className="tm_table_responsive">
                <TableStyle12 data={tableData} />
              </div>
            </div>
            <div className="tm_invoice_footer">
              <div className="tm_left_footer">
                <TermsStyle6 
                  title='Terms And Condition'
                  data={termsAndCondition}
                />
              </div>
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
        </div>
      </div>
      <Buttons invoicePage={invoicePage}/>
    </>
  )
}
