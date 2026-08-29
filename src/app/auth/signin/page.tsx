import { signIn } from "@/lib/auth";
import { GraduationCap } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: "บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานระบบ กรุณาติดต่อผู้ดูแลระบบ",
  missing_code: "ไม่พบข้อมูลยืนยันตัวตนจาก KKU SSO",
  missing_email: "ไม่พบอีเมลจาก KKU SSO",
  missing_access_token: "ไม่พบ token จาก KKU SSO",
  token_exchange_failed: "การยืนยันตัวตนกับ KKU SSO ล้มเหลว",
  invalid_token_response: "ข้อมูลจาก KKU SSO ไม่ถูกต้อง",
  server_error: "เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่ภายหลัง",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = error ? ERROR_MESSAGES[error] ?? "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border">
        <GraduationCap className="h-12 w-12 text-kku-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ระบบ Dashboard ข้อมูลบุคลากร
        </h1>
        <p className="text-gray-500 mb-6">มหาวิทยาลัยขอนแก่น</p>

        {message && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {message}
          </div>
        )}

        <form
          action={async () => {
            "use server";
            await signIn("kku", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="w-full bg-kku-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-kku-primary/90 transition-colors inline-flex items-center justify-center gap-2"
          >
            <GraduationCap className="h-5 w-5" />
            เข้าสู่ระบบด้วย KKU SSO
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-400">
          ล็อกอินผ่านระบบ Single Sign-On ของมหาวิทยาลัย
        </p>
      </div>
    </div>
  );
}