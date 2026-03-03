import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from "./Layout"
import ClassManagement from "./Pages/ClassManagement"
import FeeManagement from "./Pages/FeeManagement"
import Home from "./Pages/Home"
import Exams from "./Pages/Exams"
import AdmissionManagement from "./Pages/AdmissionManagement"
import SalaryManagement from "./Pages/SalaryManagement"
import Communication from './Pages/communication';
import Login from './Pages/login';
import Braodcast from './Pages/braodcast';
import UserManagement from './Pages/UserManagement';
import Timetable from './Pages/timeTable';
import Attendance from './Pages/attendance';
import EventsManagement from './Pages/events';
import RouterProtector from './routerProtector';

function App() {
return (
  <Router>
    <Routes>

      <Route path="/" element={<Login />} />

      <Route path="/home" element={<RouterProtector><Layout /></RouterProtector>}>

        <Route index element={<Home />} />
        <Route path="classmateManagement" element={<ClassManagement />} />

        <Route path='userManagement/:type' element={<UserManagement />} />
        {/* Admission Management Routes */}
        <Route path="AdmissionManagement" element={<AdmissionManagement view="dashboard" />} />
        <Route path="admissions/applications" element={<AdmissionManagement view="applications" />} />
        <Route path="admissions/forms" element={<AdmissionManagement view="forms" />} />

        <Route path='timetable' element={<Timetable />} />

        <Route path="SalaryManagement" element={<SalaryManagement />} />
        <Route path="FeeManagement" element={<FeeManagement />} />
        <Route path="communication/:activeTab" element={<Communication />} />
        <Route path='broadcast' element={<Braodcast />} />
        <Route path="exams" element={<Exams />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="events" element={<EventsManagement />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />

      </Route>

    </Routes>
  </Router>
);

}

export default App
