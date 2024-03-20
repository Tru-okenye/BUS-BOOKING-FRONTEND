import React, {useContext, useEffect} from "react";
import {FaTimes} from 'react-icons/fa';
import { Link } from 'react-router-dom';

import './App.css';
import { useGlobalContext } from "./Context";
const Sidebar = () => {
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
   
<div className="sideside">



          <Link to="/changeseat" className='Link'>
            ChangeSeat
          </Link>
      
          <Link to="/Voucher" className='Link'>
            Voucher 
          </Link>
    
          <Link to="/bushistory" className='Link'>
            History
          </Link>
 
</div>


    </div>
<button className="icon"   onClick={closeSidebar}>
<FaTimes/>

</button>





</aside>
)
};

export default Sidebar;