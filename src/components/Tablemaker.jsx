import React, { useState } from 'react';
import TableUser from './TableUser';
import "./Tablemaker.css";

function TableMaker({ onUserSelectionChange }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refresh, setRefresh] = useState(false);

  const changeMonth = (delta) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
    setRefresh(prev => !prev);
  };

  const year = currentDate.getFullYear();
  const month = getMonth(currentDate.getMonth());
  const startDay = new Date(year, currentDate.getMonth(), 1).getDay();
  const daysInMonth = getDaysInMonth(year, currentDate.getMonth());

  /**
   * Fonction permettant de créer les jours dans le tableau.
   */
  const TableRow = () => {
    const days = Array.from({ length: daysInMonth }, (_, index) => {
      const dayOfWeek = (startDay + index) % 7;
      const isWeekEnd = (index + 1) % 7 === 0; // Ajouter une classe pour la séparation des semaines
      return (
        <th key={index} className={isWeekEnd ? "week-separator" : ""}>
          {getDay(dayOfWeek)}{index + 1}
        </th>
      );
    });

    return (
      <tr>
        <th>ID</th>
        {days}
      </tr>
    );
  };

  /**
   * Fonction permettant d'afficher les semaines avec séparation.
   */
  const WeekRow = () => {
    const weeks = Array.from({ length: Math.ceil(daysInMonth / 7) }, (_, index) => {
      return `S${getWeekOfYear(year, currentDate.getMonth(), index * 7 + 1)}`;
    });

    return (
      <tr>
        <th></th>
        {weeks.map((week, index) => (
          <th key={index} colSpan="7" className="week-separator">{week}</th>
        ))}
      </tr>
    );
  };

  return (
    <div className="table-container">
      <div className="month-navigation">
        <button className="nav-button" onClick={() => changeMonth(-1)}>←</button>
        <h3 className="month-title">{month} {year}</h3>
        <button className="nav-button" onClick={() => changeMonth(1)}>→</button>
      </div>
      <table className="tablemaker">
        <thead className='theadmaker'>
          <WeekRow />
          <TableRow />
        </thead>
        <tbody className="userTable">
          <TableUser 
            daysInMonth={daysInMonth} 
            refresh={refresh} 
            onUserSelectionChange={onUserSelectionChange} 
          />
        </tbody>
      </table>
    </div>
  );
}

// Fonction pour obtenir le jour de la semaine en fonction de l'index
function getDay(index) {
  const daysOfWeek = ["D", "L", "M", "Me", "J", "V", "S"];
  return daysOfWeek[index];
}

// Fonction pour obtenir le nom du mois en fonction de l'index
function getMonth(index) {
  const monthsOfYear = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  return monthsOfYear[index];
}

// Fonction pour obtenir le nombre de jours dans un mois donné
function getDaysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

// Fonction pour obtenir le numéro de la semaine d'une date donnée
function getWeekOfYear(year, monthIndex, day) {
  const date = new Date(year, monthIndex, day);
  const startOfYear = new Date(year, 0, 1);
  const diff = (date - startOfYear + (startOfYear.getTimezoneOffset() - date.getTimezoneOffset()) * 60000) / 86400000;
  return Math.ceil((diff + startOfYear.getDay() + 1) / 7);
}

export default TableMaker;