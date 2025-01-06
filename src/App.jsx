import React, { useState } from 'react';

function App() {
  const [year] = useState(getYear());
  const [month] = useState(getMonth());
  const startDay = new Date(year, getMonthIndex(month), 1).getDay(); // Jour de la semaine du 1er du mois

  const TableRow = () => {
    const days = Array.from({ length: 30 }, (_, index) => {
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

  return (
    <table>
      <thead>
        <tr>
          <td>{month} {year}</td>
        </tr>
      </thead>
      <tbody>
        <TableRow />
      </tbody>
    </table>
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

export default App;
