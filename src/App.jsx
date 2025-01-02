import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Inject, ScheduleComponent, Day, Week, WorkWeek, Month, Agenda } from '@syncfusion/ej2-react-schedule';


function App() {
  return <ScheduleComponent>
    <Inject services={[Day, Week, WorkWeek, Month, Agenda]}
  </ScheduleComponent>;
}

export default App
