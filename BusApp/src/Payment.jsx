import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGlobalContext } from './Context';
import Outbox from './Outbox';




const storeBookedSeats = async (busId, newBookedSeats) => {
  try {
    const response = await fetch(`http://127.0.0.1:3000/api/buses/${busId}/store_booked_seats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You may need to include authentication headers if required
      },
      body: JSON.stringify({ bookedSeats: newBookedSeats }),
    });

    if (!response.ok) {
      throw new Error('Failed to store booked seats');
    }

    console.log('Booked seats stored successfully!');
  } catch (error) {
    console.error('Error storing booked seats:', error.message);
  }
};
const Payment = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const { alert, showAlert,setBookedSeats, setSelectedSeats } = useGlobalContext();
  const {   } = useGlobalContext();

  const location = useLocation();
  const navigate = useNavigate();
  const { selectedSeats, amount, from, to, date, time, driverName, driverPhone, driverNoPlate, busId, employee } = location.state || {};
 

 
  const isValidPhoneNumber = (phoneNumber) => {
    // Use a regular expression to check if the phone number matches the expected format
    const phoneRegex = /^2547\d{8}$/;
    return phoneRegex.test(phoneNumber);
  };

  // Function to generate a unique ticket number
  const generateTicketNumber = () => {
    const currentDate = new Date();
    const ticketNumber = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getDate()}${currentDate.getHours()}${currentDate.getMinutes()}${currentDate.getSeconds()}${Math.floor(Math.random() * 10000)}`;
    return ticketNumber;
  };

  const formattedTime = time
  ? new Date(time).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    })
  : 'N/A';
  // Function to handle cash payment
  const handleCashPayment = async () => {
    // Generate a unique ticket number
    const ticketNumber = generateTicketNumber();

    // Create the ticket object
    const ticket = {
      name,
      email,
      phone,
      seats: Object.values(selectedSeats).flat().join(','),
      amount,
      from,
      to,
      date,
      time,
     
    };

    try {
      // Send the ticket details to the backend
      const response = await fetch('http://127.0.0.1:3000/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          seats: Object.values(selectedSeats).flat().join(','),
          amount,
          from,
          to,
          date,
          busId,
          time: formattedTime,
          ticket_number: ticketNumber,
        }),
      });

      // Check if the request was successful
      if (response.ok) {
        setBookedSeats((prevBookedSeats) => {
          console.log('busId:', busId);
          console.log('Previous Booked Seats:', prevBookedSeats);
          
          const newBookedSeats = { ...prevBookedSeats };
  
          // Iterate over selected seats and mark them as booked for the current bus
          Object.keys(selectedSeats).forEach((busId) => {
            const selectedBusSeats = selectedSeats[busId];
            selectedBusSeats.forEach((seatNumber) => {
              if (!newBookedSeats[busId]) {
                newBookedSeats[busId] = [];
              }
              newBookedSeats[busId].push(seatNumber);
            });
          });
  
          console.log('New Booked Seats:', newBookedSeats);
          storeBookedSeats(busId, newBookedSeats);
          return newBookedSeats;
        });
        
        setSelectedSeats([]);
        // Redirect to the ticket view component passing the ticket details
        navigate('/cashticket', { state: { 
          ticket,
          ticket_number: ticketNumber,
          employee,
         } 

        });
      } else {
        // Display an error message if the request failed
        showAlert(true, 'danger', 'Failed to create ticket. Please try again.');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      showAlert(true, 'danger', 'An unexpected error occurred. Please try again later.');
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();

    // Check if the phone number is valid
    if (!isValidPhoneNumber(phone)) {
      showAlert(true, 'danger', 'Please enter a valid phone number format (e.g. 2547******81).');
      return;
    }

    navigate('/mpesa', {
      state: {
        paymentDetails: {
          name,
          email,
          phone,
          seats: Object.values(selectedSeats).flat().join(','),
          amount,
          from,
          to,
          date,
          time,
          busId,
        },
        driverName: location.state.driverName, // Pass the driver details here
        driverPhone: location.state.driverPhone, // Pass the driver details here
        driverNoPlate: location.state.driverNoPlate,
        employee,

      },
    });
  };

  return (
    <>
      <div className='pay bg'>
        <div>
          {alert.show && <Outbox {...alert} removeAlert={showAlert} />}
          <h2>Payment Details</h2>
          <p>From: {from}</p>
          <p>To: {to}</p>
          <p>Date: {date}</p>
          <p>Time: {time ? new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, }) : 'N/A'}</p>
          <form onSubmit={handleFormSubmit}>
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} /><br></br>
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} /><br></br>
            <label htmlFor="phone">Phone:</label>
            <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g 2547******81" /><br></br>
            <button type="submit">Pay with MPESA</button>
          </form>
         
          {employee &&  <button type="button" onClick={handleCashPayment}> Pay with cash</button>}

        </div>
      </div>
    </>
  );
};

export default Payment;
