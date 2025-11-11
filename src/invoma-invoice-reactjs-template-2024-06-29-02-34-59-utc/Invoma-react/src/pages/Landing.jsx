import DemoViewer from "../components/widget/DemoViewer"
import { Link as ScrollLink } from 'react-scroll';

const generalDemos = [
  {
    title: 'General style 1',
    imgUrl: './images/landing/demo/general_1.jpeg',
    path: '/',
  },
  {
    title: 'General style 2',
    imgUrl: './images/landing/demo/general_2.jpeg',
    path: '/general_2',
  },
  {
    title: 'General style 3',
    imgUrl: './images/landing/demo/general_3.jpeg',
    path: '/general_3',
  },
  {
    title: 'General style 4',
    imgUrl: './images/landing/demo/general_4.jpeg',
    path: '/general_4',
  },
  {
    title: 'General style 5',
    imgUrl: './images/landing/demo/general_5.jpeg',
    path: '/general_5',
  },
  {
    title: 'General style 6',
    imgUrl: './images/landing/demo/general_6.jpeg',
    path: '/general_6',
  },
  {
    title: 'General style 7',
    imgUrl: './images/landing/demo/general_7.jpeg',
    path: '/general_7',
  },
  {
    title: 'General style 8',
    imgUrl: './images/landing/demo/general_8.jpeg',
    path: '/general_8',
  },
  {
    title: 'General style 9',
    imgUrl: './images/landing/demo/general_9.jpeg',
    path: '/general_9',
  },
  {
    title: 'General style 10',
    imgUrl: './images/landing/demo/general_10.jpeg',
    path: '/general_10',
  },
  {
    title: 'General style 11',
    imgUrl: './images/landing/demo/general_11.jpeg',
    path: '/general_11',
  },
]

const categoryDemos = [
  {
    title: 'eCommerce invoice',
    imgUrl: './images/landing/demo/demo_1.jpeg',
    path: '/ecommerce_invoice',
  },
  {
    title: 'Movie ticket booking',
    imgUrl: './images/landing/demo/demo_2.jpeg',
    path: '/movie_ticket_booking',
  },
  {
    title: 'Coffee Shop invoice',
    imgUrl: './images/landing/demo/demo_3.jpeg',
    path: '/coffee_shop_invoice',
  },
  {
    title: 'Hotel booking invoice',
    imgUrl: './images/landing/demo/demo_4.jpeg',
    path: '/hotel_booking',
  },
  {
    title: 'Money exchange invoice',
    imgUrl: './images/landing/demo/demo_5.jpeg',
    path: '/money_exchange',
  },
  {
    title: 'Travel agency invoice',
    imgUrl: './images/landing/demo/demo_6.jpeg',
    path: '/travel_agency',
  },
  {
    title: 'Flight booking invoice',
    imgUrl: './images/landing/demo/demo_7.jpeg',
    path: '/flight_booking',
  },
  {
    title: 'Bus ticket booking invoice',
    imgUrl: './images/landing/demo/demo_8.jpeg',
    path: '/bus_ticket_booking',
  },
  {
    title: 'Train ticket booking invoice',
    imgUrl: './images/landing/demo/demo_9.jpeg',
    path: '/train_invoice',
  },
  {
    title: 'Car booking invoice',
    imgUrl: './images/landing/demo/demo_10.jpeg',
    path: '/car_booking',
  },
  {
    title: 'Medical invoice',
    imgUrl: './images/landing/demo/demo_11.jpeg',
    path: '/medical_invoice',
  },
  {
    title: 'Internet billing invoice',
    imgUrl: './images/landing/demo/demo_12.jpeg',
    path: '/internet_billing',
  },
  {
    title: 'Fitness center invoice',
    imgUrl: './images/landing/demo/demo_13.jpeg',
    path: '/fitness_center',
  },
  {
    title: 'Domain & hosting invoice',
    imgUrl: './images/landing/demo/demo_14.jpeg',
    path: '/domain_hosting',
  },
  {
    title: 'Student billing invoice',
    imgUrl: './images/landing/demo/demo_15.jpeg',
    path: '/student_billing',
  },
  {
    title: 'Restaurant invoice',
    imgUrl: './images/landing/demo/demo_16.jpeg',
    path: '/restaurant_invoice',
  },
  {
    title: 'Cleaning service invoice',
    imgUrl: './images/landing/demo/demo_17.jpeg',
    path: '/cleaning_service_invoice',
  },
  {
    title: 'Photostudio invoice',
    imgUrl: './images/landing/demo/demo_18.jpeg',
    path: '/photostudio_invoice',
  },
  {
    title: 'Real estate invoice',
    imgUrl: './images/landing/demo/demo_19.jpeg',
    path: '/real_estate_invoice',
  },
  {
    title: 'Business invoice',
    imgUrl: './images/landing/demo/demo_20.jpeg',
    path: '/business_invoice',
  },
]

