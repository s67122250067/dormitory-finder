
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function HomePage() {
const [search, setSearch] = useState("");
const navigate = useNavigate();

function handleSearch(e) {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(search.trim())}`);
}

return (
    <main className="home-page">
    <section className="home-hero">
        <h1>🏠 ค้นหาหอพักใกล้มหาวิทยาลัย</h1>
        <p>
        ค้นหาหอพักที่เหมาะกับคุณ
        ทั้งราคา ระยะทาง และสิ่งอำนวยความสะดวก
        </p>

        <form className="home-search" onSubmit={handleSearch}>
        <input
            type="text"
            placeholder="🔍 ค้นหาชื่อหอพัก เช่น หอพัก A"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">ค้นหาหอพัก</button>
        </form>
    </section>

    <section className="home-features">
        <h2>ทำไมต้องใช้ Dormitory Finder?</h2>

        <div className="home-feature-grid">
        <article>
            <h3>🔍 ค้นหาง่าย</h3>
            <p>ค้นหาหอพักตามชื่อและประเภทได้สะดวก</p>
        </article>

        <article>
            <h3>💰 เปรียบเทียบราคา</h3>
            <p>ตรวจสอบราคาและเลือกหอพักตามงบประมาณ</p>
        </article>

        <article>
            <h3>📍 ดูระยะทาง</h3>
            <p>ตรวจสอบระยะทางและตำแหน่งหอพัก</p>
        </article>
        </div>

        <Link className="home-view-btn" to="/dormitories">
        ดูหอพักทั้งหมด →
        </Link>
    </section>
    </main>
);
}

export default HomePage;
