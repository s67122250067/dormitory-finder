
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDormitories } from "../services/firebaseService";

function DormitoryListPage() {
const [dormitories, setDormitories] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [search, setSearch] = useState("");
const [type, setType] = useState("ทั้งหมด");
const [maxPrice, setMaxPrice] = useState("");
const [wifi, setWifi] = useState(false);
const [air, setAir] = useState(false);
const [sort, setSort] = useState("default");

useEffect(() => {
    async function loadData() {
    try {
        const data = await getDormitories();
        setDormitories(data);
    } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูลจาก Firebase ได้");
    } finally {
        setLoading(false);
    }
    }
    loadData();
}, []);

const filtered = dormitories.filter((dorm) => {
    const matchSearch = (dorm.dorm_name || "")
    .toLowerCase()
    .includes(search.toLowerCase());

    const matchType =
    type === "ทั้งหมด" || dorm.dorm_type === type;

    const matchPrice =
    maxPrice === "" ||
    Number(dorm.price_min) <= Number(maxPrice);

    return (
    matchSearch &&
    matchType &&
    matchPrice &&
    (!wifi || dorm.wifi === true) &&
    (!air || dorm.air_conditioner === true)
    );
}).sort((a, b) => {
    if (sort === "low")
    return Number(a.price_min) - Number(b.price_min);
    if (sort === "high")
    return Number(b.price_min) - Number(a.price_min);
    if (sort === "distance")
    return Number(a.distance) - Number(b.distance);
    return 0;
});

function resetFilters() {
    setSearch("");
    setType("ทั้งหมด");
    setMaxPrice("");
    setWifi(false);
    setAir(false);
    setSort("default");
}

return (
    <main className="listing-page">
    <section className="listing-hero">
        <h1>🏠 ค้นหาหอพักใกล้มหาวิทยาลัย</h1>
        <p>ค้นหาหอพักที่ตรงใจ ทั้งราคา ระยะทาง และสิ่งอำนวยความสะดวก</p>
    </section>

    <div className="listing-container">
        <section className="search-panel">
        <h2>🔎 ค้นหาหอพัก</h2>

        <input
            className="search-input"
            type="text"
            placeholder="พิมพ์ชื่อหอพักที่ต้องการ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />

        <div className="filter-grid">
            <div className="filter-field">
            <label htmlFor="dorm-type">ประเภทหอพัก</label>
            <select
                id="dorm-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
            >
                <option value="ทั้งหมด">ทุกประเภท</option>
                <option value="หอพักรวม">หอพักรวม</option>
                <option value="หอพักชาย">หอพักชาย</option>
                <option value="หอพักหญิง">หอพักหญิง</option>
            </select>
            </div>

            <div className="filter-field">
            <label htmlFor="max-price">ราคาเริ่มต้นไม่เกิน (บาท)</label>
            <input
                id="max-price"
                type="number"
                min="0"
                placeholder="เช่น 4000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
            />
            </div>

            <div className="filter-field">
            <label htmlFor="sort-dorms">เรียงลำดับ</label>
            <select
                id="sort-dorms"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
            >
                <option value="default">ค่าเริ่มต้น</option>
                <option value="low">ราคาน้อยไปมาก</option>
                <option value="high">ราคามากไปน้อย</option>
                <option value="distance">ระยะทางใกล้ที่สุด</option>
            </select>
            </div>
        </div>

        <div className="filter-bottom">
            <div className="filter-checks">
            <label>
                <input
                type="checkbox"
                checked={wifi}
                onChange={(e) => setWifi(e.target.checked)}
                />
                มี Wi-Fi
            </label>

            <label>
                <input
                type="checkbox"
                checked={air}
                onChange={(e) => setAir(e.target.checked)}
                />
                มีเครื่องปรับอากาศ
            </label>
            </div>

            <button className="reset-button" onClick={resetFilters}>
            ล้างตัวกรอง
            </button>
        </div>
        </section>

        <div className="listing-heading">
        <h2>หอพักทั้งหมด</h2>
        {!loading && !error && (
            <span>พบ {filtered.length} รายการ</span>
        )}
        </div>

        {loading && <p className="status-text">กำลังโหลดข้อมูล...</p>}
        {error && <p className="status-text" role="alert">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
        <p className="status-text">ไม่พบหอพักที่ตรงกับเงื่อนไข</p>
        )}

        {!loading && !error && (
        <section className="listing-grid">
            {filtered.map((dorm) => (
            <article className="listing-card" key={dorm.id}>
                <img
                src={`/images/${dorm.id}.jpg`}
                alt={`รูปภาพ ${dorm.dorm_name}`}
                onError={(e) => {
                    e.currentTarget.style.display = "none";
                }}
                />

                <div className="listing-card-body">
                <h3>{dorm.dorm_name}</h3>
                <p className="listing-type">{dorm.dorm_type}</p>

                <p className="listing-price">
                    ฿{Number(dorm.price_min).toLocaleString("th-TH")}
                    <span> / เดือน</span>
                </p>

                <p>📍 ห่างจากมหาวิทยาลัย {dorm.distance} กม.</p>

                <div className="listing-facilities">
                    {dorm.wifi && <span>Wi-Fi</span>}
                    {dorm.air_conditioner && <span>แอร์</span>}
                    {dorm.parking && <span>ที่จอดรถ</span>}
                    {dorm.furniture && <span>เฟอร์นิเจอร์</span>}
                </div>

                <Link
                    className="listing-detail-btn"
                    to={`/dormitories/${dorm.id}`}
                >
                    ดูรายละเอียดหอพัก →
                </Link>
                </div>
            </article>
            ))}
        </section>
        )}
    </div>
    </main>
);
}

export default DormitoryListPage;
