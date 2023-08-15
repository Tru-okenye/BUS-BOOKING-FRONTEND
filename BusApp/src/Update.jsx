
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGlobalContext } from './Context';
import Outbox from './Outbox';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';


const libraries = ["places", "geocoding", "geometry"];

const UpdateBusForm = () => {
  const { id } = useParams(); // Get the bus ID from the URL


  const { alert, showAlert } = useGlobalContext();
  const navigate = useNavigate();
const {  formData, setFormData, rawTime, setRawTime } = useGlobalContext();
  const autocompleteFromRef = useRef(null);
  const autocompleteToRef = useRef(null);
 

  const { isLoaded, loadError } = useJsApiLoader({
   googleMapsApiKey: "AIzaSyCivwKyWPJekwIy1H7y4EHkmE3FgC005Ng",
    libraries: libraries,
  });

  useEffect(() => {
    // Fetch the bus data using the ID
    fetch(`https://lets-ride-fe42d9bf40d4.herokuapp.com/api/buses/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setFormData(data);
      })
      .catch((error) => {
        console.log('Error fetching bus:', error);
      });
  }, [id]);

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



    // Perform update operation using the form data
    fetch(`https://lets-ride-fe42d9bf40d4.herokuapp.com/api/buses/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Bus updated successfully:', data);
        navigate('/content'); // Navigate back to the previous page
        showAlert(true, 'success', 'Bus updated successfully!');
      })
      .catch((error) => {
        console.log('Error updating bus:', error);
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
    <div className="update  bg">
      <div>

      <h2>Update Bus</h2>
      <form onSubmit={handleSubmit}>
        {alert.show && <Outbox {...alert} removeAlert={showAlert} />}
        <label>
          From:
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
            />
          </Autocomplete>
        </label>
        <br />
        <label>
          To:
          <Autocomplete
            onLoad={(autocomplete) => (autocompleteToRef.current = autocomplete)}
            onPlaceChanged={() =>
              handlePlaceChange(autocompleteToRef.current.getPlace().formatted_address, 'to')
            }
          >
            <input type="text" name="to" value={formData.to} onChange={handleInputChange} />
          </Autocomplete>
        </label>
        <br />
        <label>
          Amount:
          </label><br></br>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
          />
        <br />
        <label>
          Date:
           </label><br></br>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
          />
       
        <br />
         <label>
          Time:
          </label><br></br>
          <input
            type="text"
            name="time"
             value={rawTime}
            onChange={handleInputChange}
          />
        
        <br />
        <label>
          Seats:
          </label><br></br>
          <input
            type="number"
            name="seats"
            value={formData.seats}
            onChange={handleInputChange}
          />
        
        <br />
        <label>
          Driver Name: {/* New field */}
           </label><br></br>
          <input
            type="text"
            name="driver_name"
            value={formData.driver_name}
            onChange={handleInputChange}
          />
       
        <br />
        <label>
          Number Plate: {/* New field */}
          </label><br />
          <input
            type="text"
            name="number_plate"
            value={formData.number_plate}
            onChange={handleInputChange}
          /><br></br>
        
        
        <label>
          Driver Phone Number: 
          </label><br></br>
          <input
            type="text"
            name="driver_phone_number"
            value={formData.driver_phone_number}
            onChange={handleInputChange}
          /><br></br>
        
        <button type="submit">Update Bus</button>
      </form>
       </div>
    </div>
    </>
  );
};

export default UpdateBusForm;

