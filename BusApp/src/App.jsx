import { useState } from 'react'

import './App.css'
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Home from './Home';
import Bus from './Bus';
import Booking from './Booking';
import Booked from './Booked';
import Seats from './Seats';
import Payment from './Payment';
import Ticket from './Ticket';
import UpdateBusForm from './Update';
import CreateBusForm from './Create';
import {Content} from './Content';
import Mpesa from './Mpesa';
import {Map} from './Map';
import Employee from './Employee';
import MyTcket from './MyTcket';
import Tofro from './tofro';
import Twoway from './Twoway';
import TwowaySeats from './Twowayseats';
import TicketSearch from './Ticketsearch';
import Reschedule from './Reschedule';
import Bookedres from './Bookedres';
import Bookingres from './Bookingres';
import Sadmin from './Sadmin';
import ChangeSeat from './Changeseat';
import SeatChange from './seatChange';
import UpdatedTicket from './UpdatedTicket';
import Voucher from './Voucher';
import BusHistory from './BusHistory';
import CashTicket from './CashTicket';
import HomeSidebar from './Homesidebar';
function App () {
   
return (
  <main>
   
<BrowserRouter >
<Routes>
        <Route path="/" element={<Home/>} >
          <Route index element={<Bus />} />
        <Route path="employee" element={<Employee/>}/>
          <Route path="booking" element={<Booking/>}/>
          <Route path="booked" element={<Booked/>}/>
          <Route path="payment-details" element={<Payment/>}/>
          <Route path="myticket" element={<MyTcket/>}/>
          <Route path="/update/:id" element={<UpdateBusForm/>}/>
          <Route path="create" element={<CreateBusForm/>}/>
          <Route path="content" element={<Content/>}/>
           <Route path="ticket" element={<Ticket/>}/>
           <Route path="mpesa" element={<Mpesa/>}/>
           <Route path="roundtrip" element={<Tofro/>}/>
           <Route path="twoway" element={<Twoway/>}/>
           <Route path="map" element={<Map/>}/>
          <Route path='/seats/:totalSeats' element={<Seats/>}/>
          <Route path='/seatchange/:busId' element={<SeatChange/>}/>
          <Route path='/sadmin/:totalSeats' element={<Sadmin/>}/>
          <Route path='/twoway-seats/:totalSeats' element={<TwowaySeats/>}/>
          <Route path='ticketsearch' element={<TicketSearch/>}/>
          <Route path='/reschedule/:totalSeats' element={<Reschedule/>}/>
          <Route path='bookedres' element={<Bookedres/>}/>
          <Route path='bookingres' element={<Bookingres/>}/>
          <Route path='changeseat' element={<ChangeSeat/>}/>
          <Route path='updatedticket' element={<UpdatedTicket/>}/>
          <Route path='Voucher' element={<Voucher/>}/>
          <Route path='bushistory' element={<BusHistory/>}/>
          <Route path='cashticket' element={<CashTicket/>}/>
          <Route path='homesidebar' element={<HomeSidebar/>}/>

        

        </Route> 
      
</Routes>
    </BrowserRouter>


  </main>
)

};

export default App;

