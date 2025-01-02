import { useState } from 'react'
import './App.css'
import {ScheduleComponent, Day, Week, WorkWeek, Month, Agenda, Inject} from '@syncfusion/ej2-react-schedule';
function App() {
  return (
    <ScheduleComponent>
      <Inject services={[Day, Week, WorkWeek, Month, Agenda]}>
      </Inject>
    </ScheduleComponent>
  );
}

export default App
