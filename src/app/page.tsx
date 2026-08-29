import Link from "next/link";
import { GraduationCap, BarChart3, Shield, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-kku-primary" />
            <div>
              <h1 className="text-lg font-bold text-kku-primary">KKU HR Analytics</h1>
              <p className="text-xs text-gray-500">มหาวิทยาลัยขอนแก่น</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl text-center">
          <div className="mb-8">
            <GraduationCap className="h-20 w-20 text-kku-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              ระบบ Dashboard ข้อมูลบุคลากร
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              มหาวิทยาลัยขอนแก่น
            </p>
            <p className="text-gray-500">
              ระบบวิเคราะห์และแสดงผลข้อมูลบุคลากร สำหรับผู้บริหารและเจ้าหน้าที่
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Data Visualization</h3>
              <p className="text-sm text-gray-500">แผนภูมิและกราฟข้อมูลบุคลากร</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Personnel Analytics</h3>
              <p className="text-sm text-gray-500">วิเคราะห์ข้อมูลตามคณะ/หน่วยงาน</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Secure Access</h3>
              <p className="text-sm text-gray-500">เข้าสู่ระบบด้วย KKU SSO</p>
            </div>
          </div>

          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 bg-kku-primary text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-kku-primary/90 transition-colors"
          >
            <GraduationCap className="h-5 w-5" />
            เข้าสู่ระบบด้วย KKU SSO
          </Link>
        </div>
      </main>

      <footer className="border-t bg-white py-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} KKU Personnel Analytics Dashboard
      </footer>
    </div>
  );
}