export default function Landing() {
  return (
    <>
      <div className="tm_header">
        <div className="tm_landing_container">
          <div className="tm_header_in">
            <ScrollLink to="hero" spy={true} smooth={true} offset={-80} duration={500} activeClass="active"  className="tm_brand tm_accent_color" >
              <svg
                width={104}
                height={79}
                viewBox="0 0 104 79"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M63.9201 52.2119H39.4899L51.7049 32.7689L63.9201 52.2119ZM67.7888 7.16767L96.0871 52.2119H68.4239L53.9563 29.1848L67.7888 7.16767ZM102.97 56L67.7888 1.19209e-06L51.7049 25.6012L35.6211 1.19209e-06L1 55.107H5.50326L35.6211 7.16767L49.453 29.1848L32.6068 56H102.97Z"
                  fill="black"
                />
                <path
                  d="M2.99432 62.6364V75H1.49716V62.6364H2.99432ZM15.8002 62.6364V75H14.3513L7.61408 65.2926H7.49334V75H5.99618V62.6364H7.44505L14.2064 72.3679H14.3271V62.6364H15.8002ZM19.3031 62.6364L22.9735 73.044H23.1184L26.7889 62.6364H28.3585L23.8187 75H22.2733L17.7335 62.6364H19.3031ZM40.135 68.8182C40.135 70.1222 39.8996 71.2491 39.4287 72.1989C38.9578 73.1487 38.3119 73.8812 37.4909 74.3963C36.6698 74.9115 35.7321 75.169 34.6776 75.169C33.6232 75.169 32.6855 74.9115 31.8644 74.3963C31.0434 73.8812 30.3975 73.1487 29.9266 72.1989C29.4557 71.2491 29.2203 70.1222 29.2203 68.8182C29.2203 67.5142 29.4557 66.3873 29.9266 65.4375C30.3975 64.4877 31.0434 63.7552 31.8644 63.2401C32.6855 62.7249 33.6232 62.4673 34.6776 62.4673C35.7321 62.4673 36.6698 62.7249 37.4909 63.2401C38.3119 63.7552 38.9578 64.4877 39.4287 65.4375C39.8996 66.3873 40.135 67.5142 40.135 68.8182ZM38.6862 68.8182C38.6862 67.7476 38.5071 66.8441 38.1489 66.1076C37.7947 65.3711 37.3138 64.8137 36.7061 64.4354C36.1024 64.0571 35.4262 63.8679 34.6776 63.8679C33.9291 63.8679 33.2509 64.0571 32.6432 64.4354C32.0395 64.8137 31.5586 65.3711 31.2004 66.1076C30.8462 66.8441 30.6691 67.7476 30.6691 68.8182C30.6691 69.8887 30.8462 70.7923 31.2004 71.5288C31.5586 72.2653 32.0395 72.8227 32.6432 73.201C33.2509 73.5793 33.9291 73.7685 34.6776 73.7685C35.4262 73.7685 36.1024 73.5793 36.7061 73.201C37.3138 72.8227 37.7947 72.2653 38.1489 71.5288C38.5071 70.7923 38.6862 69.8887 38.6862 68.8182ZM42.6524 62.6364H44.4394L48.6411 72.8991H48.786L52.9877 62.6364H54.7746V75H53.374V65.6065H53.2533L49.3896 75H48.0374L44.1737 65.6065H44.053V75H42.6524V62.6364ZM58.2836 75H56.714L61.2537 62.6364H62.7992L67.339 75H65.7694L62.0748 64.5923H61.9782L58.2836 75ZM58.8631 70.1705H65.1898V71.4986H58.8631V70.1705ZM74.046 75V62.6364H75.5431V73.6719H81.2903V75H74.046ZM81.2888 63.9645V62.6364H90.5615V63.9645H86.6737V75H85.1766V63.9645H81.2888ZM96.6875 75H92.8722V62.6364H96.8565C98.0559 62.6364 99.0821 62.8839 99.9354 63.3789C100.789 63.8699 101.443 64.5762 101.897 65.4979C102.352 66.4155 102.58 67.5142 102.58 68.794C102.58 70.0819 102.35 71.1907 101.891 72.1204C101.433 73.046 100.764 73.7584 99.8871 74.2575C99.0097 74.7525 97.9432 75 96.6875 75ZM94.3693 73.6719H96.5909C97.6132 73.6719 98.4603 73.4747 99.1325 73.0803C99.8046 72.6858 100.306 72.1244 100.636 71.396C100.966 70.6675 101.131 69.8002 101.131 68.794C101.131 67.7959 100.968 66.9367 100.642 66.2163C100.316 65.4918 99.8287 64.9364 99.1808 64.5501C98.5328 64.1597 97.7259 63.9645 96.7599 63.9645H94.3693V73.6719Z"
                  fill="black"
                />
              </svg>
            </ScrollLink>
            <ul className="tm_nav tm_primary_color">
              <li>
                <ScrollLink to="gd" spy={true} smooth={true} offset={-80} duration={500} activeClass="active"   className="tm_accent_color_hover tm_smoth_scroll">
                  General Demos
                </ScrollLink>
              </li>
              <li>
                <ScrollLink to="cbd" spy={true} smooth={true} offset={-80} duration={500} activeClass="active"   className="tm_accent_color_hover tm_smoth_scroll">
                  Category Based Demos
                </ScrollLink>
              </li>
              {/* <li>
                <ScrollLink to="rd" spy={true} smooth={true} offset={-80} duration={500}  activeClass="active"  className="tm_accent_color_hover tm_smoth_scroll">
                  Receipt Demos
                </ScrollLink>
              </li> */}
              <li>
                <ScrollLink to="features" spy={true} smooth={true} offset={-80} duration={500}  className="tm_accent_color_hover tm_smoth_scroll">
                  Features
                </ScrollLink>
              </li>
              <li>
                <a
                  href="https://themeforest.net/item/invoma-invoice-html-template/39155611"
                  target="_blank"
                  className="tm_btn tm_accent_bg"
                >
                  Purchase Now
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="tm_hero"
        style={{ backgroundImage: "url(./images/landing/hero_bg.jpeg)" }}
        id="hero"
      >
        <div className="tm_landing_container">
          <div className="tm_hero_text">
            <h3 className="tm_hero_mini_title">
              We are not using any framework, so its code is super light.
            </h3>
            <h1 className="tm_hero_title">
              An Effective Invoice Template, that <br /> Build Without Bootstrap
            </h1>
            <p className="tm_hero_subtitle">
              All invoice demo designs are clean, minimal, and focused. Also, this
              template comes with super clean code and is easy to customize. Its
              not a framework-based template, so you can use this Invoice template
              for any kind of project including bootstrap And tailwindcss based
              projects.
            </p>
            <div className="tm_hero_btns">
              <ScrollLink
                to="gd"
                className="tm_btn tm_color_1 tm_smoth_scroll cs_cursor"
                smooth={true} offset={-80} duration={500}
              >
                General Demos
              </ScrollLink>
              <ScrollLink
                to="cbd"
                className="tm_btn tm_color_2 tm_smoth_scroll cs_cursor"
                smooth={true} offset={-80} duration={500}
              >
                Category Based Demos
              </ScrollLink>
            </div>
          </div>
        </div>
      </div>
      <section className="tm_section" id="gd">
        <div className="tm_landing_container">
          <div className="tm_landing_section_heading">
            <h2 className="tm_section_title tm_text_center">
              12+ pre-made general purpose demo
            </h2>
            <p className="tm_section_subtitle">
              We make different style invoice demos, choose any invoice style and
              use your project. <br />
              All invoice comes with clean code and is easy to customize.
            </p>
          </div>
          <div className="tm_demos">
            {generalDemos.map((item, index)=>(
              <DemoViewer key={index} imgUrl={item.imgUrl} path={item.path} title={item.title} />
            ))}
          </div>
        </div>
      </section>
      <hr />
      <section className="tm_section" id="cbd">
        <div className="tm_landing_container">
          <div className="tm_landing_section_heading">
            <h2 className="tm_section_title tm_text_center">
              20+ category based pre-made demo
            </h2>
            <p className="tm_section_subtitle">
              We make popular category invoice for you. Everything is customizable
              and we are <br />
              adding more demos each month. Updates are free, forever!
            </p>
          </div>
          <div className="tm_demos">
            {categoryDemos.map((item, index)=>(
              <DemoViewer key={index} imgUrl={item.imgUrl} path={item.path} title={item.title} />
            ))}
          </div>
        </div>
      </section>
      <hr />
      {/* <section className="tm_section" id="rd">
        <div className="tm_landing_container">
          <div className="tm_landing_section_heading">
            <h2 className="tm_section_title tm_text_center">
              You will get 4+ receipt designs also
            </h2>
            <p className="tm_section_subtitle">
              Every receipt CSS is individual so that you can easily use it on your
              existing or new project.
            </p>
          </div>
          <div className="tm_demos">
            <a
              target="_blank"
              href="receipt_1.html"
              className="tm_demo tm_text_center tm_primary_color tm_accent_color_hover"
            >
              <img src="./images/landing/demo/receipt_1.jpeg" alt="" />
              <div className="tm_demo_info">
                <h3>Receipt Stype 1</h3>
              </div>
            </a>
            <a
              target="_blank"
              href="receipt_2.html"
              className="tm_demo tm_text_center tm_primary_color tm_accent_color_hover"
            >
              <img src="./images/landing/demo/receipt_2.jpeg" alt="" />
              <div className="tm_demo_info">
                <h3>Receipt Stype 2</h3>
              </div>
            </a>
            <a
              target="_blank"
              href="receipt_3.html"
              className="tm_demo tm_text_center tm_primary_color tm_accent_color_hover"
            >
              <img src="./images/landing/demo/receipt_3.jpeg" alt="" />
              <div className="tm_demo_info">
                <h3>Receipt Stype 3</h3>
              </div>
            </a>
            <a
              target="_blank"
              href="receipt_4.html"
              className="tm_demo tm_text_center tm_primary_color tm_accent_color_hover"
            >
              <img src="./images/landing/demo/receipt_4.jpeg" alt="" />
              <div className="tm_demo_info">
                <h3>Receipt Stype 4</h3>
              </div>
            </a>
          </div>
        </div>
      </section> */}
      <section className="tm_section tm_feature_section tm_white_bg" id="features">
        <div className="tm_landing_container">
          <div className="tm_landing_section_heading">
            <h2 className="tm_section_title tm_text_center">
              Core Features of Invoma
            </h2>
            <p className="tm_section_subtitle">
              It has some unique features, like, no bootstrap only row code use,{" "}
              <br />
              can download PDF formate, clean And organize code, etc...
            </p>
          </div>
          <div className="tm_features">
            <div className="tm_feature_box tm_color_1">
              <div className="tm_feature_box_icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  role="img"
                  width="1em"
                  height="1em"
                  preserveAspectRatio="xMidYMid meet"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm10 0h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM10 13H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1zm8 1h-2v2h-2v2h2v2h2v-2h2v-2h-2z"
                  />
                </svg>
              </div>
              <h3>Customize Everything</h3>
            </div>
            <div className="tm_feature_box tm_color_2">
              <div className="tm_feature_box_icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  role="img"
                  width="1em"
                  height="1em"
                  preserveAspectRatio="xMidYMid meet"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="m21.484 7.125l-9.022-5a1.003 1.003 0 0 0-.968 0l-8.978 4.96a1 1 0 0 0-.003 1.748l9.022 5.04a.995.995 0 0 0 .973.001l8.978-5a1 1 0 0 0-.002-1.749z"
                  />
                  <path
                    fill="currentColor"
                    d="m12 15.856l-8.515-4.73l-.971 1.748l9 5a1 1 0 0 0 .971 0l9-5l-.971-1.748L12 15.856z"
                  />
                  <path
                    fill="currentColor"
                    d="m12 19.856l-8.515-4.73l-.971 1.748l9 5a1 1 0 0 0 .971 0l9-5l-.971-1.748L12 19.856z"
                  />
                </svg>
              </div>
              <h3>User Friendly Layout</h3>
            </div>
            <div className="tm_feature_box tm_color_3">
              <div className="tm_feature_box_icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  role="img"
                  width="1em"
                  height="1em"
                  preserveAspectRatio="xMidYMid meet"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M4 6v10h5v-4a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v4h2V6H4M0 20v-2h4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h4v2h-6a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2H0m11.5 0a.5.5 0 0 0-.5.5a.5.5 0 0 0 .5.5a.5.5 0 0 0 .5-.5a.5.5 0 0 0-.5-.5m4 0a.5.5 0 0 0-.5.5a.5.5 0 0 0 .5.5a.5.5 0 0 0 .5-.5a.5.5 0 0 0-.5-.5M13 20v1h1v-1h-1m-2-8v7h5v-7h-5Z"
                  />
                </svg>
              </div>
              <h3>Responsive Design</h3>
            </div>
            <div className="tm_feature_box tm_color_4">
              <div className="tm_feature_box_icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  role="img"
                  width="1em"
                  height="1em"
                  preserveAspectRatio="xMidYMid meet"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="m7.375 16.781l1.25-1.562L4.601 12l4.024-3.219l-1.25-1.562l-5 4a1 1 0 0 0 0 1.562l5 4zm9.25-9.562l-1.25 1.562L19.399 12l-4.024 3.219l1.25 1.562l5-4a1 1 0 0 0 0-1.562l-5-4zm-1.649-4.003l-4 18l-1.953-.434l4-18z"
                  />
                </svg>
              </div>
              <h3>Developer Friendly Code</h3>
            </div>
            <div className="tm_feature_box tm_color_5">
              <div className="tm_feature_box_icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  role="img"
                  width="1em"
                  height="1em"
                  preserveAspectRatio="xMidYMid meet"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M8.267 14.68c-.184 0-.308.018-.372.036v1.178c.076.018.171.023.302.023c.479 0 .774-.242.774-.651c0-.366-.254-.586-.704-.586zm3.487.012c-.2 0-.33.018-.407.036v2.61c.077.018.201.018.313.018c.817.006 1.349-.444 1.349-1.396c.006-.83-.479-1.268-1.255-1.268z"
                  />
                  <path
                    fill="currentColor"
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM9.498 16.19c-.309.29-.765.42-1.296.42a2.23 2.23 0 0 1-.308-.018v1.426H7v-3.936A7.558 7.558 0 0 1 8.219 14c.557 0 .953.106 1.22.319c.254.202.426.533.426.923c-.001.392-.131.723-.367.948zm3.807 1.355c-.42.349-1.059.515-1.84.515c-.468 0-.799-.03-1.024-.06v-3.917A7.947 7.947 0 0 1 11.66 14c.757 0 1.249.136 1.633.426c.415.308.675.799.675 1.504c0 .763-.279 1.29-.663 1.615zM17 14.77h-1.532v.911H16.9v.734h-1.432v1.604h-.906V14.03H17v.74zM14 9h-1V4l5 5h-4z"
                  />
                </svg>
              </div>
              <h3>Invoice Can Download PDF formate</h3>
            </div>
            <div className="tm_feature_box tm_color_1">
              <div className="tm_feature_box_icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  role="img"
                  width="1em"
                  height="1em"
                  preserveAspectRatio="xMidYMid meet"
                  viewBox="0 0 32 32"
                >
                  <path
                    fill="currentColor"
                    d="m25.7 9.3l-7-7c-.2-.2-.4-.3-.7-.3H8c-1.1 0-2 .9-2 2v24c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V10c0-.3-.1-.5-.3-.7zM18 4.4l5.6 5.6H18V4.4zM24 28H8V4h8v6c0 1.1.9 2 2 2h6v16z"
                  />
                  <path fill="currentColor" d="M10 22h12v2H10zm0-6h12v2H10z" />
                </svg>
              </div>
              <h3>Well Documentation</h3>
            </div>
            <div className="tm_feature_box tm_color_2">
              <div className="tm_feature_box_icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  role="img"
                  width="1em"
                  height="1em"
                  preserveAspectRatio="xMidYMid meet"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M4.985 2c-1.37 0-2.383 1.199-2.337 2.498c.043 1.25-.013 2.867-.42 4.186c-.41 1.322-1.1 2.16-2.228 2.268v1.215c1.128.107 1.819.945 2.227 2.268c.408 1.319.464 2.936.42 4.185c-.045 1.3.968 2.499 2.338 2.499h14.032c1.37 0 2.383-1.199 2.337-2.499c-.043-1.249.013-2.866.42-4.185c.409-1.323 1.098-2.16 2.226-2.268v-1.215c-1.128-.108-1.817-.946-2.226-2.268c-.407-1.32-.463-2.937-.42-4.186C21.4 3.198 20.386 2 19.017 2H4.985ZM16.27 13.769c0 1.79-1.335 2.875-3.55 2.875H8.949a.407.407 0 0 1-.407-.407V6.881a.407.407 0 0 1 .407-.406h3.75c1.847 0 3.06 1 3.06 2.537c0 1.078-.816 2.043-1.855 2.213v.056c1.415.155 2.367 1.135 2.367 2.488Zm-3.96-6.005h-2.15v3.038h1.811c1.4 0 2.172-.564 2.172-1.572c0-.944-.664-1.466-1.833-1.466Zm-2.15 4.243v3.347h2.23c1.457 0 2.23-.585 2.23-1.684c0-1.1-.794-1.663-2.324-1.663H10.16Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3>No Bootstrap Dependency</h3>
            </div>
            <div className="tm_feature_box tm_color_3">
              <div className="tm_feature_box_icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  role="img"
                  width="1em"
                  height="1em"
                  preserveAspectRatio="xMidYMid meet"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M15.752 3a2.25 2.25 0 0 1 2.25 2.25v.753h.75a3.254 3.254 0 0 1 3.252 3.25l.003 5.997a2.249 2.249 0 0 1-2.248 2.25H18v1.25A2.25 2.25 0 0 1 15.75 21h-7.5A2.25 2.25 0 0 1 6 18.75V17.5H4.25A2.25 2.25 0 0 1 2 15.25V9.254a3.25 3.25 0 0 1 3.25-3.25l.749-.001L6 5.25A2.25 2.25 0 0 1 8.25 3h7.502Zm-.002 10.5h-7.5a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75h7.5a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-.75-.75Zm3.002-5.996H5.25a1.75 1.75 0 0 0-1.75 1.75v5.996c0 .414.336.75.75.75H6v-1.75A2.25 2.25 0 0 1 8.25 12h7.5A2.25 2.25 0 0 1 18 14.25V16h1.783a.749.749 0 0 0 .724-.749l-.003-5.997a1.754 1.754 0 0 0-1.752-1.75Zm-3-3.004H8.25a.75.75 0 0 0-.75.75l-.001.753h9.003V5.25a.75.75 0 0 0-.75-.75Z"
                  />
                </svg>
              </div>
              <h3>Exact Look On Print Window</h3>
            </div>
          </div>
        </div>
      </section>
      <footer
        className="tm_footer"
        style={{ backgroundImage: "url(./images/landing/hero_bg.jpeg)" }}
      >
        <div className="tm_landing_container">
          <div className="tm_footer_text">
            <h2 className="tm_footer_title">
              Do You Like Our Invoice Template? <br /> Purchase now and enjoy most{" "}
              <br />
              clean and organize code.
            </h2>
            <a
              href="https://themeforest.net/item/invoma-invoice-html-template/39155611"
              target="_blank"
              className="tm_btn tm_accent_bg"
            >
              Purchase Now
            </a>
          </div>
        </div>
        <div className="tm_copyright">
          <div className="tm_landing_container">
            Copyright @ {new Date().getFullYear()} Invoma. All Rights Reserved.
          </div>
        </div>
      </footer>
    </>
  )
}
