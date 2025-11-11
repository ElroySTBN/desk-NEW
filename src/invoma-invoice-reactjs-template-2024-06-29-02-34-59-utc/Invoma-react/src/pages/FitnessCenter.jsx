import { useRef } from "react";
import Buttons from "../components/buttons/Buttons";
import { pageTitle } from "../helper/helper";
import Footer from "../components/footer/Footer";
import Signature from "../components/widget/Signature";
import SubTotalStyle2 from "../components/subTotal/SubTotalStyle2";
import HeaderStyle4 from "../components/header/HeaderStyle4";
import InvoiceToPayToStyle2 from "../components/invoiceToPayTo/InvoiceToPayToStyle2";
import InvoiceInfoStyle2 from "../components/invoiceInfo/InvoiceInfoStyle2";
import Note from "../components/widget/Note";
import TableStyle18 from "../components/table/TableStyle18";

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
    item: 'AB Workout',
    price: '50',
    hours: '12', 
  },
  {
    item: 'Swimming Instructor Fee',
    price: '35',
    hours: '5',
  },
  {
    item: 'Massage Therapy',
    price: '100',
    hours: '2', 
  },
  {
    item: 'Morning Yoga',
    price: '50',
    hours: '4', 
  },
]

export default function FitnessCenter() {
  pageTitle('Fitness Center');
  const invoicePage= useRef();

    // calculation
    const subTotal = tableData.reduce((total, item) => total + item.price * item.hours, 0);
    const discountPersent = 10;
    const discountAmount = discountPersent != 0 ? subTotal * discountPersent / 100 : '';
    const taxPersent = 5;
    const taxAmount = (subTotal - discountAmount) * taxPersent / 100;
    const grandTotal = (subTotal - discountAmount) + taxAmount;
  
  return (
    <>
      <div className="tm_invoice tm_style2 tm_type1 tm_accent_border" id="tm_download_section"  ref={invoicePage}>
        <div className="tm_invoice_in">
          <HeaderStyle4
            logo='/images/logo_white.svg'
            data={headerData}
          />
          <div className="tm_invoice_info tm_mb10">
            <div className="tm_invoice_info_left">
              <InvoiceToPayToStyle2
                titleUp='Invoice To'
                title='Lowell H. Dominguez'
                subTitle='84 Spilman Street, London <br />
                United Kingdom. <br />
                lowell@gmail.com <br />
                +99-327-123-987'
              />
            </div>
            <div className="tm_invoice_info_right">
              <InvoiceInfoStyle2 
                title='Invoice'
                grandTotal={grandTotal}
                id='#LL93784'
                titleColor='tm_primary_color'
                subTitleColor='tm_primary_color_60'
                border='tm_round_border'
              />
            </div>
          </div>
          <div className="tm_table tm_style1">
            <div className="tm_round_border">
              <div className="tm_table_responsive">
                <TableStyle18 data={tableData}/>
              </div>
            </div>
            <div className="tm_invoice_footer tm_mb15 tm_m0_md">
              <div className="tm_left_footer">
                <Note 
                  title='Payment Information'
                  desc='PayPal: invoma@gmail.com <br/>
                  Account Number: 983782'
                />
              </div>
              <div className="tm_right_footer">
                <SubTotalStyle2
                  subTotal={subTotal}
                  discountAmount={discountAmount}
                  discountPersent={discountPersent}
                  taxPersent={taxPersent}
                  taxAmount={taxAmount}
                  grandTotal={grandTotal}
                  gtBg='tm_accent_bg_10'
                  gtColor='tm_accent_color'
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
