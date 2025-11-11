import { useRef } from "react";
import Buttons from "../components/buttons/Buttons";
import { currentDate3, pageTitle } from "../helper/helper";
import TableStyle12 from "../components/table/TableStyle12";
import Signature from "../components/widget/Signature";
import SubTotal from "../components/subTotal/SubTotal";
import InvoiceToPayToStyle6 from "../components/invoiceToPayTo/InvoiceToPayToStyle6";

const tableData = [
  {
    item: 'Laser Mouse',
    desc: '',
    price: '150',
    qty: '3',
  },
  {
    item: 'Dual XL Monitors',
    desc: '',
    price: '300',
    qty: '1',
  },
  {
    item: 'Multi-jet Printer',
    desc: '',
    price: '350',
    qty: '3',
  },
  {
    item: 'USB Cable',
    desc: '',
    price: '5',
    qty: '2',
  },
]

export default function BusinessInvoice() {
  pageTitle('Business');
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
          <div className="tm_invoice_head tm_mb20">
            <div className="tm_invoice_left">
              <div className="tm_logo tm_size1">
                <img src="/images/logo.svg" alt="Logo" />
              </div>
            </div>
            <div className="tm_invoice_right tm_text_right">
              <b className="tm_f20 tm_medium tm_primary_color">Laralink Ltd</b>
              <p className="tm_m0 tm_f12">
                86-90 Paul Street, London <br />
                England EC2A 4NE
              </p>
            </div>
          </div>
          <hr className="tm_mb8" />
          <div className="tm_flex tm_flex_column_sm tm_justify_between tm_align_center tm_align_start_sm tm_medium tm_mb10">
            <p className="tm_m0">
              Airway Bill No: <br />
              <b className="tm_primary_color">D0129888</b>
            </p>
            <p className="tm_m0">
              Invoice No: <br />
              <b className="tm_primary_color">LL098342</b>
            </p>
            <p className="tm_m0">
              Invoice Date: <br />
              <b className="tm_primary_color">{currentDate3()}</b>
            </p>
            <p className="tm_m0">
              Date of Export: <br />
              <b className="tm_primary_color">15 August 2022</b>
            </p>
          </div>
          <hr className="tm_mb20" />
          <div className="tm_box_3 tm_mb20">
            <InvoiceToPayToStyle6 
              title='Exporter / Shipper:'
              company='ABC Company'
              address='84 Spilman Street, London <br />
              England EC2A 4NE'
              name='Jhon Doe'
              phone='543-123-4329'
              email='abc@gmail.com'
              destination='United Kingdom'
            />
            <InvoiceToPayToStyle6 
              title='Ship To / Cosignee'
              company='Laralink Ltd'
              address='86-90 Paul Street, London <br />
              England EC2A 4NE'
              name='Lowell H. Dominguez'
              phone='324-123-2341'
              email='laralink007@gmail.com'
              destination='United Kingdom'
            />
          </div>
          <div className="tm_table tm_style1">
            <div className="tm_border">
              <div className="tm_table_responsive">
                <TableStyle12 data={tableData} />
              </div>
            </div>
            <div className="tm_invoice_footer tm_mb30 tm_m0_md">
              <div className="tm_left_footer">
                <p className="tm_mb2">
                  Total Weight: <b className="tm_primary_color">40kg</b>
                </p>
                <p className="tm_m0">
                  Shipment Terms: <b className="tm_primary_color">DDU</b>
                </p>
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
        </div>
      </div>
      <Buttons invoicePage={invoicePage} />
    </>
  )
}
