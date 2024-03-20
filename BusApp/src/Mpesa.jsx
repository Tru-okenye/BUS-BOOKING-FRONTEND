

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Ticket from './Ticket';
import { useGlobalContext } from './Context';
import Cancelticket from './Ticketsearch';



const checkPaymentStatus = async (checkoutRequestID, setPaymentStatus, setPaymentChecked, setErrorMessage) => {
  try {
    const queryResponse = await fetch('http://127.0.0.1:3000/api/stkquery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ checkoutRequestID }),
    });

    if (queryResponse.ok) {
      const queryResult = await queryResponse.json();
      console.log('Query Result:', queryResult);

      if (queryResult.status === 'success') {
        const { data } = queryResult;
        const { ResultCode, ResultDesc } = data;

        if (ResultCode === '0') {
          setPaymentStatus(ResultDesc); // Payment successful
          setPaymentChecked(true); // Set paymentChecked to true to display the payment status
          return;  // Payment successful
        } else if (ResultCode === '1032') {
       setPaymentStatus(ResultDesc); // Payment successful
          setPaymentChecked(true); // Set paymentChecked to true to display the payment status
        } else {
          setPaymentStatus('Payment failed or encountered an error.'); // Other error
        }

        setErrorMessage(''); // Clear any previous error message
        setPaymentChecked(true); // Set paymentChecked to true to display the payment status
      } else if (queryResult.status === 'error') {
        const { data } = queryResult;
        const { errorMessage } = data;

        setPaymentStatus(errorMessage);
        setErrorMessage(''); // Clear any previous error message
        setPaymentChecked(true); // Set paymentChecked to true to display the error message
      } else {
        // Handle any other unexpected response here
        setPaymentStatus('Failed to get payment status.');
        setErrorMessage('Failed to get payment status.'); // Set an error message for the failure to get status
        setPaymentChecked(true); // Set paymentChecked to true to display the error message
      }
    } else {
      setPaymentStatus('Failed to check payment status.');
      setErrorMessage('Failed to check payment status.'); // Set an error message for the failure to check status
      setPaymentChecked(true); // Set paymentChecked to true to display the error message
    }
  } catch (error) {
    console.error('Failed to check payment status:', error);
    setPaymentStatus('Failed to check payment status.');
    setErrorMessage('Failed to check payment status. Please try again later.');
    setPaymentChecked(true); // Set paymentChecked to true to display the error message
  }
};

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

// Call this function when updating booked seats



const Mpesa = () => {
  const location = useLocation();
const navigate = useNavigate();

  const { paymentDetails, employee } = location.state || {};
  const { driverName, driverPhone, driverNoPlate } = location.state || {};
 const { setBookedSeats, setSelectedSeats  } = useGlobalContext();
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentChecked, setPaymentChecked] = useState(false);
  const [checkoutRequestID, setCheckoutRequestID] = useState('');
  const selectedSeats = paymentDetails.seats || [];
  const [errorMessage, setErrorMessage] = useState('');
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticketStored, setTicketStored] = useState(false);
  
  const {
    name,
    phone,
    from,
    to,
    seats,
    time,
    date,
    amount,
    email,
    busId,
  } = paymentDetails || {};
 
 const initiateSTKPush = async (phoneNumber) => {
  try {
       setPaymentStatus('');
      setPaymentChecked(false);
      setErrorMessage('');
      setIsPaymentSuccessful(false);
      setCheckoutRequestID('');
    const response = await fetch('http://127.0.0.1:3000/api/stkpush', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber: paymentDetails.phone, amount: paymentDetails.amount }),
    });

    if (response.ok) {
      const responseData = await response.json();
      const { checkoutRequestID } = responseData;

      setCheckoutRequestID(checkoutRequestID); // Set the checkoutRequestID here
      setPaymentStatus('STK push sent to your phone. Please enter your M-Pesa PIN to accept the payment.');

      // Start polling for payment status
       checkPaymentStatus(checkoutRequestID, setPaymentStatus, setPaymentChecked, setErrorMessage);// Pass the checkoutRequestID to the checkPaymentStatus function
      
      } else {
      throw new Error('Failed to initiate STK push');
      
    }
  } catch (error) {
    console.error('Failed to initiate STK push:', error);
    setPaymentStatus('Failed to initiate payment. Please try again later.');
  }
};
  



  const handlePayClick = () => {
  if (paymentDetails && paymentDetails.phone && paymentDetails.amount) {
    initiateSTKPush(paymentDetails.phone); // Pass the phone number to the initiateSTKPush function
    setPaymentStatus('Waiting for payment response...'); // Set initial status while waiting for response
  } else {
    setPaymentStatus('Invalid payment details. Please provide valid phone number and amount.');
  }
};




