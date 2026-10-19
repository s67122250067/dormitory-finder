
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
auth,
getFavorites,
addFavorite,
removeFavorite
} from "../../services/firebaseService";

function FavoriteButton({ dormId }) {
const [user, setUser] = useState(null);
const [authLoading, setAuthLoading] = useState(true);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [isFavorite, setIsFavorite] = useState(false);
const [error, setError] = useState("");

useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    setAuthLoading(false);
    });

    return () => unsubscribe();
}, []);

useEffect(() => {
    let active = true;

    async function checkFavorite() {
    setLoading(true);
    setError("");
    setIsFavorite(false);

    if (!user || !dormId) {
        setLoading(false);
        return;
    }

    try {
        const favorites = await getFavorites(user.uid);

        if (active) {
        setIsFavorite(favorites.includes(dormId));
        }
    } catch (err) {
        console.error("Favorite load error:", err);
        if (active) {
        setError("ไม่สามารถตรวจสอบรายการโปรดได้");
        }
    } finally {
        if (active) {
        setLoading(false);
        }
    }
    }

    if (!authLoading) {
    checkFavorite();
    }

    return () => {
    active = false;
    };
}, [user, dormId, authLoading]);

async function handleClick() {
    if (!user || !dormId || loading || saving || error) return;

    setSaving(true);
    setError("");

    try {
    if (isFavorite) {
        await removeFavorite(user.uid, dormId);
        setIsFavorite(false);
    } else {
        await addFavorite(user.uid, dormId);
        setIsFavorite(true);
    }
    } catch (err) {
    console.error("Favorite save error:", err);
    setError("ไม่สามารถบันทึกรายการโปรดได้");
    } finally {
    setSaving(false);
    }
}

if (authLoading) {
    return <p>กำลังตรวจสอบสมาชิก...</p>;
}

if (!user) {
    return <p>กรุณาเข้าสู่ระบบก่อนบันทึกหอพัก</p>;
}

return (
    <div>
    <button
        type="button"
        className="favorite-button"
        onClick={handleClick}
        disabled={loading || saving || !!error}
    >
        {loading || saving
        ? "กำลังดำเนินการ..."
        : isFavorite
        ? "❤️ บันทึกแล้ว (กดเพื่อลบ)"
        : "🤍 บันทึกหอพักที่สนใจ"}
    </button>

    {error && (
        <div>
        <p role="alert" style={{ color: "red" }}>{error}</p>
        <button type="button" onClick={() => window.location.reload()}>
            ลองใหม่
        </button>
        </div>
    )}
    </div>
);
}

export default FavoriteButton;
