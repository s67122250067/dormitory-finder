import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, checkAdmin, getDormitories, saveDormitory, deleteDormitory } from "../services/firebaseService";

const emptyForm = {
dorm_name: "",
dorm_type: "หอพักรวม",
description: "",
address: "",
price_min: "",
price_max: "",
distance: "",
room_type: "ห้องแอร์",
wifi: false,
air_conditioner: false,
parking: false,
furniture: false,
phone: "",
facebook: "",
line: ""
};

function AdminDashboardPage() {
const [user, setUser] = useState(null);
const [isAdmin, setIsAdmin] = useState(false);
const [loading, setLoading] = useState(true);
const [dormitories, setDormitories] = useState([]);
const [form, setForm] = useState(emptyForm);
const [editingId, setEditingId] = useState("");
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");
const [message, setMessage] = useState("");

useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (!active) return;

    setUser(currentUser);
    setLoading(true);
    setError("");
    setIsAdmin(false);

    if (!currentUser) {
        setLoading(false);
        return;
    }

    try {
        const admin = await checkAdmin(currentUser.uid);
        if (!active) return;

        setIsAdmin(admin);

        if (admin) {
        const data = await getDormitories();
        if (active) setDormitories(data);
        }
    } catch (err) {
        console.error(err);
        if (active) setError("ตรวจสอบสิทธิ์ Admin ไม่สำเร็จ");
    } finally {
        if (active) setLoading(false);
    }
    });

    return () => {
    active = false;
    unsubscribe();
    };
}, []);

function updateForm(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value
    }));
}

function resetForm() {
    setForm({ ...emptyForm });
    setEditingId("");
}

async function reloadDormitories() {
    const data = await getDormitories();
    setDormitories(data);
}

