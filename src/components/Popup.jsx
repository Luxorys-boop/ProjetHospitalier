import React from 'react'
import './Popup.css'
function Popup(props) {
    return (props.trigger) ? (
        <div className="popup">
            <div className="popup-inner">
                <div className='containerButtons'>
                    <button onClick={() => {
                        props.setTrigger(false);
                        document.getElementsByClassName("theadmaker")[0].style.position = "sticky";
                        document.getElementsByClassName("theadmaker")[1].style.display = "revert";
                    }} className="close-btn">Close</button>
                    { props.children }
                </div>
                
            </div>
        </div>
    ) : "";
}
export default Popup