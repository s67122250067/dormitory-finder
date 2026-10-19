import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getDormitories } from "../services/firebaseService";

function SearchResultsPage() {
const [params] = useSearchParams();
const keyword = params.get("q") || "";

const [dormitories, setDormitories] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
    async function loadData() {
    try {
        const data = await getDormitories();
        setDormitories(data);
    } catch (err) {
        console.error(err);
        setError("โหลดข้อมูลหอพักไม่สำเร็จ");
    } finally {
        setLoading(false);
    }
    }

    loadData();
}, []);

const results = dormitories.filter((dorm) =>
    (dorm.dorm_name || "")
    .toLowerCase()
    .includes(keyword.trim().toLowerCase())
);

return (
    <main className="listing-container">
    <h1>🔍 ผลการค้นหาหอพัก</h1>
    <p>คำค้นหา: {keyword || "ทั้งหมด"}</p>

    {loading && <p>กำลังค้นหา...</p>}
    {error && <p role="alert">{error}</p>}

    {!loading && !error && (
        <>
        <p>พบ {results.length} รายการ</p>

        {results.length === 0 && (
            <p>ไม่พบหอพักที่ตรงกับคำค้นหา</p>
        )}

        <section className="listing-grid">
            {results.map((dorm) => (
            <article className="listing-card" key={dorm.id}>
                <img
                src={`/images/${dorm.id}.jpg`}
                alt={dorm.dorm_name}
                />

                <div className="listing-card-body">
                <h3>{dorm.dorm_name}</h3>
                <p>{dorm.dorm_type}</p>
                <p className="listing-price">
                    ฿{Number(dorm.price_min).toLocaleString("th-TH")}
                    <span> / เดือน</span>
                </p>
                <p>📍 {dorm.distance} กม.</p>

                <Link
                    className="listing-detail-btn"
                    to={`/dormitories/${dorm.id}`}
                >
                    ดูรายละเอียด →
                </Link>
                </div>
            </article>
            ))}
        </section>
        </>
    )}
    </main>
);
}

export default SearchResultsPage;
