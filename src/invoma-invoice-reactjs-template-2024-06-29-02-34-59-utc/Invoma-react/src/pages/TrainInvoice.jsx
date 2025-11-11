import { useRef } from "react";
import Buttons from "../components/buttons/Buttons";
import { pageTitle } from "../helper/helper";
import InvoiceToPayTo from "../components/invoiceToPayTo/InvoiceToPayTo";
import InvoiceInfo from "../components/invoiceInfo/InvoiceInfo";
import SubTotal from "../components/subTotal/SubTotal";
import PaymentInfo from "../components/paymentInfo/PaymentInfo";



export default function TrainInvoice() {
  pageTitle('Train Ticket');
  const invoicePage= useRef();

  // calculation
  const adult = 10;
  const child = 0;
  const costPerSit = 200;
  const subTotal = (adult + child) * costPerSit;
  const taxPersent = 10;
  const taxAmount = (subTotal * taxPersent) / 100;
  const grandTotal = subTotal + taxAmount;
  
  
  return (
    <>
      <div className="tm_invoice tm_style1" id="tm_download_section" ref={invoicePage}>
        <div className="tm_invoice_in">
          <div className="tm_invoice_head tm_align_center tm_mb20">
            <InvoiceToPayTo 
              title='Invoma Railway'
              subTitle='86-90 Paul Street, London
              <br />
              England EC2A 4NE <br />
              demo@gmail.com'
              varient='tm_invoice_left'
            />
            <div className="tm_invoice_right tm_text_right">
              <div className="tm_logo tm_size2">
                <img src="/images/logo.svg" alt="Logo" />
              </div>
            </div>
          </div>
          <InvoiceInfo id='654671'/>
          <div className="tm_grid_row tm_col_4 tm_padd_15_20 tm_round_border tm_mb30">
            <div className="tm_border_right tm_border_none_md">
              From Station: <br />
              <b className="tm_primary_color">Acton GTR at 3.20PM</b>
            </div>
            <div className="tm_border_right tm_border_none_md">
              To Station: <br />
              <b className="tm_primary_color">Acton GTR at 9.30PM</b>
            </div>
            <div className="tm_border_right tm_border_none_md">
              Journey Date: <br />
              <b className="tm_primary_color">24 July 2022</b>
            </div>
            <div>
              Seat No: <br />
              <b className="tm_primary_color">AC20, SC12, SC13</b>
            </div>
          </div>
          <div className="tm_table tm_style1">
            <div className="tm_round_border">
              <div className="tm_table_responsive">
                <table>
                  <tbody>
                    <tr>
                      <td className="tm_border_top_0">
                        <b className="tm_primary_color">Passenger Name:</b> Jhone Doe
                      </td>
                      <td className="tm_border_left tm_border_top_0">
                        <b className="tm_primary_color">Phone:</b> +98-123-321-234
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <b className="tm_primary_color">Email: </b>jhondoe@gmail.com
                      </td>
                      <td className="tm_border_left">
                        <b className="tm_primary_color">Address: </b>87 Spilman
                        Street, London, United Kingdom
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <b className="tm_primary_color">PNR Code:</b> M6DZT
                      </td>
                      <td className="tm_border_left">
                        <b className="tm_primary_color">Ticket Number:</b> #SM75692
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <b className="tm_primary_color">Train Name:</b> Bloom Lake
                        Railway
                      </td>
                      <td className="tm_border_left">
                        <b className="tm_primary_color">Quota: </b>General (GN)
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <b className="tm_primary_color">Class:</b> Ac Chair
                      </td>
                      <td className="tm_border_left">
                        <b className="tm_primary_color">Distance: </b> 1200km
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <b className="tm_primary_color">Adult:</b> {adult}
                      </td>
                      <td className="tm_border_left">
                        <b className="tm_primary_color">Child: </b>{child}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="tm_invoice_footer">
            <PaymentInfo
              varient='tm_left_footer'
              title='Payment Info'
              cardType='Cradit Card'
              cardNumber='236***********928'
              amount={grandTotal}
              author='Jhon Doe'
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
          <div className="tm_note tm_text_center tm_m0_md">
            <p className="tm_m0">
              Invoice was created on a computer and is valid without the signature and
              seal.
            </p>
          </div>
        </div>
      </div>
      <Buttons invoicePage={invoicePage}/>
    </>
  )
}
