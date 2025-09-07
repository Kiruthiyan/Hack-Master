import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// --- Component Imports ---
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import StartupPage from "./components/StartupPage";
import LoginPage from "./components/AuthButtons";
// +++ THIS IS THE CORRECTED LINE +++
import ContactPage from "./components/ContactPage";
import AddStudent from "./components/AddStudent";
import AddAdvertisement from "./components/AddAdvertisement";
import AddIdea from "./components/AddIdea";
import TalentDashboard from "./components/TalentDashboard";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import Company from "./components/Company";
import FindUsPage from "./components/FindUsPage";
import "./App.css";
function App() {
return (
<BrowserRouter>
<div className="App">
<AuthProvider>
<Navigation />
<main>
<Routes>
{/* --- Public Routes --- */}
<Route path="/home" element={<HomePage />} />
<Route path="/talentD" element={<TalentDashboard />} />
<Route path="/startup" element={<StartupPage />} />
<Route path="/contact" element={<ContactPage />} />
<Route path="/login" element={<LoginPage />} />
<Route path="/findus" element={<FindUsPage />} />
<Route path="/company" element={<Company />}/>


{/* --- Private Routes (Protected) --- */}
          <Route element={<PrivateRoute />}>
            <Route path="/add" element={<AddStudent />} />
            <Route path="/post-idea" element={<AddIdea />} />
            <Route path="/post-ad" element={<AddAdvertisement />} />
            <Route path="/talentD" element={<TalentDashboard />} />
          </Route>

          {/* --- Redirects & Catch-all --- */}
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </main>
      <Footer />
    </AuthProvider>
  </div>
</BrowserRouter>
);
}
export default App;