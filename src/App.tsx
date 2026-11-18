import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import CategoriesPage from "./pages/CategoriesPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import RentalDetailsPage from "./pages/RentalDetailsPage";
import ListItemPage from "./pages/ListItemPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import HostDashboardPage from "./pages/HostDashboardPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import AuthPage from "./pages/AuthPage";
import ChatBot from "./components/ui/ChatBot";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-surface font-body text-on-surface antialiased">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/rentals/:id" element={<RentalDetailsPage />} />
            <Route path="/list-your-item" element={<ListItemPage />} />
            <Route path="/host-dashboard" element={<HostDashboardPage />} />
            <Route path="/my-listings" element={<HostDashboardPage initialTab="inventory" />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/login" element={<AuthPage initialMode="login" />} />
            <Route path="/register" element={<AuthPage initialMode="register" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <ChatBot />
      </div>
    </BrowserRouter>
  );
};

export default App;