function handleEdit(dorm) {
    setEditingId(dorm.id);
    setForm({
    ...emptyForm,
    ...dorm
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function handleSave(e) {
    e.preventDefault();
    if (!user || !isAdmin || saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
    const id = editingId || `dorm_${Date.now()}`;

    const payload = {
        ...form,
        price_min: Number(form.price_min),
        price_max: Number(form.price_max),
        distance: Number(form.distance)
    };

    if (
        form.price_min === "" ||
        form.price_max === "" ||
        form.distance === "" ||
        !Number.isFinite(payload.price_min) ||
        !Number.isFinite(payload.price_max) ||
        !Number.isFinite(payload.distance) ||
        payload.price_max < payload.price_min
    ) {
        throw new Error("กรุณาตรวจสอบราคาและระยะทาง");
    }

    await saveDormitory(id, payload);
    await reloadDormitories();
    resetForm();
    setMessage("บันทึกข้อมูลหอพักสำเร็จ");
    } catch (err) {
    console.error(err);
    setError(err.message || "บันทึกข้อมูลไม่สำเร็จ");
    } finally {
    setSaving(false);
    }
}

async function handleDelete(dormId) {
    if (!user || !isAdmin || saving) return;

    const confirmed = window.confirm(
    `ต้องการลบหอพัก ${dormId} ใช่หรือไม่?`
    );
    if (!confirmed) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
    await deleteDormitory(dormId);
    await reloadDormitories();
    setMessage("ลบข้อมูลหอพักสำเร็จ");

    if (editingId === dormId) resetForm();
    } catch (err) {
    console.error(err);
    setError("ลบข้อมูลหอพักไม่สำเร็จ");
    } finally {
    setSaving(false);
    }
}

if (loading) {
    return <main className="admin-page"><p>กำลังตรวจสอบสิทธิ์...</p></main>;
}

if (!user) {
    return (
    <main className="admin-page">
        <h1>🔐 ผู้ดูแลระบบ</h1>
        <p>กรุณาเข้าสู่ระบบก่อน</p>
    </main>
    );
}

if (!isAdmin) {
    return (
    <main className="admin-page">
        <h1>⛔ ไม่มีสิทธิ์เข้าถึง</h1>
        <p>{error || "บัญชีนี้ไม่ใช่ผู้ดูแลระบบ"}</p>
    </main>
    );
}

return (
    <main className="admin-page">
    <h1>🛠️ Admin Dashboard</h1>
    <p>จัดการข้อมูลหอพักในระบบ Dormitory Finder</p>

    {error && <p className="admin-error" role="alert">{error}</p>}
    {message && <p className="admin-success">{message}</p>}

    <section className="admin-panel">
        <h2>{editingId ? "แก้ไขข้อมูลหอพัก" : "เพิ่มหอพักใหม่"}</h2>

        <form className="admin-form" onSubmit={handleSave}>
        <label>
            ชื่อหอพัก
            <input name="dorm_name" value={form.dorm_name}
            onChange={updateForm} required />
        </label>

        <label>
            ประเภทหอพัก
            <select name="dorm_type" value={form.dorm_type}
            onChange={updateForm}>
            <option>หอพักรวม</option>
            <option>หอพักชาย</option>
            <option>หอพักหญิง</option>
            </select>
        </label>

        <label>
            รายละเอียด
            <textarea name="description" value={form.description}
            onChange={updateForm} />
        </label>

        <label>
            ที่อยู่
            <input name="address" value={form.address}
            onChange={updateForm} />
        </label>

        <label>
            ราคาเริ่มต้น (บาท)
            <input type="number" min="0" name="price_min"
            value={form.price_min} onChange={updateForm} required />
        </label>

        <label>
            ราคาสูงสุด (บาท)
            <input type="number" min="0" name="price_max"
            value={form.price_max} onChange={updateForm} required />
        </label>

        <label>
            ระยะทาง (กม.)
            <input type="number" min="0" step="0.1" name="distance"
            value={form.distance} onChange={updateForm} required />
        </label>

        <label>
            ประเภทห้อง
            <select name="room_type" value={form.room_type}
            onChange={updateForm}>
            <option>ห้องแอร์</option>
            <option>ห้องพัดลม</option>
            </select>
        </label>

        <label>
            เบอร์โทรศัพท์
            <input name="phone" value={form.phone}
            onChange={updateForm} />
        </label>

        <label>
            Facebook
            <input name="facebook" value={form.facebook}
            onChange={updateForm} />
        </label>

        <label>
            LINE
        <input name="line" value={form.line}
onChange={updateForm} />
        </label>

        <div className="admin-checkboxes">
            {[
            ["wifi", "Wi-Fi"],
            ["air_conditioner", "เครื่องปรับอากาศ"],
            ["parking", "ที่จอดรถ"],
            ["furniture", "เฟอร์นิเจอร์"]
            ].map(([name, label]) => (
            <label key={name}>
                <input type="checkbox" name={name}
                checked={Boolean(form[name])}
                onChange={updateForm} />
                {label}
            </label>
            ))}
        </div>

        <div className="admin-actions">
            <button type="submit" disabled={saving}>
    {saving ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "เพิ่มหอพัก"}
            </button>
            <button type="button" onClick={resetForm}>
        ล้างฟอร์ม
            </button>
        </div>
        </form>
    </section>

    <section className="admin-panel">
        <h2>รายการหอพัก ({dormitories.length})</h2>

        <div className="admin-table-wrap">
        <table className="admin-table">
            <thead>
            <tr>
                <th>รหัส</th>
                <th>ชื่อหอพัก</th>
                <th>ราคาเริ่มต้น</th>
                <th>จัดการ</th>
            </tr>
            </thead>
            <tbody>
            {dormitories.map((dorm) => (
                <tr key={dorm.id}>
                <td>{dorm.id}</td>
                <td>{dorm.dorm_name}</td>
                <td>{Number(dorm.price_min).toLocaleString("th-TH")} บาท</td>
                <td>
                    <button type="button" onClick={() => handleEdit(dorm)}
                    disabled={saving}>แก้ไข</button>
                    <button type="button" className="admin-delete"
                    onClick={() => handleDelete(dorm.id)}
                    disabled={saving}>ลบ</button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </section>
    </main>
);
}

export default AdminDashboardPage;
