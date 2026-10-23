import { useState } from "react";
import { Link } from "react-router-dom";
import { ref, set } from "firebase/database";
import { auth, database } from "../services/firebaseService";

const questions = [
"เว็บไซต์ใช้งานง่ายและเข้าใจได้",
"สามารถค้นหาและกรองข้อมูลหอพักได้สะดวก",
"ข้อมูลราคา ระยะทาง และสิ่งอำนวยความสะดวกมีประโยชน์",
"เว็บไซต์ช่วยลดเวลาในการค้นหาและเปรียบเทียบหอพัก",
"ความพึงพอใจโดยรวมต่อเว็บไซต์"
];

export default function FeedbackPage() {
const [scores, setScores] = useState({});
const [comment, setComment] = useState("");
const [saving, setSaving] = useState(false);
const [success, setSuccess] = useState(false);
const [error, setError] = useState("");

const user = auth.currentUser;

const updateScore = (index, value) => {
    setScores((prev) => ({
    ...prev,
    [index]: Number(value)
    }));
};

async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const currentUser = auth.currentUser;

    if (!currentUser) {
    setError("กรุณาเข้าสู่ระบบก่อนส่งแบบประเมิน");
    return;
    }

    if (questions.some((_, i) => !scores[i])) {
    setError("กรุณาตอบคำถามให้ครบทุกข้อ");
    return;
    }

    setSaving(true);

    try {
    const data = {
        usability: scores[0],
        search: scores[1],
        information: scores[2],
        timeSaving: scores[3],
        satisfaction: scores[4],
        comment: comment.trim().slice(0, 1000),
        submittedAt: Date.now()
    };

    await set(
        ref(database, `feedback/${currentUser.uid}`),
        data
    );

    setSuccess(true);
    } catch (err) {
    console.error(err);
    setError("ส่งแบบประเมินไม่สำเร็จ กรุณาตรวจสอบสิทธิ์ Firebase");
    } finally {
    setSaving(false);
    }
}

if (success) {
    return (
    <main className="feedback-page">
        <section className="feedback-card">
        <h1>✅ ส่งแบบประเมินสำเร็จ</h1>
        <p>ขอบคุณที่ร่วมประเมินเว็บไซต์ Dormitory Finder</p>
        <Link to="/">กลับหน้าแรก</Link>
        </section>
    </main>
    );
}

return (
    <main className="feedback-page">
    <section className="feedback-card">
        <h1>📝 แบบประเมินความพึงพอใจ</h1>
        <p>ระบบค้นหาหอพักใกล้มหาวิทยาลัย (Dormitory Finder)</p>

        <p>
        ระดับคะแนน: 1 = น้อยที่สุด | 2 = น้อย |
        3 = ปานกลาง | 4 = มาก | 5 = มากที่สุด
        </p>

        {!user && (
        <p className="feedback-error">
            กรุณา <Link to="/login">เข้าสู่ระบบ</Link> ก่อนส่งแบบประเมิน
        </p>
        )}

        <form onSubmit={handleSubmit}>
        {questions.map((question, index) => (
            <div className="feedback-question" key={index}>
            <p><strong>{index + 1}. {question}</strong></p>

            <div className="feedback-options">
                {[1, 2, 3, 4, 5].map((number) => (
                <label key={number}>
                    <input
                    type="radio"
                    name={`question-${index}`}
                    value={number}
                    checked={scores[index] === number}
                    onChange={() => updateScore(index, number)}
                    required
                    />
                    {number}
                </label>
                ))}
            </div>
            </div>
        ))}

        <label htmlFor="feedback-comment">
            <strong>ข้อเสนอแนะเพิ่มเติม</strong>
        </label>

        <textarea
            id="feedback-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="ข้อเสนอแนะเกี่ยวกับเว็บไซต์..."
        />

        {error && <p className="feedback-error">{error}</p>}

        <button
            type="submit"
            className="feedback-submit"
            disabled={saving || !user}
        >
            {saving ? "กำลังส่ง..." : "ส่งแบบประเมิน"}
        </button>
        </form>
    </section>
    </main>
);
}
