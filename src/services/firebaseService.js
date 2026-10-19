
import { initializeApp } from "firebase/app";
import {
getDatabase,
ref,
get,
set,
remove
} from "firebase/database";
import { getAuth } from "firebase/auth";

// ตั้งค่า Firebase Project
const firebaseConfig = {
apiKey: "AIzaSyAgUmUZ69Et4B4fOhkNAkVfcWFdIrZyLZc",
authDomain: "dormitory-finder-63028.firebaseapp.com",
databaseURL: "https://dormitory-finder-63028-default-rtdb.asia-southeast1.firebasedatabase.app",
projectId: "dormitory-finder-63028",
storageBucket: "dormitory-finder-63028.firebasestorage.app",
messagingSenderId: "288334676663",
appId: "1:288334676663:web:e9e6c6b81177ce8e7f0332"
};

// เริ่มต้น Firebase
const app = initializeApp(firebaseConfig);

// ระบบ Authentication
export const auth = getAuth(app);

// ระบบ Realtime Database
export const database = getDatabase(app);

// =====================================
// 1. ดึงข้อมูลหอพักทั้งหมด
// =====================================
export async function getDormitories() {
const snapshot = await get(ref(database, "dormitories"));

if (!snapshot.exists()) {
    return [];
}

return Object.entries(snapshot.val()).map(([id, dorm]) => ({
    ...dorm,
    id
}));
}

// =====================================
// 2. ดึงรายการหอพักที่สนใจของสมาชิก
// =====================================
export async function getFavorites(uid) {
if (!uid) {
    throw new Error("กรุณาเข้าสู่ระบบก่อน");
}

const snapshot = await get(ref(database, `favorites/${uid}`));

if (!snapshot.exists()) {
    return [];
}

return Object.entries(snapshot.val())
    .filter(([, value]) => value === true)
    .map(([dormId]) => dormId);
}

// =====================================
// 3. เพิ่มหอพักเข้ารายการโปรด
// =====================================
export async function addFavorite(uid, dormId) {
if (!uid || !dormId) {
    throw new Error("ข้อมูลผู้ใช้หรือหอพักไม่ถูกต้อง");
}

await set(
    ref(database, `favorites/${uid}/${dormId}`),
    true
);
}

// =====================================
// 4. ลบหอพักออกจากรายการโปรด
// =====================================
export async function removeFavorite(uid, dormId) {
if (!uid || !dormId) {
    throw new Error("ข้อมูลผู้ใช้หรือหอพักไม่ถูกต้อง");
}

await remove(
    ref(database, `favorites/${uid}/${dormId}`)
);
}


export async function checkAdmin(uid) {
if (!uid) {
    return false;
}

const adminRef = ref(database, `admins/${uid}`);
const snapshot = await get(adminRef);

return snapshot.exists() && snapshot.val() === true;
}

function validateDormitory(dorm) {
if (
    !dorm.dorm_name?.trim() ||
    !dorm.dorm_type?.trim() ||
    !Number.isFinite(Number(dorm.price_min)) ||
    Number(dorm.price_min) < 0 ||
    !Number.isFinite(Number(dorm.distance)) ||
    Number(dorm.distance) < 0
) {
    throw new Error("กรุณากรอกข้อมูลหอพักให้ถูกต้อง");
}
}

// เพิ่มหรือบันทึกข้อมูลหอพัก
export async function saveDormitory(dormId, dorm) {
if (!dormId || !/^dorm_[a-zA-Z0-9_-]+$/.test(dormId)) {
    throw new Error("รหัสหอพักไม่ถูกต้อง");
}

validateDormitory(dorm);

await set(ref(database, `dormitories/${dormId}`), {
    ...dorm,
    dorm_name: dorm.dorm_name.trim(),
    dorm_type: dorm.dorm_type.trim(),
    price_min: Number(dorm.price_min),
    distance: Number(dorm.distance),
    updated_at: new Date().toISOString().slice(0, 10)
});
}

// ลบข้อมูลหอพัก
export async function deleteDormitory(dormId) {
if (!dormId || !/^dorm_[a-zA-Z0-9_-]+$/.test(dormId)) {
    throw new Error("รหัสหอพักไม่ถูกต้อง");
}

await remove(ref(database, `dormitories/${dormId}`));
}
