import Link from 'next/link';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { login } from '@/app/auth/actions';
import GoogleLoginButton from './GoogleLoginButton';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams;
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans" style={{ backgroundColor: '#09090D' }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#E5E7EB]">
          เข้าสู่ระบบ
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          หรือ{' '}
          <Link href="/register" className="font-medium text-[#84CC16] hover:text-[#65A30D] transition-colors">
            สมัครสมาชิกใหม่ที่นี่
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

          <form className="space-y-6" action={login}>
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
                  autoComplete="current-password"
                  required
                  className="focus:ring-[#84CC16] focus:border-[#84CC16] block w-full pl-10 sm:text-sm rounded-xl py-2.5 border transition-colors outline-none"
                  style={{ backgroundColor: '#09090D', borderColor: '#22222E', color: '#E5E7EB' }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 focus:ring-[#84CC16]"
                  style={{ accentColor: '#84CC16' }}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                  จดจำฉันไว้ในระบบ
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-[#84CC16] hover:text-[#65A30D] transition-colors">
                  ลืมรหัสผ่าน?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#14141C] focus:ring-[#84CC16]"
                style={{ backgroundColor: '#84CC16', color: '#152007' }}
              >
                เข้าสู่ระบบ
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
                  หรือเข้าสู่ระบบด้วย
                </span>
              </div>
            </div>

            <div className="mt-6">
              <GoogleLoginButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
