import { handleDownload } from "../../helper/helper";

export default function Buttons({invoicePage}) {
  return (
    <div className="tm_invoice_btns tm_hide_print">
      <a href="javascript:window.print()" className="tm_invoice_btn tm_color1">
        <span className="tm_btn_icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="ionicon"
            viewBox="0 0 512 512"
          >
            <path
              d="M384 368h24a40.12 40.12 0 0040-40V168a40.12 40.12 0 00-40-40H104a40.12 40.12 0 00-40 40v160a40.12 40.12 0 0040 40h24"
              fill="none"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth={32}
            />
            <rect
              x={128}
              y={240}
              width={256}
              height={208}
              rx="24.32"
              ry="24.32"
              fill="none"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth={32}
            />
            <path
              d="M384 128v-24a40.12 40.12 0 00-40-40H168a40.12 40.12 0 00-40 40v24"
              fill="none"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth={32}
            />
            <circle cx={392} cy={184} r={24} fill="currentColor" />
          </svg>
        </span>
        <span className="tm_btn_text">Print</span>
      </a>
      <button id="tm_download_btn" className="tm_invoice_btn tm_color2" onClick={()=>handleDownload(invoicePage)}>
        <span className="tm_btn_icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="ionicon"
            viewBox="0 0 512 512"
          >
            <path
              d="M320 336h76c55 0 100-21.21 100-75.6s-53-73.47-96-75.6C391.11 99.74 329 48 256 48c-69 0-113.44 45.79-128 91.2-60 5.7-112 35.88-112 98.4S70 336 136 336h56M192 400.1l64 63.9 64-63.9M256 224v224.03"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={32}
            />
          </svg>
        </span>
        <span className="tm_btn_text">Download</span>
      </button>
    </div>
  )
}
