import React, {useContext, useState, useEffect} from "react";
import { parse, setHours, setMinutes } from 'date-fns';
import { utcToZonedTime, format } from 'date-fns-tz';
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
const [busData, setBusData] = useState(getLocalStorage());
const[selectedBusId, setSelectedBusId] = useState(null)
const [payDetails, setPayDetails] = useState([]);
 const [userIsAdmin, setUserIsAdmin] = useState(false);
 const [userLoggedIn, setUserLoggedIn] = useState(false);
 const [rawTime, setRawTime] = useState('');
  const [formattedTime, setFormattedTime] = useState('');
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




const handleSelectedSeat = (busId) => {
setSelectedBusId(busId)
}

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

  useEffect(()=> {
  localStorage.setItem('buses', JSON.stringify(busData))
  
},[busData])
    // alert
    const showAlert = (show=false,type='', msg='')=>{
  setAlert({show,type,msg});
}

 const formatTime = (time) => {
  // Check if time is defined and a non-empty string before splitting
  if (time && typeof time === 'string' && time.trim() !== '') {
    // Parse the time string into a Date object
    const parsedDate = new Date(time);

    // Get the hours and minutes from the Date object
    const hours = parsedDate.getHours().toString().padStart(2, '0');
    const minutes = parsedDate.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  return 'N/A';
};


 const handleTimeChange = (selectedTime) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(rawTime)) {
      showAlert(true, 'danger', 'Invalid time format! Please use HH:mm format.');
      return;
    }

    const [hours, minutes] = rawTime.split(':');
    const currentDate = setMinutes(setHours(new Date(), hours), minutes);

    const timeZone = 'Africa/Nairobi';
    const localTime = utcToZonedTime(currentDate, timeZone);
    const formattedTime = format(localTime, 'HH:mm');

    console.log('formatted time:', formattedTime);

    setFormattedTime(formattedTime);

    setFormData((prevFormData) => ({
      ...prevFormData,
      time: formattedTime,
    }));
  };


    return(
        <AppContext.Provider value={{
          people,
          setPeople,
          payDetails,
          setPayDetails,
          alert,
          showAlert,
          busData,
          setBusData,
          handleSelectedSeat,
          selectedBusId,
          userIsAdmin,
          userLoggedIn,
          setUserLoggedIn,
           formattedTime,
        setFormattedTime,
        formData,
        setFormData,
        rawTime,
        setRawTime,
        formatTime
          
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