useEffect(() => {
  const sendPaymentDetails = async () => {
    try {
      if (paymentDetails) {
        const { ...restPaymentDetails } = paymentDetails;
        const seatsArray = Object.values(restPaymentDetails.seats).flat();
        const response = await fetch('http://127.0.0.1:3000/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...restPaymentDetails,
            seats: seatsArray.join(''),
          }),
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          console.error('Failed to store payment details:', errorResponse);

          if (errorResponse.errors) {
            for (const key in errorResponse.errors) {
              console.error(`${key} validation error:`, errorResponse.errors[key]);
            }
          }

          setPaymentStatus('Payment failed. Please try again.');
        } else {
          // Payment details successfully stored, initiate STK push
          const responseData = await response.json();
          const { checkoutRequestID } = responseData;
          setCheckoutRequestID(checkoutRequestID); // Set the checkoutRequestID here
          setPaymentStatus('STK push sent to your phone. Please enter your M-Pesa PIN to accept the payment.');
        }
      }
    } catch (error) {
      console.error('Failed to store payment details:', error);
      setPaymentStatus('Payment failed. Please try again.');
    }
  };

  if (!checkoutRequestID) {
    sendPaymentDetails();
  }
}, []);


const generateTicketNumber = () => {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().replace(/[-T:.Z]/g, '');
  const randomComponent = Math.floor(Math.random() * 10000);
  const newTicketNumber = `${formattedDate}-${randomComponent}`;
  setTicketNumber(newTicketNumber);
}
useEffect(() => {

  generateTicketNumber();
  
}, []);

useEffect(() => {
  let intervalId; // Variable to hold the interval ID

  const checkPaymentStatusWithInterval = async () => {
    try {
      const queryResponse = await fetch('http://127.0.0.1:3000/api/stkquery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ checkoutRequestID }),
      });

      if (queryResponse.ok) {
        const queryResult = await queryResponse.json();
        console.log('Query Result:', queryResult);

        if (queryResult.status === 'success' && !isPaymentSuccessful) {
          const { data } = queryResult;
          const { ResultCode, ResultDesc } = data;

          if (ResultCode === '0') {
            setPaymentStatus(ResultDesc); // Payment successful
            setIsPaymentSuccessful(true); // Set the state to indicate payment success
          } else if (ResultCode === '1032') {
            setPaymentStatus(ResultDesc); // Payment successful
            setIsPaymentSuccessful(true); // Set the state to indicate payment success
          } else {
            setPaymentStatus('Payment failed or encountered an error.'); // Other error
          }
        } else if (queryResult.status === 'error') {
          const { data } = queryResult;
          const { errorMessage } = data;

          setPaymentStatus(errorMessage);
        } else {
          // Handle any other unexpected response here
          setPaymentStatus('Failed to get payment status.');
        }
      } else {
        setPaymentStatus('Failed to check payment status.');
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
      setPaymentStatus('Failed to check payment status. Please try again later.');
    }
  };

  if (checkoutRequestID && !isPaymentSuccessful) {
    // Start polling for payment status immediately
    checkPaymentStatusWithInterval();

    // Start polling every 1 second (1000ms)
    intervalId = setInterval(checkPaymentStatusWithInterval, 1000);
  }

  return () => {
    // Clean up the interval when the component is unmounted or payment is successful
    clearInterval(intervalId);
  };
}, [checkoutRequestID, isPaymentSuccessful]);

