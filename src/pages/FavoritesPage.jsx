import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
auth,
getDormitories,
getFavorites,
removeFavorite
} from "../services/firebaseService";

function FavoritesPage() {
const [user, setUser] = useState(undefined);
const [dormitories, setDormitories] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [removingId, setRemovingId] = useState(null);

useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (!active) return;

    setUser(currentUser);
    setLoading(true);
    setError("");

    if (!currentUser) {
        setDormitories([]);
        setLoading(false);
        return;
    }

    try {
        const [allDorms, favoriteIds] = await Promise.all([
        getDormitories(),
        getFavorites(currentUser.uid)
        ]);

        if (active) {
        setDormitories(
            allDorms.filter((dorm) =>
            favoriteIds.includes(dorm.id)
            )
        );
        }
    } catch (err) {
        console.error(err);
        if (active) {
        setError("ไม่สามารถโหลดรายการโปรดได้");
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

async function handleRemove(dormId) {
    if (!user || removingId) return;

    setRemovingId(dormId);
    setError("");

    try {
    await removeFavorite(user.uid, dormId);
    setDormitories((items) =>
        items.filter((dorm) => dorm.id !== dormId)
    );
    } catch (err) {
    console.error(err);
    setError("ไม่สามารถลบรายการโปรดได้");
    } finally {
    setRemovingId(null);
    }
}

if (loading || user === undefined) {
    return (
    <main className="favorites-page">
        <p>กำลังโหลดรายการโปรด...</p>
    </main>
    );
}

if (!user) {
    return (
    <main className="favorites-page">
        <h1>❤️ หอพักที่สนใจ</h1>
        <p>กรุณาเข้าสู่ระบบก่อน</p>
        <Link to="/login">เข้าสู่ระบบ</Link>
    </main>
    );
}

return (
    <main className="favorites-page">
    <h1>❤️ หอพักที่สนใจ</h1>
    <p>รายการหอพักที่คุณบันทึกไว้</p>

    {error && <p role="alert">{error}</p>}

    {dormitories.length === 0 ? (
        <div className="favorites-empty">
        <h2>ยังไม่มีหอพักที่สนใจ</h2>
        <Link to="/dormitories">
            ค้นหาหอพัก
        </Link>
        </div>
    ) : (
        <div className="listing-grid">
        {dormitories.map((dorm) => (
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
                ดูรายละเอียดหอพัก
                </Link>

                <button
                className="remove-favorite-btn"
                onClick={() => handleRemove(dorm.id)}
                disabled={removingId !== null}
                >
                {removingId === dorm.id
                    ? "กำลังลบ..."
                    : "ลบออกจากรายการโปรด"}
                </button>
            </div>
            </article>
        ))}
        </div>
    )}
    </main>
);
}

export default FavoritesPage;
