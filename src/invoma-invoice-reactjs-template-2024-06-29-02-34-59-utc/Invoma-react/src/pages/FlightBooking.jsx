import { useRef } from "react";
import Buttons from "../components/buttons/Buttons";
import { currentDate5, pageTitle } from "../helper/helper";
import TermsStyle6 from "../components/termsAndConditions/TermsStyle6";
import SubTotal from "../components/subTotal/SubTotal";
import TableStyle14 from "../components/table/TableStyle14";


const tableData = [
  {
    flightDetails: 'Air canada 1S-2539 Toronto- New York Date: 25 Feb 2022, Sat 8:30AM',
    class: 'Business',
    price: '850',
    discount: '15',
  },
  {
    flightDetails: 'Air canada 1S-2539 Toronto- New York Date: 25 Feb 2022, Sat 8:30AM',
    class: 'Economy',
    price: '580',
    discount: '',
  },
]

const termsAndCondition = [
  '10% cancellation charge will be applied on total',
  'Its your responsibility if you miss that flight.',
  'Invoice is valid without the signature and seal.'
]



export default function FlightBooking() {
  pageTitle('Flight Booking');
  const invoicePage= useRef();

  // calculation
  const subTotal = tableData.reduce((total, item) => total + ((item.price)-((item.price * item.discount)/100)), 0);
  const taxPersent = 10;
  const taxAmount = subTotal * taxPersent / 100;
  const grandTotal = (subTotal + taxAmount);
  
  return (
    <>
      <div className="tm_invoice tm_style1" id="tm_download_section" ref={invoicePage}>
        <div className="tm_invoice_in">
          <div className="tm_invoice_head tm_mb20 tm_align_center">
            <div className="tm_invoice_left">
              <div className="tm_logo">
                <img src="/images/logo.svg" alt="Logo" />
              </div>
            </div>
            <div className="tm_invoice_right tm_text_right">
              <div className="tm_primary_color tm_f30 tm_medium">
                From Toronto To NewYork
              </div>
            </div>
          </div>
          <div className="tm_invoice_info tm_mb30">
            <div className="tm_invoice_seperator tm_gray_bg" />
            <div className="tm_invoice_info_list">
              <p className="tm_invoice_number tm_m0">
                Invoice No: <b className="tm_primary_color">#LL93784</b>
              </p>
              <p className="tm_invoice_date tm_m0">
                Booking Date: <b className="tm_primary_color">{currentDate5()}</b>
              </p>
            </div>
          </div>
          <div className="tm_table tm_style1 tm_mb30">
            <div className="tm_round_border">
              <div className="tm_table_responsive">
                <table>
                  <thead>
                    <tr>
                      <th className="tm_gray_bg tm_primary_color">
                        Passenger And Ticket Information
                      </th>
                      <th className="tm_gray_bg tm_primary_color tm_border_left">
                        Payment Information
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <b className="tm_primary_color">Passenger Name:</b> Jhon Doe
                      </td>
                      <td className="tm_border_left">
                        <b className="tm_primary_color">Payment Gatway:</b> American
                        Express
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <b className="tm_primary_color">Journy Date:</b> 28 July 2022,
                        Sat 8:30AM
                      </td>
                      <td className="tm_border_left">
                        <b className="tm_primary_color">Paid Date:</b> 28 July 2022
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <b className="tm_primary_color">Ticket Number:</b> A12
                      </td>
                      <td className="tm_border_left">
                        <b className="tm_primary_color">Transaction ID:</b> TI2398736
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <b className="tm_primary_color">Booking Reference:</b> HC76SW
                      </td>
                      <td className="tm_border_left">
                        <b className="tm_primary_color">Total Amount:</b> $2440
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="tm_table tm_style1 tm_mb30">
            <div className="tm_round_border">
              <div className="tm_table_responsive">
                <TableStyle14 data={tableData} />
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
          <p className="tm_m0 tm_text_center tm_primary_color">
            Thank you for purchasing the ticket, have a safe journey 🙂
          </p>
        </div>
      </div>
      <Buttons invoicePage={invoicePage}/>
    </>
  )
}
