
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, checkAdmin } from "../services/firebaseService";

export default function AdminNavLink() {
const [isAdmin, setIsAdmin] = useState(false);

useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
    setIsAdmin(false);

    if (!user) return;

    try {
        const allowed = await checkAdmin(user.uid);
        if (active) setIsAdmin(allowed);
    } catch (error) {
        console.error("Admin check failed:", error);
        if (active) setIsAdmin(false);
    }
    });

    return () => {
    active = false;
    unsubscribe();
    };
}, []);

if (!isAdmin) return null;

return (
    <Link to="/admin" className="admin-nav-link">
    🛠️ จัดการหอพัก
    </Link>
);
}
