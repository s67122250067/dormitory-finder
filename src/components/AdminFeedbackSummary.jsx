
import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { database } from "../services/firebaseService";

const questions = [
{ key: "usability", label: "เว็บไซต์ใช้งานง่ายและเข้าใจได้" },
{ key: "search", label: "ค้นหาและกรองข้อมูลหอพักได้สะดวก" },
{ key: "information", label: "ข้อมูลหอพักมีประโยชน์" },
{ key: "timeSaving", label: "เว็บไซต์ช่วยลดเวลาในการค้นหาหอพัก" },
{ key: "satisfaction", label: "ความพึงพอใจโดยรวมต่อเว็บไซต์" }
];

export default function AdminFeedbackSummary() {
const [feedback, setFeedback] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
    const feedbackRef = ref(database, "feedback");

    const unsubscribe = onValue(
    feedbackRef,
    (snapshot) => {
        const data = snapshot.val() || {};

        const records = Object.values(data).filter(
        (item) =>
            item &&
            questions.every(
            ({ key }) =>
                Number.isInteger(item[key]) &&
                item[key] >= 1 &&
                item[key] <= 5
            )
        );

        setFeedback(records);
        setLoading(false);
        setError("");
    },
    (err) => {
        console.error("Feedback error:", err);
        setError("ไม่สามารถโหลดผลประเมินได้ กรุณาตรวจสอบ Firebase Rules");
        setLoading(false);
    }
    );

    return () => unsubscribe();
}, []);

const count = feedback.length;

const results = questions.map((question) => {
    const total = feedback.reduce(
    (sum, item) => sum + item[question.key],
    0
    );

    const average = count > 0 ? total / count : 0;

    return {
    ...question,
    average,
      percentage: (average / 5) * 100
    };
});

const overallAverage =
    count > 0
    ? results.reduce((sum, item) => sum + item.average, 0) /
        results.length
    : 0;

const satisfaction = results.find(
    (item) => item.key === "satisfaction"
);

return (
    <section className="admin-feedback-panel">
    <h2>📊 ผลประเมินความพึงพอใจของผู้ใช้งาน</h2>
    <p>สรุปคะแนนจากแบบประเมินเว็บไซต์ Dormitory Finder</p>

    {loading && <p>กำลังโหลดผลประเมิน...</p>}

    {error && <p className="feedback-error">{error}</p>}

    {!loading && !error && count === 0 && (
        <p>ยังไม่มีข้อมูลแบบประเมินจากผู้ใช้งาน</p>
    )}

    {!loading && !error && count > 0 && (
        <>
        <div className="admin-feedback-stats">
            <div>
            <span>จำนวนผู้ตอบ</span>
            <strong>{count} คน</strong>
            </div>

            <div>
            <span>ความพึงพอใจโดยรวม</span>
            <strong>
                {satisfaction.percentage.toFixed(2)}%
            </strong>
            </div>

            <div>
            <span>คะแนนเฉลี่ยทุกข้อ</span>
            <strong>
                {overallAverage.toFixed(2)} / 5
            </strong>
            </div>

            <div>
            <span>ร้อยละของคะแนนเฉลี่ยทุกข้อ</span>
            <strong>
                {((overallAverage / 5) * 100).toFixed(2)}%
            </strong>
            </div>
        </div>

        <div className="admin-feedback-list">
            {results.map((item, index) => (
            <div className="admin-feedback-item" key={item.key}>
                <div className="admin-feedback-item-title">
                <span>{index + 1}. {item.label}</span>
                <strong>{item.percentage.toFixed(2)}%</strong>
                </div>

                <div className="admin-feedback-progress">
                <div style={{ width: `${item.percentage}%` }} />
                </div>

                <small>
                เฉลี่ย {item.average.toFixed(2)} จาก 5 คะแนน
                </small>
            </div>
            ))}
        </div>

        <p className="admin-feedback-note">
            เปอร์เซ็นต์ = (คะแนนเฉลี่ย ÷ 5) × 100
            โดยนับหนึ่งชุดคำตอบต่อบัญชีผู้ใช้
        </p>
        </>
    )}
    </section>
);
}
