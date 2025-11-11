import { useRef } from "react";
import Buttons from "../components/buttons/Buttons";
import { currentDate3, pageTitle } from "../helper/helper";
import TermsStyle4 from "../components/termsAndConditions/TermsStyle4";
import PaymentInfo from "../components/paymentInfo/PaymentInfo";
import SubTotalStyle2 from "../components/subTotal/SubTotalStyle2";
import TableStyle16 from "../components/table/TableStyle16";
import HeaderStyle2 from "../components/header/HeaderStyle2";

const headerData = [
  {
    title : 'Email',
    subTitle : 'support@gmail.com <br/> career@gmail.com'
  },
  {
    title : 'Phone',
    subTitle : '+99-131-124-567 <br/> Monday to Friday'
  },
  {
    title : 'Address',
    subTitle : '9 Paul Street, London <br /> England EC2A 4NE'
  },
]

const tableData = [
  {
    item: 'Full checkup',
    desc: 'Full body checkup',
    price: '500',
    qty: '3',
  },
  {
    item: 'Ear and threat examination',
    desc: 'Infection check due to infiammation',
    price: '200',
    qty: '1',
  },
  {
    item: 'Consultant Neurologists',
    desc: 'Dr. Mike Seri appointment',
    price: '300',
    qty: '2',
  },
]

export default function MedicalInvoice() {
  pageTitle('Medical');
  const invoicePage= useRef();

  // calculation
  const subTotal = tableData.reduce((total, item) => total + parseFloat(item.price), 0);
  const discountPersent = 25;
  const discountAmount = discountPersent != 0 ? subTotal * discountPersent / 100 : '';
  const taxPersent = 10;
  const taxAmount = (subTotal - discountAmount) * taxPersent / 100;
  const grandTotal = (subTotal - discountAmount) + taxAmount;
  
  return (
    <>
      <div className="tm_invoice tm_style2" id="tm_download_section" ref={invoicePage}>
        <div className="tm_invoice_in">
          <HeaderStyle2
            logo='/images/logo.svg'
            data={headerData}
          />
          <div className="tm_grid_row tm_col_4 tm_col_2_md tm_invoice_info_in tm_gray_bg tm_mb30 tm_round_border">
            <div>
              <span>Invoice No:</span> <br />
              <span className="tm_primary_color">#LL93784</span>
            </div>
            <div>
              <span>Date:</span> <br />
              <span className="tm_primary_color">{currentDate3()}</span>
            </div>
            <div>
              <span>Services:</span> <br />
              <span className="tm_primary_color">Full checkup</span>
            </div>
            <div>
              <span>Patient Name:</span> <br />
              <span className="tm_primary_color">Jhon Doe</span>
            </div>
            <div>
              <span>Patient Number:</span> <br />
              <span className="tm_primary_color">+99 987 767 234</span>
            </div>
            <div>
              <span>Date of Birth:</span> <br />
              <span className="tm_primary_color">35 Years</span>
            </div>
            <div>
              <span>Insurence Billed:</span> <br />
              <span className="tm_primary_color">ER4</span>
            </div>
            <div>
              <span>Address:</span> <br />
              <span className="tm_primary_color">8 Spilman Street, London</span>
            </div>
          </div>
          <div className="tm_table tm_style1 tm_mb40">
            <div className="tm_round_border">
              <div className="tm_table_responsive">
                <TableStyle16 data={tableData}/>
              </div>
            </div>
            <div className="tm_invoice_footer">
              <PaymentInfo
                varient='tm_left_footer'
                title='Pay By'
                cardType='Credit Card'
                cardNumber='236***********928'
                amount={grandTotal}
              />
              <div className="tm_right_footer">
                <SubTotalStyle2
                  subTotal={subTotal}
                  discountAmount={discountAmount}
                  discountPersent={discountPersent}
                  taxPersent={taxPersent}
                  taxAmount={taxAmount}
                  grandTotal={grandTotal}
                  gtBg='tm_primary_bg '
                  gtColor='tm_white_color '
                />
              </div>
            </div>
          </div>
          <TermsStyle4 
            varient='tm_padd_15_20 tm_round_border'
            title='Additional info'
            subTitle="Here you can write additional notes for the client to get a better
            understanding of this invoice.
            <br />
            Invoice was created on a computer and is valid without the signature and
            seal. <br />
            Please take all services within 15 days, otherwise, it will be invalid."
          />
        </div>
      </div>
      <Buttons invoicePage={invoicePage}/>
    </>
  )
}
