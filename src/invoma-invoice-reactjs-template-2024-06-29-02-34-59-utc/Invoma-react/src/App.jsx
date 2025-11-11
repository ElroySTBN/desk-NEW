import { Route, Routes } from "react-router-dom";
import General from "./pages/General";
import General2 from "./pages/General2";
import General3 from "./pages/General3";
import General4 from "./pages/General4";
import General5 from "./pages/General5";
import General6 from "./pages/General6";
import General7 from "./pages/General7";
import General8 from "./pages/General8";
import General9 from "./pages/General9";
import General10 from "./pages/General10";
import General11 from "./pages/General11";
import Landing from "./pages/Landing";
import EcommerceInvoice from "./pages/EcommerceInvoice";
import MovieTicketBooking from "./pages/MovieTicketBooking";
import CoffeeShopInvoice from "./pages/CoffeeShopInvoice";
import HotelBooking from "./pages/HotelBooking";
import BusinessInvoice from "./pages/BusinessInvoice";
import BusTicketBooking from "./pages/BusTicketBooking";
import CleaningServiceInvoice from "./pages/CleaningServiceInvoice";
import CarBooking from "./pages/CarBooking";
import DomainHosting from "./pages/DomainHosting";
import FitnessCenter from "./pages/FitnessCenter";
import FlightBooking from "./pages/FlightBooking";
import InternetBilling from "./pages/InternetBilling";
import MedicalInvoice from "./pages/MedicalInvoice";
import MoneyExchange from "./pages/MoneyExchange";
import PhotostudioInvoice from "./pages/PhotostudioInvoice";
import RealEstateInvoice from "./pages/RealEstateInvoice";
import RestaurantInvoice from "./pages/RestaurantInvoice";
import StudentBilling from "./pages/StudentBilling";
import TrainInvoice from "./pages/TrainInvoice";
import TravelAgency from "./pages/TravelAgency";
import Layout from "./components/Layout/Layout";
import LayoutStyle2 from "./components/Layout/LayoutStyle2";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<General />}/>
        <Route path="/general_2" element={<General2 />}/>
        <Route path="/general_3" element={<General3 />}/>
        <Route path="/general_4" element={<General4 />}/>
        <Route path="/general_5" element={<General5 />}/>
        <Route path="/general_7" element={<General7 />}/>
        <Route path="/general_8" element={<General8 />}/>
        <Route path="/general_9" element={<General9 />}/>
        <Route path="/general_10" element={<General10 />}/>
        <Route path="/general_11" element={<General11 />}/>
        <Route path="/business_invoice" element={<BusinessInvoice />}/>
        <Route path="/bus_ticket_booking" element={<BusTicketBooking />}/>
        <Route path="/cleaning_service_invoice" element={<CleaningServiceInvoice />}/>
        <Route path="/coffee_shop_invoice" element={<CoffeeShopInvoice />}/>
        <Route path="/car_booking" element={<CarBooking />}/>
        <Route path="/domain_hosting" element={<DomainHosting />}/>
        <Route path="/ecommerce_invoice" element={<EcommerceInvoice />}/>
        <Route path="/fitness_center" element={<FitnessCenter />}/>
        <Route path="/flight_booking" element={<FlightBooking />}/>
        <Route path="/hotel_booking" element={<HotelBooking />}/>
        <Route path="/internet_billing" element={<InternetBilling />}/>
        <Route path="/medical_invoice" element={<MedicalInvoice />}/>
        <Route path="/money_exchange" element={<MoneyExchange />}/>
        <Route path="/movie_ticket_booking" element={<MovieTicketBooking />}/>
        <Route path="/photostudio_invoice" element={<PhotostudioInvoice />}/>
        <Route path="/real_estate_invoice" element={<RealEstateInvoice />}/>
        <Route path="/restaurant_invoice" element={<RestaurantInvoice />}/>
        <Route path="/student_billing" element={<StudentBilling />}/>
        <Route path="/train_invoice" element={<TrainInvoice />}/>
        <Route path="/travel_agency" element={<TravelAgency />}/>
      </Route>
      <Route path="/landing" element={<Landing />}/>
      <Route path="/" element={<LayoutStyle2 />}>
        <Route path="/general_6" element={<General6 />}/>
      </Route>
    </Routes>
  )
}