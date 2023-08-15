
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Ticket from './Ticket';



const checkPaymentStatus = async (checkoutRequestID, setPaymentStatus, setPaymentChecked, setErrorMessage) => {
  try {
    const queryResponse = await fetch('https://lets-ride-fe42d9bf40d4.herokuapp.com/api/stkquery', {
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




const Mpesa = () => {
  const location = useLocation();
const navigate = useNavigate();

  const { paymentDetails } = location.state || {};
   const { driverName, driverPhone, driverNoPlate } = location.state || {};

  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentChecked, setPaymentChecked] = useState(false);
    const [checkoutRequestID, setCheckoutRequestID] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);

 const initiateSTKPush = async (phoneNumber) => {
  try {
       setPaymentStatus('');
      setPaymentChecked(false);
      setErrorMessage('');
      setIsPaymentSuccessful(false);
      setCheckoutRequestID('');
    const response = await fetch('https://lets-ride-fe42d9bf40d4.herokuapp.com/api/stkpush', {
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

        const response = await fetch('https://lets-ride-fe42d9bf40d4.herokuapp.com/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...restPaymentDetails,
            seats: restPaymentDetails.seats.join(','),
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

  sendPaymentDetails();
}, [paymentDetails]);

// Use useEffect to start polling for payment status when checkoutRequestID changes
 useEffect(() => {
    let intervalId; // Variable to hold the interval ID

    const checkPaymentStatusWithInterval = async () => {
      try {
        const queryResponse = await fetch('https://lets-ride-fe42d9bf40d4.herokuapp.com/api/stkquery', {
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

            if (ResultCode === '0' ) {
              setPaymentStatus(ResultDesc); // Payment successful
              setIsPaymentSuccessful(true); // Set the state to indicate payment success
             navigate('/ticket', { state: { paymentDetails,
            
              driverName: location.state.driverName,
              driverPhone: location.state.driverPhone,
              driverNoPlate: location.state.driverNoPlate,
            } });
              return; // Payment successful
            } else if (ResultCode === '1032') {
              setPaymentStatus(ResultDesc); // Payment successful
              setIsPaymentSuccessful(true); // Set the state to indicate payment success
            
              return; // Payment successful
            }
            else {
              setPaymentStatus('Payment failed or encountered an error.'); // Other error
            }
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
            <p>
              <small>{paymentDetails.time}hrs</small>
            </p>
          </div>

          <div>
            <p>One-Way Ticket</p>
            <p>
              <small>Selected seat(s) No: {paymentDetails.seats.join(', ')}</small>
            </p>
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
