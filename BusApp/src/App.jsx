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
           
           <Route path="map" element={<Map/>}/>
          <Route path='/seats/:totalSeats' element={<Seats/>}/>
        </Route>
      
</Routes>
    </BrowserRouter>


  </main>
)

};

export default App;

