import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { CalendarComponent } from '@syncfusion/ej2-react-calendars'
import * as React from 'react';
import { useRef } from 'react';
import * as ReactDOM from 'react-dom';
import {
  ScheduleComponent, Day, Week, WorkWeek, Month, Inject,
  ViewsDirective, ViewDirective
} from '@syncfusion/ej2-react-schedule';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';

function App() {
  return (<ScheduleComponent>
    <Inject services = {[Jour, Semaine, SemaineTravail, Mois, Agenda]}></Inject>
  </ScheduleComponent>);
}

export default App
ReactDOM.render(<App/>, document.getElementById("schedule"));
