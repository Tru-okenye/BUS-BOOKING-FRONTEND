import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from './Context';
import Outbox from './Outbox';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { utcToZonedTime, format } from 'date-fns-tz';

const libraries = ["places", "geocoding", "geometry"];

const CreateBusForm = () => {
 

  const { alert, showAlert } = useGlobalContext();
  const navigate = useNavigate();

  const autocompleteFromRef = useRef(null);
  const autocompleteToRef = useRef(null);
 

const { formData, setFormData, rawTime, setRawTime } = useGlobalContext();




  const { isLoaded, loadError } = useJsApiLoader({
   googleMapsApiKey: "AIzaSyCivwKyWPJekwIy1H7y4EHkmE3FgC005Ng",
    libraries: libraries,
  });

  const handlePlaceChange = (value, field) => {
    setFormData({ ...formData, [field]: value });
  };

const handleInputChange = (e) => {
  const { name, value } = e.target;

  if (name === 'time') {
    console.log(value); // Add this line to check the rawTime value
    setRawTime(value);
  }

  setFormData((prevFormData) => ({
    ...prevFormData,
    [name]: value,
  }));
};




 const handleSubmit = (e) => {
  e.preventDefault();

  
  for (const field in formData) {
    if (formData[field] === '') {
      showAlert(true, 'danger', 'Please fill in all fields!');
      return;
    }
  }

  // Perform create operation using the form data
  fetch('https://lets-ride-fe42d9bf40d4.herokuapp.com/api/buses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error && data.error.includes('Bus with the same number plate already exists')) {
        showAlert(true, 'danger', 'Bus with the same number plate already exists');
      } else {
        showAlert(true, 'success', 'New bus created!');
        console.log('Bus created successfully:', data);
        navigate('/content'); // Navigate back to the previous page
      }
    })
    .catch((error) => {
      console.log('Error creating bus:', error);
    });
};


  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (loadError) {
    return <div>Error loading Google Maps API</div>;
  }

  return (
    <>
    <div className="update bg">  
    <div>
      <h2>Create Bus</h2>
      <form onSubmit={handleSubmit}>
        {alert.show && <Outbox {...alert} removeAlert={showAlert} />}
        <label>
          From:
          </label><br />
          <Autocomplete
            onLoad={(autocomplete) => (autocompleteFromRef.current = autocomplete)}
            onPlaceChanged={() =>
              handlePlaceChange(autocompleteFromRef.current.getPlace().formatted_address, 'from')
            }
          >
            <input
              type="text"
              name="from"
              value={formData.from}
              onChange={handleInputChange}
              placeholder="Enter origin"
            />
          </Autocomplete>
        
        <label>
          To:
          <Autocomplete
            onLoad={(autocomplete) => (autocompleteToRef.current = autocomplete)}
            onPlaceChanged={() =>
              handlePlaceChange(autocompleteToRef.current.getPlace().formatted_address, 'to')
            }
          >
            <input
              type="text"
              name="to"
              value={formData.to}
              onChange={handleInputChange}
              placeholder="Enter destination"
            />
          </Autocomplete>
        </label>
        <br />
        <label>
          Amount:
          </label> <br />
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
          /><br></br>
        
        <label>
          Date:
          </label><br />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
          /><br></br>
        
        <label>
          Time:
           </label> <br />
          <input
            type="text"
            name="time"
             value={rawTime}
            onChange={handleInputChange}
          /><br></br>
       
        <label>
          Seats:
          </label><br />
          <input
            type="number"
            name="seats"
            value={formData.seats}
            onChange={handleInputChange}
          /><br></br>
       
        <label>
          Driver Name: 
          </label><br />
          <input
            type="text"
            name="driver_name"
            value={formData.driver_name}
            onChange={handleInputChange}
          /><br></br>
        
        <label>
          Number Plate: 
           </label><br />
          <input
            type="text"
            name="number_plate"
            value={formData.number_plate}
            onChange={handleInputChange}
          /><br></br>
       
        <label>
          Driver Phone Number: 
          </label><br />
          <input
            type="text"
            name="driver_phone_number"
            value={formData.driver_phone_number}
            onChange={handleInputChange}
          /><br></br>
        
       
       <button type="submit" >Create Bus</button>
      </form>
    </div>
     </div>
      </>
  );
};

export default CreateBusForm;