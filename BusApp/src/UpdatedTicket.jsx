import React from 'react';
import { useLocation } from 'react-router-dom';

const UpdateTicket = () => {
  const location = useLocation();

  const { updatedTicket, NoPlate } = location.state || {};

  return (
    <div className='ticketsearch'>
      <h1>Updated Ticket Details</h1>
     
      <p>Name: {updatedTicket.name}</p>
      <p>Phone: {updatedTicket.phone}</p>
      <p>Seat: {updatedTicket.seats}</p>
      <p>From: {updatedTicket.from}</p>
      <p>To: {updatedTicket.to}</p>
      <p>Date: {updatedTicket.date}</p>
      <p>Time: {updatedTicket.time ? new Date(updatedTicket.time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true,
                    }) : 'N/A'}</p>
      {/* Add other ticket details here */}
      <h3>No plate: {NoPlate}</h3>
    </div>
  );
};

export default UpdateTicket;
