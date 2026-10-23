import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { get, ref } from "firebase/database";
import { auth, database, checkAdmin } from "../services/firebaseService";

const questions = [
{ key: "usability", label: "เว็บไซต์ใช้งานง่ายและเข้าใจได้" },
{ key: "search", label: "ค้นหาและกรองข้อมูลหอพักได้สะดวก" },
{ key: "information", label: "ข้อมูลหอพักมีประโยชน์" },
{ key: "timeSaving", label: "ช่วยลดเวลาในการค้นหาหอพัก" },
{ key: "satisfaction", label: "ความพึงพอใจโดยรวมต่อเว็บไซต์" }
];

function percent(score) {
  return (score / 5) * 100;
}

export default function FeedbackResultsPage() {
const [loading, setLoading] = useState(true);
const [authorized, setAuthorized] = useState(false);
const [rows, setRows] = useState([]);
const [error, setError] = useState("");

useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!active) return;

    setLoading(true);
    setAuthorized(false);
    setError("");

    if (!user) {
        setLoading(false);
        return;
    }

    try {
        const admin = await checkAdmin(user.uid);
        if (!active) return;

        if (!admin) {
        setError("หน้านี้สำหรับผู้ดูแลระบบเท่านั้น");
        return;
        }

        setAuthorized(true);

        const snapshot = await get(ref(database, "feedback"));
        if (!active) return;

        const data = snapshot.val() || {};

        const validRows = Object.values(data).filter((item) =>
        item &&
        questions.every(({ key }) =>
            Number.isInteger(item[key]) &&
            item[key] >= 1 &&
            item[key] <= 5
        )
        );

        setRows(validRows);
    } catch (err) {
        console.error(err);
        if (active) {
        setError("โหลดผลประเมินไม่สำเร็จ กรุณาตรวจสอบ Firebase Rules");
        }
    } finally {
        if (active) setLoading(false);
    }
    });

    return () => {
    active = false;
    unsubscribe();
    };
}, []);

if (loading) {
    return (
    <main className="feedback-results-page">
        <p>กำลังโหลดผลการประเมิน...</p>
    </main>
    );
}

if (!authorized || error) {
    return (
    <main className="feedback-results-page">
        <h2>🔒 ผลประเมินสำหรับ Admin</h2>
        <p>{error || "กรุณาเข้าสู่ระบบด้วยบัญชี Admin"}</p>
        <Link to="/login">เข้าสู่ระบบ</Link>
    </main>
    );
}

const summary = questions.map((question) => {
    const total = rows.reduce(
    (sum, item) => sum + item[question.key],
    0
    );

    const average = rows.length ? total / rows.length : 0;

    return {
    ...question,
    average,
    percentage: percent(average)
    };
});

const overallAverage =
    rows.length
    ? summary.reduce((sum, item) => sum + item.average, 0) /
        questions.length
    : 0;

const satisfaction = summary.find(
    (item) => item.key === "satisfaction"
);

return (
    <main className="feedback-results-page">
    <section className="feedback-results-card">
        <h1>📊 สรุปผลการประเมินเว็บไซต์</h1>
        <p>ระบบค้นหาหอพักใกล้มหาวิทยาลัย (Dormitory Finder)</p>

        <div className="feedback-stats">
        <div>
            <span>จำนวนผู้ตอบแบบประเมิน</span>
            <strong>{rows.length} คน</strong>
        </div>

        <div>
            <span>ความพึงพอใจโดยรวม</span>
            <strong>
            {satisfaction.percentage.toFixed(2)}%
            </strong>
        </div>

        <div>
            <span>คะแนนเฉลี่ยทั้งแบบประเมิน</span>
            <strong>
            {overallAverage.toFixed(2)} / 5
            </strong>
        </div>

        <div>
            <span>ร้อยละของคะแนนเฉลี่ยทั้งหมด</span>
            <strong>
            {percent(overallAverage).toFixed(2)}%
            </strong>
        </div>
        </div>

        {rows.length === 0 ? (
        <p>ยังไม่มีผู้ส่งแบบประเมิน</p>
        ) : (
        <>
            <h2>ผลการประเมินรายข้อ</h2>

            {summary.map((item, index) => (
            <div className="feedback-result" key={item.key}>
                <div className="feedback-result-heading">
                <strong>
                    {index + 1}. {item.label}
                </strong>

                <strong>
                    {item.percentage.toFixed(2)}%
                </strong>
                </div>

                <div className="feedback-progress">
                <div
                    style={{
                    width: `${item.percentage}%`
                    }}
                />
                </div>

                <small>
                คะแนนเฉลี่ย {item.average.toFixed(2)} จาก 5
                </small>
            </div>
            ))}
        </>
        )}

        <p className="feedback-note">
        หมายเหตุ: เปอร์เซ็นต์คำนวณจากคะแนนเฉลี่ย
        หารด้วยคะแนนเต็ม 5 แล้วคูณ 100
        โดยนับหนึ่งชุดคำตอบต่อบัญชีผู้ใช้
        </p>

        <Link to="/admin">← กลับหน้า Admin Dashboard</Link>
    </section>
    </main>
);
}
