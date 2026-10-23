
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import HomePage from "./pages/HomePage";
import DormitoryListPage from "./pages/DormitoryListPage";
import DormitoryDetailPage from "./pages/DormitoryDetailPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import LoginPage from "./pages/LoginPage";
import FavoritesPage from "./pages/FavoritesPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import FeedbackPage from "./pages/FeedbackPage";
import FeedbackResultsPage from "./pages/FeedbackResultsPage";
import AdminNavLink from "./components/AdminNavLink";
import AuthNavLink from "./components/AuthNavLink";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      {/* ส่วนหัวเว็บไซต์ */}
      <header
        style={{
          background: "#ffffff",
          padding: "20px 8%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <h2 style={{ color: "#2563eb", margin: 0 }}>
          🏠 Dormitory Finder
        </h2>

        {/* เมนูนำทาง */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <Link to="/">หน้าแรก</Link>

          <Link to="/dormitories">
            หอพักทั้งหมด
          </Link>

          <Link to="/favorites">
            ❤️ รายการโปรด
          </Link>

          <Link to="/feedback">
            📝 ประเมินเว็บไซต์
          </Link>

          {/* แสดงเฉพาะผู้ดูแลระบบ */}
          <AdminNavLink />

          {/* แสดง Login หรืออีเมลผู้ใช้ */}
          <AuthNavLink />
        </nav>
      </header>

      {/* เส้นทางหน้าเว็บไซต์ */}
      <Routes>
        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/dormitories"
          element={<DormitoryListPage />}
        />

        <Route
          path="/dormitories/:id"
          element={<DormitoryDetailPage />}
        />

        <Route
          path="/search"
          element={<SearchResultsPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/favorites"
          element={<FavoritesPage />}
        />

        <Route
          path="/admin"
          element={<AdminDashboardPage />}
        />

        <Route
          path="/feedback"
          element={<FeedbackPage />}
        />

        <Route
        path="/admin/feedback"
        element={<FeedbackResultsPage />}
/>
      </Routes>

      {/* ส่วนท้ายเว็บไซต์ */}
      <footer
        style={{
          background: "#1e293b",
          color: "white",
          padding: "25px",
          textAlign: "center",
        }}
      >
        <p>ระบบค้นหาหอพักใกล้มหาวิทยาลัย</p>
        <p>© 2026 Dormitory Finder</p>
      </footer>
    </BrowserRouter>
  );
}

export default App;
