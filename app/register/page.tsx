import Link from 'next/link';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { signup } from '@/app/auth/actions';
import GoogleLoginButton from '../login/GoogleLoginButton';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams;
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans" style={{ backgroundColor: '#09090D' }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#E5E7EB]">
          สร้างบัญชีใหม่
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          หรือ{' '}
          <Link href="/login" className="font-medium text-[#84CC16] hover:text-[#65A30D] transition-colors">
            เข้าสู่ระบบหากมีบัญชีอยู่แล้ว
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border" style={{ backgroundColor: '#14141C', borderColor: '#22222E' }}>
          
          {message && (
            <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/50 text-red-500 text-sm text-center">
              {message}
            </div>
          )}

          <form className="space-y-6" action={signup}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                ชื่อผู้ใช้ (Username)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="focus:ring-[#84CC16] focus:border-[#84CC16] block w-full pl-10 sm:text-sm rounded-xl py-2.5 border transition-colors outline-none"
                  style={{ backgroundColor: '#09090D', borderColor: '#22222E', color: '#E5E7EB' }}
                  placeholder="Trading Master"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                อีเมล
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="focus:ring-[#84CC16] focus:border-[#84CC16] block w-full pl-10 sm:text-sm rounded-xl py-2.5 border transition-colors outline-none"
                  style={{ backgroundColor: '#09090D', borderColor: '#22222E', color: '#E5E7EB' }}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                รหัสผ่าน
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="focus:ring-[#84CC16] focus:border-[#84CC16] block w-full pl-10 sm:text-sm rounded-xl py-2.5 border transition-colors outline-none"
                  style={{ backgroundColor: '#09090D', borderColor: '#22222E', color: '#E5E7EB' }}
                  placeholder="ความยาวอย่างน้อย 8 ตัวอักษร"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#14141C] focus:ring-[#84CC16]"
                style={{ backgroundColor: '#84CC16', color: '#152007' }}
              >
                สมัครสมาชิก
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: '#22222E' }} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-slate-400" style={{ backgroundColor: '#14141C' }}>
                  หรือสมัครผ่าน
                </span>
              </div>
            </div>

            <div className="mt-6">
              <GoogleLoginButton text="สมัครสมาชิกด้วย Google" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
