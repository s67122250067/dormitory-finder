import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
signOut,
onAuthStateChanged
} from "firebase/auth";
import { auth } from "../services/firebaseService";

function LoginPage() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [user, setUser] = useState(null);
const [mode, setMode] = useState("login");
const [loading, setLoading] = useState(true);
const [submitting, setSubmitting] = useState(false);
const [message, setMessage] = useState("");
const [error, setError] = useState("");

useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    setLoading(false);
    });
    return () => unsubscribe();
}, []);

async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
    if (mode === "register") {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage("สมัครสมาชิกสำเร็จ");
    } else {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage("เข้าสู่ระบบสำเร็จ");
    }
    setPassword("");
    } catch (err) {
    console.error(err.code);

    if (err.code === "auth/email-already-in-use") {
        setError("อีเมลนี้ถูกใช้สมัครสมาชิกแล้ว");
    } else if (err.code === "auth/weak-password") {
        setError("กรุณาตั้งรหัสผ่านอย่างน้อย 6 ตัวอักษร");
    } else if (err.code === "auth/invalid-email") {
        setError("รูปแบบอีเมลไม่ถูกต้อง");
    } else if (err.code === "auth/invalid-credential") {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } else {
        setError("ไม่สามารถดำเนินการได้ กรุณาลองใหม่");
    }
    } finally {
    setSubmitting(false);
    }
}

async function handleLogout() {
    setError("");
    setMessage("");
    try {
    await signOut(auth);
    setMessage("ออกจากระบบเรียบร้อยแล้ว");
    } catch {
    setError("ไม่สามารถออกจากระบบได้");
    }
}

if (loading) {
    return <main className="login-page">กำลังตรวจสอบผู้ใช้งาน...</main>;
}

return (
    <main className="login-page">
    <section className="login-card">
        <h1>🏠 Dormitory Finder</h1>

        {user ? (
        <>
            <h2>เข้าสู่ระบบแล้ว</h2>
            <p>อีเมล: {user.email}</p>
            <p>คุณสามารถค้นหาหอพักได้แล้ว</p>
            <Link to="/dormitories">ดูหอพักทั้งหมด</Link>
            <button
            className="login-button"
            onClick={handleLogout}
            >
            ออกจากระบบ
            </button>
        </>
        ) : (
        <>
            <h2>
            {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </h2>

            <form onSubmit={handleSubmit}>
            <label htmlFor="email">อีเมล</label>
            <input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <label htmlFor="password">รหัสผ่าน</label>
            <input
                id="password"
                type="password"
                placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
            />

            <button
                className="login-button"
                type="submit"
                disabled={submitting}
            >
                {submitting
                ? "กำลังดำเนินการ..."
                : mode === "login"
                ? "เข้าสู่ระบบ"
                : "สมัครสมาชิก"}
            </button>
            </form>

            <button
            className="switch-button"
            onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
                setMessage("");
            }}
            >
            {mode === "login"
                ? "ยังไม่มีบัญชี? สมัครสมาชิก"
                : "มีบัญชีแล้ว? เข้าสู่ระบบ"}
            </button>
        </>
        )}

        {message && <p className="login-success">{message}</p>}
        {error && <p role="alert" className="login-error">{error}</p>}
    </section>
    </main>
);
}

export default LoginPage;
