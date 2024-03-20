import React, { useState, useEffect } from 'react';
import {  useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Modal from './Modal'; // Import the Modal component
import { useGlobalContext } from './Context';
import { parse, setHours, setMinutes, format, differenceInSeconds } from 'date-fns';


const TicketSearch = () => {
 const [departureTime, setDepartureTime] = useState(null);
 const navigate = useNavigate();
 const { ticketDetails, handleSubmit, clearTicketDetails, handleCancelTicket, setTicketNumber, ticketNumber, setError, error, successMessage, showModal, openModal, closeModal } = useGlobalContext();


   useEffect(() => {
  if (ticketDetails && ticketDetails.data) {
    const departureDateStr = ticketDetails.data.date;
    const departureTimeStr =  ticketDetails.data.time.substring(11, 16);
    const departureDateTime = parse(departureDateStr + ' ' + departureTimeStr, 'yyyy-MM-dd HH:mm', new Date());

    setDepartureTime(departureDateTime);
    
  }
}, [ticketDetails]);
  
useEffect(() => {
setTicketNumber('');
clearTicketDetails();
}, []);

 
  
const handleEdit = () => {
  // const currentTime = new Date();
  // const timeDifference = differenceInSeconds(departureTime, currentTime);

  // if (timeDifference <= 30 * 60) {
  //   setError('You cannot reschedule the ticket within 30 minutes of departure time or less.');
  //   return;
  // }
  navigate('/bookingres', { state: { 
    ticketNumber: ticketNumber,
  } });
}


  return (
    <>
    
    <div className='ticketsearch'>
      <div>


      <h2>Search for Ticket</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Ticket Number:
          <input
            type="text"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
          />
        </label>
        <button type="submit">Search</button>
      </form>
      {ticketDetails && (
        <div>
          <h3>Ticket Details</h3>
          <Modal/>
          <p>Name: {ticketDetails.data.name}</p>
          <p>Email: {ticketDetails.data.email}</p>
          <p>Phone: {ticketDetails.data.phone}</p>
          <p>Seat: {ticketDetails.data.seats}</p>
          <p>From: {ticketDetails.data.from}</p>
          <p>To: {ticketDetails.data.to}</p>
          <p>To: {ticketDetails.data.bus_id}</p>
          <p>Date: {ticketDetails.data.date}</p>
          <p>Time: {ticketDetails.data.time ?
          new Date(ticketDetails.data.time).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          }) : 'N/A'}</p>
         
       <div className='resbuttons'>

          <button onClick={handleEdit} className='edit'>
        
          Reschedule
        
        </button>
           <div>
        {showModal ? null : (
          <div>
            <button className="" onClick={openModal}>
             Cancel ticket
            </button>
          </div>
        )}
           

      </div>
       </div>
       
        </div>
      )}
      </div>
   
      {successMessage && <p>{successMessage}</p>}
      {error && <p>{error}</p>}
    </div>
    </>
  );
};

export default TicketSearch;
