import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from './Context';

const ChangeSeat = () => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticketDetails, setTicketDetails] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [buses, setBuses] = useState([]);
  const navigate = useNavigate();

  const { clearTicketDetails } = useGlobalContext();

  useEffect(() => {
    setTicketNumber('');
    clearTicketDetails();
    }, []);
    

  useEffect(() => {
    fetch('http://localhost:3000/api/buses')
      .then(response => response.json())
      .then(data => setBuses(data))
      .catch(error => console.log(error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`http://127.0.0.1:3000/api/tickets/${ticketNumber}`);
      if (response.ok) {
        const data = await response.json();
        setTicketDetails(data);
      } else {
        setTicketDetails(null);
        setError('Ticket not found');
      }
    } catch (error) {
      console.error('Error searching for ticket:', error);
      setError('Error searching for ticket');
    }
  };

  const handleChangeSeat = () => {
    const bus = buses.find(bus => bus.id === ticketDetails.data.bus_id);
    if (bus) {
      navigate(`/seatchange/${bus.id}`, {
        state: {
          selectedBus: {
            from: bus.from,
            to: bus.to,
            date: bus.date,
            time: bus.time,
            Driver: bus.driver_name,
            NoPlate: bus.number_plate,
            PhoneNo: bus.driver_phone_number,
          },
          amount: bus.amount,
          busId: bus.id,
          Bookedseat: ticketDetails.data.seats,
          totalSeats: bus.seats,
            name: ticketDetails.data.name,
            phone: ticketDetails.data.phone,
            paidAmount: ticketDetails.data.amount,
            from: ticketDetails.data.from,
            to: ticketDetails.data.to,
            date: ticketDetails.data.date,
            time: ticketDetails.data.time,
            ticketNumber: ticketDetails.data.ticket_number,
            ticketId: ticketDetails.data.id,
        },
      });
    } else {
      setError('Bus details not found');
    }
  };

  return (
    <>
    <div className='ticketsearch'>
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
          <p>Name: {ticketDetails.data.name}</p>
          <p>Email: {ticketDetails.data.email}</p>
          <p>Phone: {ticketDetails.data.phone}</p>
          <p>Seat: {ticketDetails.data.seats}</p>
          <p>From: {ticketDetails.data.from}</p>
          <p>To: {ticketDetails.data.to}</p>
          <p>Date: {ticketDetails.data.date}</p>
          <p>Time: {ticketDetails.data.time ?
            new Date(ticketDetails.data.time).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            }) : 'N/A'}</p>
          <button onClick={handleChangeSeat}>Change seat</button>
        </div>
      )}
      {error && <p>{error}</p>}
    </div>
    
    </>
  );
};

export default ChangeSeat;
