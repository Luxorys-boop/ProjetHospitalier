import React from 'react'
import './Popup.css'
function Popup(props) {
    return (props.trigger) ? (
        <div className="popup">
            <div className="popup-inner">
                <div className='containerButtons'>
                    <button onClick={() => {
                        props.setTrigger(false);
                        let tab = document.getElementsByTagName("table");
                        for(let i = 0 ; i < tab.length ; i++) {
                            tab[i].style.display = "revert";
                        }
                        document.getElementsByClassName("theadmaker")[0].style.position = "sticky";
                        console.log(document.getElementsByClassName("besoins-table"));
                    }} className="close-btn">Fermer</button>
                    { props.children }
                </div>
                
            </div>
        </div>
    ) : "";
}
export default Popup