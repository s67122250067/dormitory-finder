import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ref, get } from "firebase/database";
import { database } from "../services/firebaseService";
import FavoriteButton from "../components/features/FavoriteButton";

function DormitoryDetailPage() {
const { id } = useParams();
const [dorm, setDorm] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
    async function loadDormitory() {
    setLoading(true);
    setError("");

    try {
        const snapshot = await get(ref(database, `dormitories/${id}`));
        setDorm(snapshot.exists() ? snapshot.val() : null);
    } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูลหอพักได้");
    } finally {
        setLoading(false);
    }
    }

    loadDormitory();
}, [id]);

if (loading) return <main><p>กำลังโหลดข้อมูล...</p></main>;

if (error) return <main><p role="alert">{error}</p></main>;

if (!dorm) return <main><p>ไม่พบข้อมูลหอพัก</p></main>;

const mapUrl =
    Number.isFinite(Number(dorm.latitude)) &&
    Number.isFinite(Number(dorm.longitude)) &&
    dorm.latitude != null &&
    dorm.longitude != null
    ? `https://www.google.com/maps?q=${dorm.latitude},${dorm.longitude}`
    : null;

return (
    <main className="detail-page">
    <Link to="/dormitories">← กลับรายการหอพัก</Link>

    <h1>🏠 {dorm.dorm_name}</h1>
    <FavoriteButton dormId={id} />
    <p>{dorm.description}</p>

    <section className="detail-card">
        <h2>ข้อมูลหอพัก</h2>
        <p><strong>ประเภท:</strong> {dorm.dorm_type}</p>
        <p><strong>ที่อยู่:</strong> {dorm.address}</p>
        <p>
        <strong>ราคา:</strong>{" "}
        {Number(dorm.price_min).toLocaleString("th-TH")} -
        {" "}{Number(dorm.price_max).toLocaleString("th-TH")} บาท/เดือน
        </p>
        <p><strong>ประเภทห้อง:</strong> {dorm.room_type}</p>
        <p><strong>ระยะทาง:</strong> {dorm.distance} กม.</p>

        <h2>สิ่งอำนวยความสะดวก</h2>
        <p>Wi-Fi: {dorm.wifi ? "✅ มี" : "❌ ไม่มี"}</p>
        <p>เครื่องปรับอากาศ: {dorm.air_conditioner ? "✅ มี" : "❌ ไม่มี"}</p>
        <p>ที่จอดรถ: {dorm.parking ? "✅ มี" : "❌ ไม่มี"}</p>
        <p>เฟอร์นิเจอร์: {dorm.furniture ? "✅ มี" : "❌ ไม่มี"}</p>

        <h2>ข้อมูลติดต่อ</h2>
        <p>โทรศัพท์: {dorm.phone || "ไม่มีข้อมูล"}</p>
        <p>Facebook: {dorm.facebook || "ไม่มีข้อมูล"}</p>
        <p>LINE: {dorm.line || "ไม่มีข้อมูล"}</p>

        <h2>ตำแหน่งหอพัก</h2>
        {mapUrl ? (
        <a href={mapUrl} target="_blank" rel="noopener noreferrer">
            📍 เปิดตำแหน่งใน Google Maps
        </a>
        ) : (
        <p>ไม่มีข้อมูลตำแหน่ง</p>
        )}
        <p className="sample-note">
        หมายเหตุ: ข้อมูลหอพัก A, B และ C เป็นข้อมูลตัวอย่าง
        สำหรับทดสอบระบบ
        </p>
    </section>
    </main>
);
}

export default DormitoryDetailPage;
