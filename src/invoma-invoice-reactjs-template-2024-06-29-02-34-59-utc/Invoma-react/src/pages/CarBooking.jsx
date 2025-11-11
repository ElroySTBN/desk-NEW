import { useRef } from "react";
import Buttons from "../components/buttons/Buttons";
import { pageTitle } from "../helper/helper";
import HeaderStyle4 from "../components/header/HeaderStyle4";
import InvoiceInfoStyle6 from "../components/invoiceInfo/InvoiceInfoStyle6";
import SubTotalStyle2 from "../components/subTotal/SubTotalStyle2";
import PaymentInfo from "../components/paymentInfo/PaymentInfo";
import Footer from "../components/footer/Footer";
import Signature from "../components/widget/Signature";
import TableStyle15 from "../components/table/TableStyle15";

const headerData = [
  {
    icon : '/images/envolop.svg',
    subTitle : 'support@gmail.com <br/> career@gmail.com'
  },
  {
    icon : '/images/phone.svg',
    subTitle : '+99-131-124-567 <br/> Monday to Friday'
  },
  {
    icon : '/images/location.svg',
    subTitle : '9 Paul Street, London <br /> England EC2A 4NE'
  },
]

const tableData = [
  {
    item: 'Rate/ Per Day (Inclusive of theft protection and Collision Damage Waiver) ',
    price: '1000',
    qty: '2', 
  },
]


export default function CarBooking() {
  pageTitle('Car Booking');
  const invoicePage= useRef();

  // calculation
  const serviceCost = 25;
  const subTotal = tableData.reduce((total, item) => total + item.price * item.qty, 0) + serviceCost;
  const discountPersent = 15;
  const discountAmount = discountPersent != 0 ? subTotal * discountPersent / 100 : '';
  const taxPersent = 5;
  const taxAmount = (subTotal - discountAmount) * taxPersent / 100;
  const grandTotal = (subTotal - discountAmount) + taxAmount;
  
  return (
    <>
      <div className="tm_invoice tm_style2 tm_type1 tm_accent_border tm_radius_0" id="tm_download_section" ref={invoicePage}>
        <div className="tm_invoice_in">
          <HeaderStyle4
            logo='/images/logo_white.svg'
            data={headerData}
          />
          <InvoiceInfoStyle6
            id='#LL93784'
            total={grandTotal}
          />
          <div className="tm_grid_row tm_col_4 tm_col_2_md tm_invoice_info_in tm_round_border tm_mb30 tm_radius_0">
            <div>
              <span>Car And Model:</span> <br />
              <b className="tm_primary_color tm_medium">Creta - Hyundai</b>
            </div>
            <div>
              <span>Car Category:</span> <br />
              <b className="tm_primary_color tm_medium">Economy</b>
            </div>
            <div>
              <span>Car Type:</span> <br />
              <b className="tm_primary_color tm_medium">4 sit Economy</b>
            </div>
            <div>
              <span>Particular:</span> <br />
              <b className="tm_primary_color tm_medium">Car on self drive</b>
            </div>
            <div>
              <span>Rental Start Date:</span> <br />
              <b className="tm_primary_color tm_medium">24 July 2022</b>
            </div>
            <div>
              <span>Rental End Date:</span> <br />
              <b className="tm_primary_color tm_medium">25 July 2022</b>
            </div>
            <div>
              <span>Number of Day:</span> <br />
              <b className="tm_primary_color tm_medium">1</b>
            </div>
            <div>
              <span>Car Registration No:</span> <br />
              <b className="tm_primary_color tm_medium">DK98345</b>
            </div>
            <div>
              <span>Out Km:</span> <br />
              <b className="tm_primary_color tm_medium">1800Km</b>
            </div>
            <div>
              <span>In Km:</span> <br />
              <b className="tm_primary_color tm_medium">2100Km</b>
            </div>
            <div>
              <span>Total Km:</span> <br />
              <b className="tm_primary_color tm_medium">300Km</b>
            </div>
            <div>
              <span>Security Deposit:</span> <br />
              <b className="tm_primary_color tm_medium">$3000</b>
            </div>
          </div>
          <h2 className="tm_f16 tm_section_heading tm_border_color tm_mb0">
            <span className="tm_gray_bg tm_radius_0 tm_curve_35 tm_border tm_border_bottom_0">
              <span>Transfer Overview</span>
            </span>
          </h2>
          <div className="tm_table tm_style1 tm_mb30">
            <div className="tm_border tm_border_top_0">
              <div className="tm_table_responsive">
                <table>
                  <tbody>
                    <tr>
                      <td className="tm_width_6 tm_border_top_0">
                        <b className="tm_primary_color tm_medium">Driver Name: </b>
                        Jhon Doe
                      </td>
                      <td className="tm_width_6 tm_border_top_0 tm_border_left">
                        <b className="tm_primary_color tm_medium">
                          Driving Licence:{" "}
                        </b>{" "}
                        LC-25345
                      </td>
                    </tr>
                    <tr>
                      <td className="tm_width_6">
                        <b className="tm_primary_color tm_medium">Expire Date: </b>10
                        July 2026
                      </td>
                      <td className="tm_width_6 tm_border_left">
                        <b className="tm_primary_color tm_medium">Contact: </b>
                        +99-093-234-12
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="tm_table tm_style1">
            <div className="tm_border">
              <div className="tm_table_responsive">
                <TableStyle15
                  data={tableData}
                  serviceCost={serviceCost}
                />
              </div>
            </div>
            <div className="tm_invoice_footer tm_mb15 tm_m0_md">
              <PaymentInfo
                varient='tm_left_footer'
                title='Payment Info'
                cardType='Cradit Card'
                cardNumber='236***********928'
                amount={grandTotal}
                author='Jhon Doe'
              />
              <div className="tm_right_footer">
                <SubTotalStyle2
                  subTotal={subTotal}
                  discountAmount={discountAmount}
                  discountPersent={discountPersent}
                  taxPersent={taxPersent}
                  taxAmount={taxAmount}
                  grandTotal={grandTotal}
                  gtBg='tm_accent_bg'
                  gtColor='tm_white_color'
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
          <Footer
            title='Thank you for your business.'
            termsTitle='Terms And Condition'
            termsSubTitle='IInvoice was created on a computer and is valid without the signature and seal.'
            logo='/images/logo.svg'
          />
        </div>
      </div>
      <Buttons invoicePage={invoicePage}/>
    </>
  )
}
