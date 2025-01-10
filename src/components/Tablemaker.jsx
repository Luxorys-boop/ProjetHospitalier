import React, { useState } from 'react';
function TableMaker() {
    const [year] = useState(getYear());
    const [month] = useState(getMonth());
    const startDay = new Date(year, getMonthIndex(month), 1).getDay(); // Jour de la semaine du 1er du mois
    const daysInMonth = getDaysInMonth(year, getMonthIndex(month));
    //Get le nombre de jour dans le mois
    const TableRow = () => {
        const days = Array.from({ length: daysInMonth }, (_, index) => {
        const dayOfWeek = (startDay + index) % 7; // Calculer le jour de la semaine
        return `${getDay(dayOfWeek)}${index + 1} `;
        });

        return (
        <tr>
            {days.map((day, index) => (
            <td key={index}>{day}</td>
            ))}
        </tr>
        );
    }

    const WeekRow = () => {
      const weeks = Array.from({ length: Math.ceil(daysInMonth / 7) }, (_, index) => {
        return `S${getWeekOfYear(year, getMonthIndex(month), index * 7 + 1)}`; 
      });
        return ( 
        <tr>
           {weeks.map((week, index) => ( <td key={index} colSpan="7">{week}</td> ))} 
        </tr>
        ); 
      }

    return (
        <><h3 class="month">{month} {year}</h3><table>
        <thead >
            <WeekRow />
            <TableRow />
        </thead>
        <tbody class="userTable">

        </tbody>
        </table></>
    );
}

// Fonction pour obtenir le jour de la semaine en fonction de l'index
function getDay(index) {
  const daysOfWeek = ["D", "L", "M", "Me", "J", "V", "S"];
  return daysOfWeek[index];
}

// Fonctions mock pour l'année et le mois
function getYear() {
  return new Date().getFullYear();
}

function getMonth() {
  const monthsOfYear = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  return monthsOfYear[new Date().getMonth()];
}

function getMonthIndex(month) {
  const monthsOfYear = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  return monthsOfYear.indexOf(month);
}

function getDaysInMonth(year, monthIndex) { 
  return new Date(year, monthIndex + 1, 0).getDate();
}

function getWeekOfYear(year, monthIndex, day) {
  const date = new Date(year, monthIndex, day); 
  const startOfYear = new Date(year, 0, 1); 
  const diff = (date - startOfYear + (startOfYear.getTimezoneOffset() - date.getTimezoneOffset()) * 60000) / 86400000; 
  return Math.ceil((diff + startOfYear.getDay() + 1) / 7); 
}
export default TableMaker;