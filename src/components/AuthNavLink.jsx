import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../services/firebaseService";

export default function AuthNavLink() {
const [user, setUser] = useState(null);

useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    });

    return () => unsubscribe();
}, []);

async function handleLogout() {
    try {
    await signOut(auth);
    } catch (error) {
    console.error("Logout failed:", error);
    alert("ออกจากระบบไม่สำเร็จ");
    }
}

if (!user) {
    return <Link to="/login">เข้าสู่ระบบ</Link>;
}

return (
    <div className="auth-nav">
    <span className="auth-email" title={user.email || ""}>
        {user.email || "บัญชีผู้ใช้"}
    </span>

    <button
        type="button"
        className="auth-logout"
        onClick={handleLogout}
    >
        ออกจากระบบ
    </button>
    </div>
);
}
