import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { AuthProvider } from '../context/AuthContext';
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/Dashboard';
import Events from '../pages/Events';
import Resources from '../pages/Resources';
import AddResource from '../pages/AddResource';
import CreateEvent from '../pages/CreateEvent';
import ViewEventDetails from '../pages/ViewEventDetails';
import ViewSubmissions from '../pages/ViewSubmissions';
import ProjectSubmission from '../pages/ProjectSubmission';
import Rules from '../pages/Rules';
import ReportIssue from '../pages/ReportIssue';
import PaymentPage from '../pages/PaymentPage';



function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-light flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/create" element={<CreateEvent />} />
            <Route path="/view-event/:id" element={<ViewEventDetails />} />
            <Route path="/view-event/:id/submissions" element={<ViewSubmissions />} />
            <Route path="/view-event/:id/submit" element={<ProjectSubmission />} />
            <Route path="/view-event/:id/rules" element={<Rules />} />
            <Route path="/view-event/:id/report" element={<ReportIssue />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/add" element={<AddResource />} />
            <Route path="/payment" element={<PaymentPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;