useEffect(() => {
  if (isPaymentSuccessful && !ticketStored) {
    const formattedTime = time
      ? new Date(time).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        })
      : 'N/A';

    const storeTicketAndSeats = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3000/api/tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            seats: Object.values(paymentDetails.seats).flat().join(''),
            amount,
            from,
            to,
            date,
            busId,
            time: formattedTime,
            ticket_number: ticketNumber,
          }),
        });

        if (response.ok) {
          setTicketStored(true);
          const data = await response.json();
          console.log('Ticket stored successfully:', data);

          setBookedSeats((prevBookedSeats) => {
            const newBookedSeats = { ...prevBookedSeats };

            const selectedBusSeatsString = paymentDetails.seats;
            const selectedBusSeatsArray = selectedBusSeatsString.split(',');

            if (!newBookedSeats[busId]) {
              newBookedSeats[busId] = [];
            }

            selectedBusSeatsArray.forEach((seatNumber) => {
              const trimmedSeatNumber = seatNumber.trim();
              if (!newBookedSeats[busId].includes(trimmedSeatNumber)) {
                newBookedSeats[busId].push(trimmedSeatNumber);
              }
            });

            console.log('New Booked Seats:', newBookedSeats);
            storeBookedSeats(busId, newBookedSeats);
            return newBookedSeats;
          });

          setSelectedSeats([]);
          
          navigate('/ticket', {
            state: {
              paymentDetails,
              driverName: location.state.driverName,
              driverPhone: location.state.driverPhone,
              driverNoPlate: location.state.driverNoPlate,
              ticketNumber: ticketNumber,
              employee,
            },
          });
        } else {
          console.error('Error storing ticket:', response.statusText);
        }
      } catch (error) {
        console.error('Error storing ticket:', error);
      }
    };

    storeTicketAndSeats();
  }
}, [isPaymentSuccessful, ticketStored]);



  
  return (
    <main>
      <div className='update bg'>
        <div className='mpesa'>
        
      <h3>Payment Details</h3>
      {paymentDetails && (
      <div>
          <div>
            <p>{paymentDetails.name}</p>
            <p>{paymentDetails.phone}</p>

            <h5>Payment Method</h5>
            <p>Pay with Mpesa</p>
            <p>An STK push will be sent to your mobile number. Before you proceed, please confirm you have enough money in your MPESA</p>

            {/* Display other payment details */}
          </div>
          <div>
            <h5>
              <small>
                {paymentDetails.from} - {paymentDetails.to}
              </small>
            </h5>
            <p>
              <small>{paymentDetails.date}</small>
            </p>
            <p>Departure</p>
            <p>Time: {paymentDetails.time ? new Date(paymentDetails.time).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          }) : 'N/A'}</p>
          </div>
        
          <div>
            <p>One-Way Ticket</p>
            {/* <p>
              <small>Booked seat(s) No: {paymentDetails.seats.join(', ')}</small>
            </p> */}
            <p>Selected Seats: {(Object.values(paymentDetails.seats).flat().map(seat => seat.toString()) || [])}</p>

            <p>
              <strong>Total Ksh{paymentDetails.amount}</strong>
            </p>

            
             {paymentChecked && paymentStatus && <p>{paymentStatus}</p>}
            {paymentChecked && errorMessage && <p>{errorMessage}</p>} {/* Display the error message */}
          </div>

 

         <button
          type="submit"
          style={{ backgroundColor: 'red', width: '16rem', border: 'none' }}
          onClick={handlePayClick} // Call handlePayClick when the "PAY" button is clicked
        >PAY </button>
        </div>
      )}
    

     </div>
        </div>
    </main>
  );
};

export default Mpesa;
