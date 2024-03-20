import React, {useContext, useEffect} from "react";
import {FaTimes} from 'react-icons/fa';
import { Link } from 'react-router-dom';

import './App.css';
import { useGlobalContext } from "./Context";
const HomeSidebar = () => {

    const{showSidebar, closeSidebar} = useGlobalContext()
    // Close the sidebar when the component rerenders
    useEffect(() => {
        if (showSidebar) {
          closeSidebar();
        }
      }, []);
return (
  <aside className={`${showSidebar?' sidebar' : 'display'} `}>
 

    
    <div className="ptn">
   
<h3>Search ticket to delete or reschedule</h3>
<div className="sideside">
<button className="linkbtn">

          <Link to="/ticketsearch" className='Link'>
            SearchTicket
          </Link>
</button>
    
 
</div>


    </div>
<button className="icon"   onClick={closeSidebar}>
<FaTimes/>

</button>





</aside>
)
};

export default HomeSidebar;