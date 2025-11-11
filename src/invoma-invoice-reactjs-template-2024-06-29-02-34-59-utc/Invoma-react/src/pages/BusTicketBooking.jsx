import { useRef } from "react";
import Buttons from "../components/buttons/Buttons";
import { currentDate5, pageTitle } from "../helper/helper";


export default function BusTicketBooking() {
  pageTitle('Bus Ticket Booking');
  const invoicePage= useRef();

  // calculation
  const numberOfSit = 2;
  const costPerSit = 300;
  const discount = 50;
  const grandTotal = ((numberOfSit * costPerSit) - discount);
  
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
          <div className="tm_table tm_style1 tm_mb20">
            <div className="tm_round_border">
              <div className="tm_table_responsive">
                <table>
                  <tbody>
                    <tr>
                      <td className="tm_border_top_0">
                        From: <b className="tm_primary_color">Toronto</b>
                      </td>
                      <td className="tm_border_left tm_border_top_0">
                        To: <b className="tm_primary_color">NewYork</b>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Passenger Name: <b className="tm_primary_color">Jhone Doe</b>
                      </td>
                      <td className="tm_border_left">
                        Passenger Mobile:{" "}
                        <b className="tm_primary_color">+99 094 763 267</b>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Address:{" "}
                        <b className="tm_primary_color">
                          237 Roanoke Road, North York
                        </b>
                      </td>
                      <td className="tm_border_left">
                        Coach No: <b className="tm_primary_color">103DHK</b>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Bus Type: <b className="tm_primary_color">Volvo AC</b>
                      </td>
                      <td className="tm_border_left">
                        Ticket Pnr: <b className="tm_primary_color">345345-765347</b>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Seat No: <b className="tm_primary_color">A1, A2</b>
                      </td>
                      <td className="tm_border_left">
                        Journey Date: <b className="tm_primary_color">05 Feb 2022</b>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Department Time: <b className="tm_primary_color">8:30 AM</b>{" "}
                      </td>
                      <td className="tm_border_left">
                        Arrive Time: <b className="tm_primary_color">12:30 PM</b>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Seat Fare:{" "}
                        <b className="tm_primary_color">
                          ${costPerSit} <span className="tm_ternary_color">X</span> {numberOfSit} = ${numberOfSit * costPerSit}
                        </b>{" "}
                      </td>
                      <td className="tm_border_left">
                        Discount: <b className="tm_primary_color">${discount}</b>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="tm_gray_bg tm_text_center tm_f18 tm_primary_color tm_round_border tm_mb25 tm_grand_total">
            <b>Total Fare:</b>
            <b>${grandTotal}</b>
          </div>
          <div className="tm_mb25">
            <p className="tm_primary_color tm_mb5 tm_bold">Terms And Condition</p>
            <div className="tm_grid_row tm_col_2">
              <div className="tm_border_right tm_border_none_sm">
                <ul className="tm_m0">
                  <li>When traveling, keep a printout of your ticket.</li>
                  <li>Please keep your id proof when travel.</li>
                  <li>
                    Come to the bus counter 5 minutes before <br /> the bus leaves
                  </li>
                </ul>
              </div>
              <div>
                <ul className="tm_m0">
                  <li>A person cannot take more than 30 kg of luggage.</li>
                  <li>There is no return policy on special occasions.</li>
                  <li>
                    To return the ticket, you must be informed <br />
                    at least 2 hours in advance
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <hr className="tm_mb30" />
          <p className="tm_m0 tm_text_center">
            <b className="tm_primary_color tm_f16">Invoma Ltd</b> <br />
            842/21 Spilman Street, London, United Kingdom <br />
            <b>Hotline:</b> 123456, <b>Email:</b> support@gmail.com
          </p>
        </div>
      </div>
      <Buttons invoicePage={invoicePage}/>
    </>
  )
}
