import { DemoMeterImage } from "../types";

export const DEMO_METERS: DemoMeterImage[] = [
  {
    id: "elec-1",
    name: "มิเตอร์ไฟฟ้าบ้านทั่วไป (Mitsubishi Type)",
    type: "electricity",
    brand: "Mitsubishi",
    imageUrl: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&w=800&q=80",
    description: "มิเตอร์ไฟจานหมุนแบบดั้งเดิมที่ใช้ตามบ้านเรือนทั่วไปในประเทศไทย แสดงผลแบบล้อตัวเลข 5 หลัก",
    readingValue: "18452",
  },
  {
    id: "water-1",
    name: "มิเตอร์น้ำทองเหลือง (Asahi Type)",
    type: "water",
    brand: "Asahi",
    imageUrl: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=800&q=80",
    description: "มิเตอร์น้ำประปาตัวเรือนทองเหลือง แสดงตัวเลขสีดำสำหรับหน่วยลูกบาศก์เมตร (คิว) และเข็มชี้ทศนิยม",
    readingValue: "0342.8",
  },
  {
    id: "elec-2",
    name: "ดิจิทัลสมาร์ทมิเตอร์ (Digital Smart Meter)",
    type: "electricity",
    brand: "Holley",
    imageUrl: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=800&q=80",
    description: "มิเตอร์ไฟฟ้าระบบดิจิทัลรุ่นใหม่ แสดงผลบนหน้าจอ LCD แสดงค่าละเอียดพร้อมทศนิยมและไฟสถานะ",
    readingValue: "07259.4",
  },
  {
    id: "water-2",
    name: "มิเตอร์น้ำประปาคอนโด (Sanwa Type)",
    type: "water",
    brand: "Sanwa",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
    description: "มิเตอร์วัดน้ำประปาขนาดเล็กสำหรับอาคารชุดหรือห้องเช่า อ่านค่าง่าย ตัวเลขแสดงหลักชัดเจน",
    readingValue: "128.5",
  },
];
