import React, {useContext, useState, useEffect} from "react";
import { parse, setHours, setMinutes, format, differenceInSeconds } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

// get buses
  const getLocalStorage = () => {
  let buses = localStorage.getItem('buses');
  if(buses){
    return JSON.parse(localStorage.getItem('buses'))
  } else {
    return []
  }
}
 


const AppContext = React.createContext();

const AppProvider = ({children})=> {
  const[people, setPeople] = useState([]);
const[alert, setAlert] = useState({show: false, msg:'', type:''})
const [payDetails, setPayDetails] = useState([]);
const [rawTime, setRawTime] = useState('');
 const [userIsAdmin, setUserIsAdmin] = useState(false);
 const [userLoggedIn, setUserLoggedIn] = useState(false);
 const [selectedSeats, setSelectedSeats] = useState({});
 const [bookedSeats, setBookedSeats] = useState({});
 const [departureTime, setDepartureTime] = useState(null);
 const [timeRemaining, setTimeRemaining] = useState(0);
 const [ticketNumber, setTicketNumber] = useState('');
 const [ticketDetails, setTicketDetails] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
 const [voucher, setVoucher] = useState(null);

   const [formData, setFormData] = useState({
    from: '',
    to: '',
    amount: '',
    date: '',
    time: '',
    seats: '',
    driver_name: '', 
    number_plate: '', 
    driver_phone_number: '', 
  });
 
  const[showSidebar, setShowSidebar] =useState(false);
  const[showModal, setShowModal] = useState(false);


  const openModal = () => {
      setShowModal(true);
  }

  const closeModal = () => {
      setShowModal(false);
  }
  

  const openSidebar = () => {
setShowSidebar(true);
  }

   const closeSidebar = () => {
setShowSidebar(false);
  }
 
  const clearTicketDetails = () => {
    setTicketDetails(null);
  };

useEffect(() => {
    const payment = JSON.parse(localStorage.getItem('paymentdetails')) ;
    if(payment && payment.length > 0) {

      setPayDetails(payment)
    }
  },[])
// payment

useEffect(()=> {
  localStorage.setItem('paymentdetails', JSON.stringify(payDetails))
  
},[payDetails])




const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const response = await fetch(`http://127.0.0.1:3000/api/tickets/${ticketNumber}`);
    if (response.ok) {
      const data = await response.json();
      setTicketDetails(data);
      console.log('data', data.data)
    } else {
      setTicketDetails(null);
      setError('Ticket not found');
    }
  } catch (error) {
    console.error('Error searching for ticket:', error);
    setError('Error searching for ticket');
  }
};


useEffect(() => {
  if (ticketDetails && ticketDetails.data) {
    const departureDateStr = ticketDetails.data.date;
    const departureTimeStr =  ticketDetails.data.time.substring(11, 16);
    const departureDateTime = parse(departureDateStr + ' ' + departureTimeStr, 'yyyy-MM-dd HH:mm', new Date());

    setDepartureTime(departureDateTime);

    const currentTime = new Date();
    const timeDiff = differenceInSeconds(departureDateTime, currentTime);
    setTimeRemaining(Math.max(timeDiff, 0));

    console.log('departure timestr', departureTimeStr);
    console.log('departure datestr', departureDateStr);
    console.log('departure time', departureDateTime);
    console.log(' timediff', timeDiff);
    console.log('current time', currentTime);
  }
}, [ticketDetails]);




const handleCancelTicket = async () => {
  try {
    if (!ticketDetails || !ticketDetails.data) {
      setError('Ticket details are not available.');
      return;
    }
    
    const currentTime = new Date();
    const timeDifference = differenceInSeconds(departureTime, currentTime);

    // if (timeDifference <= 30 * 60) {
    //   setError('You cannot cancel the ticket within 30 minutes of departure time or less.');
    //   return;
    // }

    const response = await fetch(`http://127.0.0.1:3000/api/tickets/${ticketDetails.data.id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      // Remove booked seats associated with the canceled ticket
      const seatsToRemove = ticketDetails.data.seats.split(',');
      const busId = parseInt(ticketDetails.data.bus_id);
      await fetch(`http://127.0.0.1:3000/api/buses/${busId}/del_booked_seats`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookedSeats: [], seatsToRemove }),
        
      }
      );
      const voucherResponse = await fetch('http://127.0.0.1:3000/api/vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: ticketDetails.data.amount, phone: ticketDetails.data.phone }),
      });

      if (voucherResponse.ok) {
        const voucherData = await voucherResponse.json();
        setVoucher(voucherData.voucher);
        console.log(voucherData)
        setSuccessMessage('Ticket canceled successfully');
      } else {
        setError('Failed to create voucher');
      }

      setTicketDetails(null);
      // Close the modal after canceling the ticket
      closeModal();
      
    } else {
      setError('Failed to cancel ticket');
    }
  } catch (error) {
    console.error('Error canceling ticket:', error);
    setError('Error canceling ticket');
  }
};




// get people sign up
useEffect(() => {
    const users = JSON.parse(localStorage.getItem('newClients')) ;
    if(users && users.length > 0) {

      setPeople(users);
    }
  },[])

  // Store people signup
useEffect (()=> {
    localStorage.setItem('newClients', JSON.stringify(people))
  }, [people])





  // store buses

    // alert
    const showAlert = (show=false,type='', msg='')=>{
  setAlert({show,type,msg});
}




 


    return(
        <AppContext.Provider value={{
          people,
          setPeople,
          payDetails,
          setPayDetails,
          alert,
          showAlert,
        bookedSeats,
        setBookedSeats,
          userIsAdmin,
          userLoggedIn,
          setUserLoggedIn,
          rawTime,
          setRawTime,
        formData,
        setFormData,
          selectedSeats,
        setSelectedSeats,
     ticketNumber,
     setTicketNumber,
     showSidebar,
    openModal,
    closeModal,
    showModal,
     openSidebar,
     closeSidebar,
     ticketDetails,
     handleCancelTicket,
     handleSubmit,
       error,
        successMessage,
    setError,
    departureTime,
    voucher,
    clearTicketDetails,
 
    
       
        }}>
            {children}
        </AppContext.Provider>
    )
    console.log(AppProvider);
}
export const useGlobalContext = () => {
    return(
    useContext(AppContext)
    )
}
export{AppContext, AppProvider}