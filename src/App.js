import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import './styles/marketplace.css';
import AppShell from './components/layout/AppShell';
import HomePage from './pages/HomePage';
import RentalDetailsPage from './pages/RentalDetailsPage'; // our clean single page
import { AdminDashboardPage, AuthPage, CategoriesPage, ExplorePage, HowItWorksPage, ListItemPage, MyBookingsPage, MyListingsPage } from './pages/MarketplacePages';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<AppShell />}>
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/rentals/:id" element={<RentalDetailsPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/list-your-item" element={<ListItemPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/my-listings" element={<MyListingsPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}