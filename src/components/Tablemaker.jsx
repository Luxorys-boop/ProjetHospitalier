import React, { useState, useEffect } from "react";
import TableUser from "./TableUser";
import "./Tablemaker.css";

function TableMaker({ onUserSelectionChange }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refresh, setRefresh] = useState(false);
  const [assignations, setAssignations] = useState([]);

  // Fonction pour changer le mois et rafraîchir les données
  const changeMonth = (delta) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
    setRefresh((prev) => !prev);
  };

  // Récupérer les assignations de la base de données
  const fetchAssignations = async () => {
    try {
      const response = await fetch("http://localhost:5001/get-assignations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mois: currentDate.getMonth() + 1,
          annee: currentDate.getFullYear(),
        }),
      });
      if (!response.ok) throw new Error("Erreur lors de la récupération des assignations.");
      const data = await response.json();
      setAssignations(data);
    } catch (error) {
      console.error("Erreur lors du chargement des assignations :", error);
    }
  };

  // Charger les assignations à chaque changement de mois ou rafraîchissement
  useEffect(() => {
    fetchAssignations();
  }, [currentDate, refresh]);

  const year = currentDate.getFullYear();
  const month = getMonth(currentDate.getMonth());
  const startDay = new Date(year, currentDate.getMonth(), 1).getDay();
  const daysInMonth = getDaysInMonth(year, currentDate.getMonth());

  // Générer les en-têtes des jours
  const TableRow = () => {
    const days = Array.from({ length: daysInMonth }, (_, index) => {
      const dayOfWeek = (startDay + index) % 7;
      return `${getDay(dayOfWeek)}${index + 1}`;
    });

    return (
      <tr>
        <th>ID</th>
        {days.map((day, index) => (
          <th key={index}>{day}</th>
        ))}
      </tr>
    );
  };

  // Générer les en-têtes des semaines
  const WeekRow = () => {
    const weeks = Array.from({ length: Math.ceil(daysInMonth / 7) }, (_, index) => {
      return `S${getWeekOfYear(year, currentDate.getMonth(), index * 7 + 1)}`;
    });
    return (
      <tr>
        <th colSpan={1}></th>
        {weeks.map((week, index) => (
          <th key={index} colSpan="7">{week}</th>
        ))}
      </tr>
    );
  };

  return (
    <div className="table-container">
      {/* Navigation pour défiler les mois */}
      <div className="month-navigation">
        <button className="nav-button" onClick={() => changeMonth(-1)}>←</button>
        <h3 className="month-title">{month} {year}</h3>
        <button className="nav-button" onClick={() => changeMonth(1)}>→</button>
      </div>

      {/* Tableau principal */}
      <table className="tablemaker">
        <thead className="theadmaker">
          <WeekRow />
          <TableRow />
        </thead>
        <tbody className="userTable">
          <TableUser
            daysInMonth={daysInMonth}
            refresh={refresh}
            assignations={assignations}
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

// Fonction pour obtenir le mois en fonction de l'index
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