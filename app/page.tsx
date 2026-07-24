'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import type { FormEvent, ChangeEvent, ReactNode } from 'react';
import {
  Wallet, ArrowDownToLine, Plus, Sun, Moon, X,
  Target, Tag, List, Trash2, BarChart3, StickyNote,
  Search, Edit2, ChevronLeft, ChevronRight, Menu, LayoutDashboard,
  Languages, Award, Skull, Hash, CalendarDays, ShieldAlert, Crosshair,
  Download, Upload,
} from 'lucide-react';
import moment from 'moment';
import 'moment/locale/th';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

// moment ships locale files without separate type declarations, which TS(2882)
// flags on this kind of side-effect import. The module exists and works fine at
// runtime — this just tells TypeScript not to worry about it.
declare module 'moment/locale/th';

const COLORS = {
  bgApp: '#09090D',
  sidebar: '#0D0D13',
  card: '#14141C',
  cardBorder: '#22222E',
  cardElevated: '#191922',
  accent: '#84CC16',
  accentHover: '#65A30D',
  accentSoft: 'rgba(132,204,22,0.16)',
  accentText: '#152007',
  gain: '#22C55E',
  gainSoft: 'rgba(34,197,94,',
  gainDeep: '#123524',
  loss: '#F43F5E',
  lossSoft: 'rgba(244,63,94,',
  lossDeep: '#3F1420',
  neutral: '#F59E0B',
  withdrawalDeep: '#3B2D12',
};

const WEEKDAYS: Record<'th' | 'en', string[]> = {
  th: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

const STR = {
  th: {
    appName: 'สมุดบันทึกการเทรด',
    nav_dashboard: 'แดชบอร์ด', nav_log: 'รายการเทรด',
    addTrade: 'บันทึกรายการ', editTrade: 'แก้ไขรายการ',
    logTradeMode: 'บันทึกการเทรด', logWithdrawalMode: 'บันทึกการถอนเงิน',
    capital: 'ทุนเริ่มต้น', balance: 'ยอดคงเหลือ', withdrawalStat: 'ถอน',
    periodAll: 'ทั้งหมด', periodMonth: 'เดือนนี้', periodWeek: 'สัปดาห์นี้', periodToday: 'วันนี้',
    netPL: 'กำไร/ขาดทุนสุทธิ', winRate: 'อัตราชนะ', avgWinLoss: 'กำไร/ขาดทุนเฉลี่ย',
    days: 'วัน', trades: 'เทรด',
    dailyChart: 'กราฟยอดสะสมรายวัน', summaryStats: 'สรุปเดือนนี้', today: 'วันนี้', week: 'สัปดาห์',
    tradeLogTitle: 'รายการเทรดทั้งหมด', searchPlaceholder: 'ค้นหาคู่เงิน, ประเภท, บันทึก...',
    emptyLog: 'ยังไม่มีรายการเทรด — กดปุ่ม "บันทึกรายการ" เพื่อเริ่มต้น',
    noSearchResult: 'ไม่พบรายการที่ค้นหา',
    colDate: 'วันที่', colPair: 'คู่เงิน', colType: 'ประเภท', colLotOrders: 'Lot / Orders', colTPSL: 'TP / SL', colNotes: 'บันทึก',
    colWithdrawal: 'ถอนเงิน', colPL: 'กำไร/ขาดทุน', colActions: 'จัดการ',
    bestTrade: 'เทรดที่ดีที่สุด', worstTrade: 'เทรดที่แย่ที่สุด',
    avgWin: 'กำไรเฉลี่ย', avgLoss: 'ขาดทุนเฉลี่ย', totalTrades: 'จำนวนเทรด',
    noData: 'ยังไม่มีข้อมูล',
    dateLabel: 'วันที่', pairLabel: 'คู่เงิน', typeLabel: 'ประเภท',
    lotLabel: 'Lot Size', ordersLabel: 'จำนวน Order',
    tpLabel: 'TP (Take Profit)', slLabel: 'SL (Stop Loss)',
    notesLabel: 'บันทึกเพิ่มเติม', notesPlaceholder: 'รายละเอียดการเทรด...',
    plLabel: 'กำไร/ขาดทุน ($)', withdrawalLabel: 'จำนวนเงินถอน ($)',
    save: 'บันทึกข้อมูล', saveEdit: 'บันทึกการแก้ไข',
    dayDetailsEmpty: 'ไม่มีรายการเทรดในวันนี้',
    confirmDelete: 'คุณต้องการลบรายการนี้ใช่หรือไม่?',
    loading: 'กำลังโหลด...', edit: 'แก้ไข', delete: 'ลบ', withdrawn: 'ถอนแล้ว',
    noEquityData: 'ยังไม่มีข้อมูลกราฟ — เริ่มบันทึกเทรดแรกของคุณ',
    win: 'ชนะ', loss: 'แพ้',
    targetProfitLabel: 'เป้าหมายกำไร ($):',
    filterAllPairs: 'คู่เงินทั้งหมด', filterAllTypes: 'ประเภททั้งหมด', clearFilters: 'ล้างตัวกรอง',
    showingLabel: 'แสดง', ofLabel: 'จาก', entries: 'รายการ', rowsPerPage: 'แถวต่อหน้า:',
    fieldRequired: 'กรุณากรอกข้อมูลในช่องนี้',
    exportData: 'ส่งออกข้อมูล', importData: 'นำเข้าข้อมูล',
    importInvalidFile: 'ไฟล์ไม่ถูกต้องหรือเสียหาย กรุณาเลือกไฟล์สำรองข้อมูลที่ถูกต้อง',
    importConfirmTitle: 'ยืนยันการนำเข้าข้อมูล',
    importAdded: 'รายการใหม่ที่จะเพิ่ม', importUpdated: 'รายการที่จะอัปเดต (มีการแก้ไขล่าสุดกว่า)', importUnchanged: 'รายการที่เหมือนเดิม (ข้าม)',
    importConfirmAsk: 'ต้องการนำเข้าและรวมกับข้อมูลปัจจุบันหรือไม่? (จะไม่เปลี่ยนทุนเริ่มต้น/เป้าหมายกำไร)',
    importSuccess: 'นำเข้าข้อมูลสำเร็จ', importCancelled: 'ยกเลิกการนำเข้าข้อมูล',
    importNoChanges: 'ไม่มีรายการใหม่หรือรายการที่ต้องอัปเดตจากไฟล์นี้',
    storageUsageLabel: 'พื้นที่ใช้ไป', storageUsageApprox: 'ค่าประมาณ (แต่ละเบราว์เซอร์จำกัดไม่เท่ากัน)',
    storageWarningTitle: 'พื้นที่จัดเก็บใกล้เต็มแล้ว',
    storageWarningBody: 'ข้อมูลของคุณใช้พื้นที่ไปเกือบเต็มขีดจำกัดของเบราว์เซอร์แล้ว แนะนำให้กด Export สำรองข้อมูลไว้ทันที และพิจารณาลบรายการเก่าที่ไม่จำเป็นออก เพื่อป้องกันข้อมูลใหม่บันทึกไม่สำเร็จ',
    storageSaveFailed: 'บันทึกข้อมูลไม่สำเร็จ พื้นที่จัดเก็บอาจเต็ม กรุณา Export สำรองข้อมูล แล้วลบรายการเก่าบางส่วนออก',
    exportConfirm: 'ต้องการดาวน์โหลดไฟล์สำรองข้อมูลตอนนี้หรือไม่?',
    importConfirmStart: 'ต้องการเลือกไฟล์สำรองข้อมูล (.json) เพื่อนำเข้าหรือไม่?',
  },
  en: {
    appName: 'Trading Journal',
    nav_dashboard: 'Dashboard', nav_log: 'Trade Log',
    addTrade: 'Add Entry', editTrade: 'Edit Entry',
    logTradeMode: 'Log Trade', logWithdrawalMode: 'Log Withdrawal',
    capital: 'Starting Capital', balance: 'Balance', withdrawalStat: 'Withdrawn',
    periodAll: 'All time', periodMonth: 'This month', periodWeek: 'This week', periodToday: 'Today',
    netPL: 'Net P&L', winRate: 'Trade Win %', avgWinLoss: 'Avg win/loss trade',
    days: 'days', trades: 'trades',
    dailyChart: 'Daily net cumulative P&L', summaryStats: 'Monthly stats', today: 'Today', week: 'Week',
    tradeLogTitle: 'All Trades', searchPlaceholder: 'Search pair, type, notes...',
    emptyLog: 'No trades yet — click "Add Entry" to get started',
    noSearchResult: 'No matching trades found',
    colDate: 'Date', colPair: 'Pair', colType: 'Type', colLotOrders: 'Lot / Orders', colTPSL: 'TP / SL', colNotes: 'Notes',
    colWithdrawal: 'Withdrawal', colPL: 'P&L', colActions: 'Actions',
    bestTrade: 'Best Trade', worstTrade: 'Worst Trade',
    avgWin: 'Avg Win', avgLoss: 'Avg Loss', totalTrades: 'Total Trades',
    noData: 'No data yet',
    dateLabel: 'Date', pairLabel: 'Pair', typeLabel: 'Type',
    lotLabel: 'Lot Size', ordersLabel: 'Orders Count',
    tpLabel: 'TP (Take Profit)', slLabel: 'SL (Stop Loss)',
    notesLabel: 'Notes', notesPlaceholder: 'Trade details...',
    plLabel: 'P&L ($)', withdrawalLabel: 'Withdrawal Amount ($)',
    save: 'Save Entry', saveEdit: 'Save Changes',
    dayDetailsEmpty: 'No entries on this day',
    confirmDelete: 'Delete this entry?',
    loading: 'Loading...', edit: 'Edit', delete: 'Delete', withdrawn: 'Withdrawn',
    noEquityData: 'No data yet — log your first trade to see the chart',
    win: 'Win', loss: 'Loss',
    targetProfitLabel: 'Target Profit ($):',
    filterAllPairs: 'All pairs', filterAllTypes: 'All types', clearFilters: 'Clear filters',
    showingLabel: 'Showing', ofLabel: 'of', entries: 'entries', rowsPerPage: 'Rows per page:',
    fieldRequired: 'Please fill out this field',
    exportData: 'Export Data', importData: 'Import Data',
    importInvalidFile: 'Invalid or corrupted file. Please select a valid backup file.',
    importConfirmTitle: 'Confirm Data Import',
    importAdded: 'New records to add', importUpdated: 'Records to update (newer edits found)', importUnchanged: 'Unchanged records (skipped)',
    importConfirmAsk: 'Import and merge with your current data? (Starting capital / target profit will not change)',
    importSuccess: 'Data imported successfully', importCancelled: 'Import cancelled',
    importNoChanges: 'No new or updated records found in this file.',
    storageUsageLabel: 'Storage used', storageUsageApprox: 'Approximate (limits vary by browser)',
    storageWarningTitle: 'Storage almost full',
    storageWarningBody: "Your data is close to your browser's storage limit. Please export a backup now and consider deleting old records to prevent new entries from failing to save.",
    storageSaveFailed: 'Failed to save data. Storage may be full. Please export a backup and delete some old records.',
    exportConfirm: 'Download a backup file now?',
    importConfirmStart: 'Select a backup (.json) file to import?',
  },
} as const;

type Lang = 'th' | 'en';
type Page = 'dashboard' | 'log';
type Period = 'all' | 'month' | 'week' | 'today';

type Trade = {
  id: number;
  amount: number;
  withdrawal: number;
  pair: string;
  tradeType: 'BUY' | 'SELL' | ''; 
  lot: string;
  orders: string;
  tpStatus: 'HIT' | 'NONE' | '';
  slStatus: 'HIT' | 'NONE' | '';
  notes: string;
  start: Date;
  updatedAt: number;
};

const NAV_ITEMS: { id: Page; icon: any; labelKey: 'nav_dashboard' | 'nav_log' }[] = [
  { id: 'dashboard', icon: LayoutDashboard, labelKey: 'nav_dashboard' },
  { id: 'log', icon: List, labelKey: 'nav_log' },
];

function fmt(n: number) {
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtCalendarPL(n: number) {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  return `${sign}$${abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtWithdrawalCalendar(n: number) {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  return `${sign}$${abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function tooltipStyle(isDark: boolean) {
  return {
    background: isDark ? '#171720' : '#fff',
    border: `1px solid ${isDark ? '#22222E' : '#E2E8F0'}`,
    borderRadius: 10, fontSize: 12, color: isDark ? '#E5E7EB' : '#1E293B',
  };
}

function computeStats(list: Trade[]) {
  let totalPL = 0, totalWithdrawal = 0, grossProfit = 0, grossLoss = 0;
  let wins = 0, losses = 0, bestTrade = 0, worstTrade = 0;
  const sorted = [...list].sort((a, b) => a.start.getTime() - b.start.getTime());

  sorted.forEach((t) => {
    totalPL += t.amount;
    totalWithdrawal += t.withdrawal;
    if (t.amount > 0) {
      wins++; grossProfit += t.amount;
      if (t.amount > bestTrade) bestTrade = t.amount;
    } else if (t.amount < 0) {
      losses++; grossLoss += Math.abs(t.amount);
      if (t.amount < worstTrade) worstTrade = t.amount;
    }
  });

  const totalTrades = wins + losses;
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  const avgWin = wins > 0 ? grossProfit / wins : 0;
  const avgLoss = losses > 0 ? grossLoss / losses : 0;

  return {
    totalPL, totalWithdrawal, grossProfit, grossLoss, wins, losses, bestTrade, worstTrade,
    totalTrades, winRate, avgWin, avgLoss,
  };
}

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }; 
}

function WinRateGauge({ value, wins, losses, isDark, t }: { value: number; wins: number; losses: number; isDark: boolean; t: any }) {
  const cx = 100, cy = 90, r = 80;
  const strokeW = 14;
  const start = polarToXY(cx, cy, r, 180);
  const end = polarToXY(cx, cy, r, 0);
  const clamped = Math.min(Math.max(value, 0), 100);
  const angle = 180 - (clamped / 100) * 180;
  // tip sits just inside the arc so the needle clearly points at the value
  const tip = polarToXY(cx, cy, r - strokeW / 2 - 4, angle);
  return (
    <div className="flex flex-col items-center justify-center gap-2 w-full">
      <svg viewBox="0 0 200 100" className="w-full max-w-[240px]">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={COLORS.loss} />
            <stop offset="50%" stopColor={COLORS.neutral} />
            <stop offset="100%" stopColor={COLORS.gain} />
          </linearGradient>
        </defs>
        <path d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`} stroke="url(#gaugeGrad)" strokeWidth={strokeW} fill="none" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke={isDark ? '#E5E7EB' : '#1E293B'} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="6" fill={isDark ? '#E5E7EB' : '#1E293B'} />
      </svg>
      <p className="text-3xl font-extrabold font-mono tabular-nums leading-none">{value.toFixed(1)}%</p>
      <div className="flex items-center gap-4 text-[11px] font-mono">
        <span className="flex items-center gap-1.5" style={{ color: COLORS.gain }}>
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS.gain }} />{wins} {t.win}
        </span>
        <span className="flex items-center gap-1.5" style={{ color: COLORS.loss }}>
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS.loss }} />{losses} {t.loss}
        </span>
      </div>
    </div>
  );
}

function AvgWinLossCombinedBar({ avgWin, avgLoss, capital, isDark }: { avgWin: number; avgLoss: number; capital: number; isDark: boolean }) {
  const total = avgWin + avgLoss || 1;
  const winPct = (avgWin / total) * 100;
  
  const safeCap = capital || 1;
  const avgWinPct = (avgWin / safeCap) * 100;
  const avgLossPct = (avgLoss / safeCap) * 100;

  return (
    <div className="flex flex-col justify-between items-center w-full h-full min-h-[125px] py-1">
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-1 text-xl md:text-2xl font-extrabold font-mono tabular-nums tracking-tight">
          <span style={{ color: COLORS.gain }}>+{avgWinPct.toFixed(2)}%</span>
          <span className="text-slate-500 font-light px-1">/</span>
          <span style={{ color: COLORS.loss }}>-{avgLossPct.toFixed(2)}%</span>
        </div>
      </div>
      <div className="w-full space-y-1.5 mb-1 mt-auto">
        <div className="h-2 rounded-full overflow-hidden flex w-full" style={{ background: isDark ? '#22222E' : '#E2E8F0' }}>
          <div style={{ width: `${winPct}%`, background: COLORS.gain }} />
          <div style={{ width: `${100 - winPct}%`, background: COLORS.loss }} />
        </div>
        <div className="flex justify-between items-center text-xs font-mono w-full px-0.5">
          <span className="font-bold" style={{ color: COLORS.gain }}>{fmt(avgWin)}</span>
          <span className="font-bold" style={{ color: COLORS.loss }}>-{fmt(avgLoss)}</span>
        </div>
      </div>
    </div>
  );
}

function StatTile({ icon, label, value, sub, color = 'default', isDarkMode }: any) {
  const colorMap: Record<string, string> = {
    gain: COLORS.gain, loss: COLORS.loss, neutral: COLORS.neutral, accent: COLORS.accent,
    default: isDarkMode ? '#E5E7EB' : '#1E293B',
  };
  return (
    <div className="p-4 rounded-2xl border flex flex-col items-center text-center justify-center" style={{ background: isDarkMode ? COLORS.card : '#fff', borderColor: isDarkMode ? COLORS.cardBorder : '#E2E8F0' }}>
      <div className="flex items-center justify-center gap-1.5 mb-2">
        <span className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}>{icon}</span>
        <p className={`text-[11px] font-medium uppercase tracking-wide ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
      </div>
      <p className="text-xl font-bold font-mono tabular-nums leading-tight" style={{ color: colorMap[color] }}>{value}</p>
      {sub && <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [capital, setCapital] = useState<number | ''>(1000);
  const [isEditingCapital, setIsEditingCapital] = useState(false);
  const [capitalInputVal, setCapitalInputVal] = useState('1000');

  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [lang, setLang] = useState<Lang>('th');
  const t = STR[lang];

  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [period, setPeriod] = useState<Period>('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [targetProfit, setTargetProfit] = useState<number | ''>(1000);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInputVal, setTargetInputVal] = useState('1000');

  const [showModal, setShowModal] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  const [entryMode, setEntryMode] = useState<'TRADE' | 'WITHDRAWAL'>('TRADE');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [withdrawal, setWithdrawal] = useState('');
  const [pair, setPair] = useState('XAUUSD');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [lot, setLot] = useState('0.01');
  const [orders, setOrders] = useState('1');
  const [tpStatus, setTpStatus] = useState<'HIT' | 'NONE'>('NONE');
  const [slStatus, setSlStatus] = useState<'HIT' | 'NONE'>('NONE');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState<{ date?: boolean; amount?: boolean; withdrawal?: boolean }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterPair, setFilterPair] = useState('');
  const [filterType, setFilterType] = useState<'' | 'BUY' | 'SELL' | 'WITHDRAWAL'>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [logPageSize, setLogPageSize] = useState(15);
  const LOG_PAGE_SIZE_OPTIONS = [10, 15, 25, 50, 100];

  const [dayDetailsDate, setDayDetailsDate] = useState<Date | null>(null);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('trading_data_v1');
      const savedCapital = localStorage.getItem('trading_capital_v1');
      const savedLang = localStorage.getItem('trading_lang_v1');
      const savedTheme = localStorage.getItem('trading_theme_v1');
      const savedTP = localStorage.getItem('trading_target_profit');

      if (savedData) {
        setTrades(JSON.parse(savedData).map((tr: any) => ({ ...tr, start: new Date(tr.start), updatedAt: tr.updatedAt || tr.id })));
      }
      if (savedCapital !== null) {
        const num = Number(savedCapital);
        setCapital(num);
        setCapitalInputVal(num.toString());
      }
      if (savedLang === 'th' || savedLang === 'en') setLang(savedLang);
      if (savedTheme === 'dark' || savedTheme === 'light') setIsDarkMode(savedTheme === 'dark');
      if (savedTP !== null) {
        const num = Number(savedTP);
        setTargetProfit(num);
        setTargetInputVal(num.toString());
      }
    } catch (e) {
      console.error('Failed to load saved data', e);
    }
    setDate(moment().format('YYYY-MM-DD'));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('trading_data_v1', JSON.stringify(trades));
      localStorage.setItem('trading_capital_v1', capital.toString());
      localStorage.setItem('trading_lang_v1', lang);
      localStorage.setItem('trading_theme_v1', isDarkMode ? 'dark' : 'light');
      localStorage.setItem('trading_target_profit', targetProfit.toString());
    } catch (e) {
      console.error('Failed to save data', e);
      alert(t.storageSaveFailed);
    }
  }, [trades, capital, lang, isDarkMode, targetProfit, isLoaded]);

  useEffect(() => {
    moment.locale(lang === 'th' ? 'th' : 'en');
  }, [lang]);

  const dayDetailsEvents = useMemo(() => {
    if (!dayDetailsDate) return [];
    return trades.filter((tr) => moment(tr.start).isSame(dayDetailsDate, 'day')).sort((a, b) => a.id - b.id);
  }, [trades, dayDetailsDate]);

  const periodTrades = useMemo(() => {
    if (period === 'all') return trades;
    const now = moment();
    if (period === 'month') return trades.filter((tr) => moment(tr.start).isSame(now, 'month'));
    if (period === 'week') return trades.filter((tr) => moment(tr.start).isSame(now, 'week'));
    return trades.filter((tr) => moment(tr.start).isSame(now, 'day'));
  }, [trades, period]);

  const periodStats = useMemo(() => computeStats(periodTrades), [periodTrades]);
  const allStats = useMemo(() => computeStats(trades), [trades]);
  const currentBalance = Number(capital || 0) + allStats.totalPL - allStats.totalWithdrawal;

  const equityCurve = useMemo(() => {
    const sorted = [...trades].sort((a, b) => a.start.getTime() - b.start.getTime());
    let running = Number(capital || 0);
    const points = [{ label: lang === 'th' ? 'เริ่มต้น' : 'Start', balance: running }];
    sorted.forEach((tr) => {
      running += tr.amount - tr.withdrawal;
      points.push({ label: moment(tr.start).locale(lang === 'th' ? 'th' : 'en').format('DD/MM'), balance: running });
    });
    return points;
  }, [trades, capital, lang]);

  const dailyStats = useMemo(() => {
    const map: Record<string, { pl: number; withdrawal: number; tradeCount: number; wins: number; hasNotes: boolean }> = {};
    trades.forEach((tr) => {
      const key = moment(tr.start).format('YYYY-MM-DD');
      if (!map[key]) map[key] = { pl: 0, withdrawal: 0, tradeCount: 0, wins: 0, hasNotes: false };
      map[key].pl += tr.amount;
      map[key].withdrawal += tr.withdrawal;
      if (tr.amount !== 0) {
        map[key].tradeCount += 1;
        if (tr.amount > 0) map[key].wins += 1;
      }
      if (tr.notes) map[key].hasNotes = true;
    });
    return map;
  }, [trades]);

  const calendarWeeks = useMemo(() => {
    const monthStart = moment(calendarDate).startOf('month');
    const monthEndM = moment(calendarDate).endOf('month');
    const gridStart = monthStart.clone().day(0);
    const gridEnd = monthEndM.clone().day(6);
    const weeks: moment.Moment[][] = [];
    let cursor = gridStart.clone();
    while (cursor.isSameOrBefore(gridEnd, 'day')) {
      const week: moment.Moment[] = [];
      for (let i = 0; i < 7; i++) { week.push(cursor.clone()); cursor.add(1, 'day'); }
      weeks.push(week);
    }
    return weeks;
  }, [calendarDate]);

  const monthTotal = useMemo(() => {
    let pl = 0, withdrawal = 0, days = 0;
    Object.entries(dailyStats).forEach(([key, v]) => {
      if (moment(key).isSame(calendarDate, 'month')) {
        pl += v.pl;
        withdrawal += v.withdrawal;
        days += 1;
      }
    });
    return { pl, withdrawal, days };
  }, [dailyStats, calendarDate]);

  function weekTotal(week: moment.Moment[]) {
    let pl = 0, days = 0;
    week.forEach((d) => {
      const v = dailyStats[d.format('YYYY-MM-DD')];
      if (v) { pl += v.pl; days += 1; }
    });
    return { pl, days };
  }

  const resetForm = () => {
    setEditingId(null);
    setDate(moment().format('YYYY-MM-DD'));
    setAmount(''); setWithdrawal(''); setPair('XAUUSD'); setTradeType('BUY'); setLot('0.01'); setOrders('1'); setTpStatus('NONE'); setSlStatus('NONE'); setNotes('');
    setEntryMode('TRADE');
    setFormErrors({});
  };

  const handleSaveTrade = (e: FormEvent) => {
    e.preventDefault();

    const errors: { date?: boolean; amount?: boolean; withdrawal?: boolean } = {};
    if (!date) errors.date = true;
    if (entryMode === 'TRADE' && amount.trim() === '') errors.amount = true;
    if (entryMode === 'WITHDRAWAL' && withdrawal.trim() === '') errors.withdrawal = true;
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    const tradeDate = new Date(date);

    let finalAmount = 0;
    let finalWithdrawal = 0;
    let finalPair = pair;
    let finalTradeType: 'BUY' | 'SELL' | '' = tradeType;
    let finalLot = lot;
    let finalOrders = orders;
    let finalTpStatus: 'HIT' | 'NONE' | '' = tpStatus;
    let finalSlStatus: 'HIT' | 'NONE' | '' = slStatus;

    if (entryMode === 'WITHDRAWAL') {
      finalWithdrawal = parseFloat(withdrawal) || 0;
      finalAmount = 0; // ในโหมดถอนเงิน บังคับ P&L เป็น 0
      finalPair = '';
      finalTradeType = '';
      finalLot = '';
      finalOrders = '';
      finalTpStatus = '';
      finalSlStatus = '';
    } else {
      finalAmount = parseFloat(amount) || 0;
      finalWithdrawal = 0; // ในโหมดเทรด บังคับยอดถอนเป็น 0
    }

    const newTrade: Trade = {
      id: editingId || Date.now(),
      amount: finalAmount, 
      withdrawal: finalWithdrawal,
      pair: finalPair, 
      tradeType: finalTradeType, 
      lot: finalLot,  
      orders: finalOrders, 
      tpStatus: finalTpStatus, 
      slStatus: finalSlStatus, 
      notes, 
      start: tradeDate,
      updatedAt: Date.now(),
    };

    if (editingId) {
      setTrades((prev) => prev.map((tr) => (tr.id === editingId ? newTrade : tr)));
    } else {
      setTrades((prev) => [...prev, newTrade]);
    }

    setShowModal(false);
    resetForm();
    setCalendarDate(tradeDate);
  };

  const handleEditTrade = (tr: Trade) => {
    setEditingId(tr.id);
    setFormErrors({});
    setDate(moment(tr.start).format('YYYY-MM-DD'));
    setAmount(tr.amount.toString());
    setWithdrawal(tr.withdrawal ? tr.withdrawal.toString() : '');
    setPair(tr.pair);
    setTradeType(tr.tradeType === '' ? 'BUY' : tr.tradeType);
    setLot(tr.lot || '0.01');
    setOrders(tr.orders || '1');
    setTpStatus(tr.tpStatus === '' ? 'NONE' : tr.tpStatus);
    setSlStatus(tr.slStatus === '' ? 'NONE' : tr.slStatus);
    setNotes(tr.notes);
    
    if (tr.tradeType === '') {
      setEntryMode('WITHDRAWAL');
    } else {
      setEntryMode('TRADE');
    }

    setShowModal(true);
    setDayDetailsDate(null);
  };

  const handleDeleteTrade = (id: number) => {
    if (confirm(t.confirmDelete)) {
      setTrades((prev) => prev.filter((tr) => tr.id !== id));
    }
  };

  const importFileInputRef = useRef<HTMLInputElement>(null);
  const hasWarnedStorageRef = useRef(false);

  const STORAGE_REFERENCE_BYTES = 5 * 1024 * 1024; // conservative estimate (Safari's ~5MB is the tightest common limit)

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const storageUsage = useMemo(() => {
    try {
      const totalBytes = new Blob([
        JSON.stringify(trades),
        capital.toString(),
        lang,
        isDarkMode ? 'dark' : 'light',
        targetProfit.toString(),
      ]).size;
      const percent = Math.min(100, (totalBytes / STORAGE_REFERENCE_BYTES) * 100);
      return { bytes: totalBytes, percent };
    } catch {
      return { bytes: 0, percent: 0 };
    }
  }, [trades, capital, lang, isDarkMode, targetProfit]);

  useEffect(() => {
    if (!isLoaded) return;
    if (storageUsage.percent >= 90 && !hasWarnedStorageRef.current) {
      hasWarnedStorageRef.current = true;
      alert(`${t.storageWarningTitle}\n\n${t.storageWarningBody}`);
    }
  }, [storageUsage.percent, isLoaded, t]);

  const handleExportData = () => {
    if (!confirm(t.exportConfirm)) return;
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      capital,
      targetProfit,
      trades,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-journal-backup-${moment().format('YYYYMMDD-HHmmss')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const mergeTrades = (current: Trade[], incoming: Trade[]) => {
    const map = new Map<number, Trade>();
    current.forEach((tr) => map.set(tr.id, tr));
    let added = 0;
    let updated = 0;
    incoming.forEach((tr) => {
      const existing = map.get(tr.id);
      if (!existing) {
        map.set(tr.id, tr);
        added++;
      } else {
        const existingTime = existing.updatedAt || existing.id;
        const incomingTime = tr.updatedAt || tr.id;
        if (incomingTime > existingTime) {
          map.set(tr.id, tr);
          updated++;
        }
      }
    });
    return { merged: Array.from(map.values()), added, updated };
  };

  const handleImportFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const data = JSON.parse(text);
        if (!data || !Array.isArray(data.trades)) {
          alert(t.importInvalidFile);
          return;
        }
        const incoming: Trade[] = data.trades.map((tr: any) => ({
          ...tr,
          start: new Date(tr.start),
          updatedAt: tr.updatedAt || tr.id,
        }));
        const { merged, added, updated } = mergeTrades(trades, incoming);
        if (added === 0 && updated === 0) {
          alert(t.importNoChanges);
          return;
        }
        const summary = `${t.importConfirmTitle}\n\n${t.importAdded}: ${added}\n${t.importUpdated}: ${updated}\n${t.importUnchanged}: ${incoming.length - added - updated}\n\n${t.importConfirmAsk}`;
        if (confirm(summary)) {
          setTrades(merged);
          alert(t.importSuccess);
        }
      } catch (err) {
        alert(t.importInvalidFile);
      } finally {
        if (importFileInputRef.current) importFileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleImportClick = () => {
    if (confirm(t.importConfirmStart)) {
      importFileInputRef.current?.click();
    }
  };

  const uniquePairs = useMemo(() => {
    const set = new Set<string>();
    trades.forEach((tr) => { if (tr.pair) set.add(tr.pair); });
    return Array.from(set).sort();
  }, [trades]);

  const filteredTrades = useMemo(() => trades.filter((tr) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || (
      (tr.pair || '').toLowerCase().includes(q) ||
      (tr.tradeType || '').toLowerCase().includes(q) ||
      (tr.lot || '').toLowerCase().includes(q) ||
      (tr.notes || '').toLowerCase().includes(q)
    );
    const matchesDate = !filterDate || moment(tr.start).format('YYYY-MM-DD') === filterDate;
    const matchesPair = !filterPair || tr.pair === filterPair;
    const matchesType = !filterType || (filterType === 'WITHDRAWAL' ? tr.tradeType === '' : tr.tradeType === filterType);
    return matchesSearch && matchesDate && matchesPair && matchesType;
  }), [trades, searchQuery, filterDate, filterPair, filterType]);

  const sortedTrades = useMemo(
    () => [...filteredTrades].sort((a, b) => b.start.getTime() - a.start.getTime() || b.id - a.id),
    [filteredTrades]
  );

  const totalLogPages = Math.max(1, Math.ceil(sortedTrades.length / logPageSize));
  const safeCurrentPage = Math.min(currentPage, totalLogPages);
  const paginatedTrades = sortedTrades.slice((safeCurrentPage - 1) * logPageSize, safeCurrentPage * logPageSize);

  const hasActiveLogFilters = !!(searchQuery || filterDate || filterPair || filterType);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDate, filterPair, filterType, logPageSize]);

  const logPageNumbers = useMemo(() => {
    const pages: (number | '...')[] = [];
    const total = totalLogPages;
    const cur = safeCurrentPage;
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || Math.abs(i - cur) <= 1) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  }, [totalLogPages, safeCurrentPage]);

  const themeBg = isDarkMode ? COLORS.bgApp : '#F8FAFC';
  const themeSidebar = isDarkMode ? COLORS.sidebar : '#FFFFFF';
  const themeCard = isDarkMode ? COLORS.card : '#FFFFFF';
  const themeCardBorder = isDarkMode ? COLORS.cardBorder : '#E2E8F0';
  const themeCardElevated = isDarkMode ? COLORS.cardElevated : '#F1F5F9';
  const themeText = isDarkMode ? '#E5E7EB' : '#1E293B';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const cardStyle = { background: themeCard, borderColor: themeCardBorder };
  const cardClassName = 'rounded-2xl border p-5';
  const inputStyle: React.CSSProperties = { 
  background: isDarkMode ? '#1A1A24' : '#fff', 
  borderColor: isDarkMode ? '#2A2A38' : '#CBD5E1', 
  color: themeText,
  colorScheme: isDarkMode ? 'dark' : 'light' 
};
  const inputClassName = 'w-full p-3 rounded-xl border focus:ring-2 focus:outline-none text-sm';
  const filterInputClassName = 'p-2.5 rounded-xl border focus:ring-2 focus:outline-none text-xs';
  const getFieldStyle = (hasError?: boolean): React.CSSProperties =>
    hasError ? { ...inputStyle, borderColor: COLORS.loss, boxShadow: `0 0 0 1px ${COLORS.loss}` } : inputStyle;
  const FieldError = ({ show }: { show?: boolean }) =>
    show ? <p className="text-xs mt-1" style={{ color: COLORS.loss }}>{t.fieldRequired}</p> : null;

  const renderNavItems = (collapsed: boolean) =>
    NAV_ITEMS.map((item) => {
      const Icon = item.icon;
      const active = activePage === item.id;
      return (
        <button
          key={item.id}
          onClick={() => { setActivePage(item.id); setMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${active ? '' : `${textMuted} hover:text-slate-200`}`}
          style={active ? { background: COLORS.accentSoft, color: COLORS.accent } : {}}
        >
          <Icon size={18} className="shrink-0" />
          {!collapsed && <span>{t[item.labelKey]}</span>}
        </button>
      );
    });

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen flex font-sans" style={{ background: themeBg, color: themeText }}>
      <style>{`
        html {
          scroll-behavior: smooth;
        }
        .font-sans, h1, h2, h3, p, span, button, input {
          font-family: var(--font-inter), var(--font-noto-thai), ui-sans-serif, system-ui, sans-serif !important;
        }
        .font-mono {
          font-family: var(--font-jetbrains), ui-monospace, SFMono-Regular, monospace !important;
        }
        input[type="month"]::-webkit-calendar-picker-indicator {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
          opacity: 0;
        }
        html, body {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <aside
        className={`hidden md:flex flex-col shrink-0 border-r transition-all duration-200 ${sidebarCollapsed ? 'w-[76px]' : 'w-[230px]'}`}
        style={{ background: themeSidebar, borderColor: themeCardBorder }}
      >
        <div
          className="p-4 flex items-center gap-2.5 cursor-pointer transition hover:opacity-80"
          onClick={() => setActivePage('dashboard')}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${COLORS.accent}, #1A2E05)` }}>
            <BarChart3 className="text-white" size={18} />
          </div>
          {!sidebarCollapsed && <span className="font-bold text-sm tracking-tight truncate">{t.appName}</span>}
        </div>

        <div className="px-3 mb-4">
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 font-medium text-sm transition hover:brightness-110"
            style={{ background: COLORS.accent, color: COLORS.accentText }}
          >
            <Plus size={16} /> {!sidebarCollapsed && t.addTrade}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1">{renderNavItems(sidebarCollapsed)}</nav>

        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`m-3 p-2 rounded-xl border self-center flex items-center justify-center ${textMuted}`}
          style={{ borderColor: themeCardBorder }}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col" style={{ background: themeSidebar }}>
            <div className="p-4 flex items-center justify-between">
              <div
                className="flex items-center gap-2.5 cursor-pointer transition hover:opacity-80"
                onClick={() => { setActivePage('dashboard'); setMobileMenuOpen(false); }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${COLORS.accent}, #1A2E05)` }}>
                  <BarChart3 className="text-white" size={18} />
                </div>
                <span className="font-bold text-sm">{t.appName}</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className={textMuted}><X size={20} /></button>
            </div>
            <div className="px-3 mb-4">
              <button
                onClick={() => { resetForm(); setShowModal(true); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 font-medium text-sm"
                style={{ background: COLORS.accent, color: COLORS.accentText }}
              >
                <Plus size={16} /> {t.addTrade}
              </button>
            </div>
            <nav className="flex-1 px-3 space-y-1">{renderNavItems(false)}</nav>
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex items-center justify-between gap-3 px-4 md:px-6 py-4 border-b flex-wrap" style={{ borderColor: themeCardBorder }}>
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-lg border" style={{ borderColor: themeCardBorder }} onClick={() => setMobileMenuOpen(true)}>
              <Menu size={18} />
            </button>
            <h1 className="text-lg md:text-xl font-bold">{t[(`nav_${activePage}`) as keyof typeof t]}</h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activePage === 'dashboard' && (
              <div className="flex p-1 rounded-xl border" style={{ borderColor: themeCardBorder, background: themeCard }}>
                {(['all', 'month', 'week', 'today'] as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition"
                    style={period === p ? { background: COLORS.accent, color: COLORS.accentText } : { color: isDarkMode ? '#94A3B8' : '#64748B' }}
                  >
                    {p === 'all' ? t.periodAll : p === 'month' ? t.periodMonth : p === 'week' ? t.periodWeek : t.periodToday}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs" style={{ borderColor: themeCardBorder, background: themeCard }} title={`${t.balance}: ${fmt(currentBalance)}`}>
              <Wallet size={14} style={{ color: COLORS.accent }} />
              <span className={`hidden sm:inline ${textMuted}`}>{t.capital}</span>
              <input
                type="text"
                value={isEditingCapital ? capitalInputVal : Number(capital || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                onFocus={() => {
                  setIsEditingCapital(true);
                  setCapitalInputVal(capital === '' ? '' : capital.toString());
                }}
                onChange={(e) => {
                  setCapitalInputVal(e.target.value);
                  const raw = e.target.value.replace(/,/g, '');
                  if (raw === '' || !isNaN(Number(raw))) {
                    setCapital(raw === '' ? '' : Number(raw));
                  }
                }}
                onBlur={() => {
                  setIsEditingCapital(false);
                  if (capital === '') setCapital(0);
                }}
                className="w-24 bg-transparent font-mono font-bold text-right focus:outline-none rounded px-1"
                style={{ color: themeText }}
              />
            </div>

            <button
              onClick={handleExportData}
              title={`${t.exportData} — ${t.storageUsageLabel}: ${formatBytes(storageUsage.bytes)} / ~5MB (${storageUsage.percent.toFixed(0)}%, ${t.storageUsageApprox})`}
              className="relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition hover:brightness-110 active:scale-95"
              style={{ borderColor: 'rgba(34,197,94,0.35)', background: 'rgba(34,197,94,0.1)', color: COLORS.gain }}
            >
              <Download size={15} />
              <span className="hidden sm:inline">{t.exportData}</span>
              {storageUsage.percent >= 70 && (
                <span
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2"
                  style={{
                    background: storageUsage.percent >= 90 ? COLORS.loss : COLORS.neutral,
                    borderColor: themeCard,
                  }}
                />
              )}
            </button>

            <input
              type="file"
              accept="application/json"
              ref={importFileInputRef}
              onChange={handleImportFileSelected}
              className="hidden"
            />
            <button
              onClick={handleImportClick}
              title={t.importData}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition hover:brightness-110 active:scale-95"
              style={{ borderColor: 'rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.1)', color: COLORS.neutral }}
            >
              <Upload size={15} />
              <span className="hidden sm:inline">{t.importData}</span>
            </button>

            <button
              onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
              className="p-2.5 rounded-xl border flex items-center gap-1 text-xs font-bold"
              style={{ borderColor: themeCardBorder, background: themeCard }}
            >
              <Languages size={15} /> {lang.toUpperCase()}
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl border"
              style={{ borderColor: themeCardBorder, background: themeCard }}
            >
              {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-4 overflow-x-hidden">
          {activePage === 'dashboard' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                <div className={cardClassName} style={cardStyle}>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-medium ${textMuted}`}>{t.targetProfitLabel}</span>
                      <input
                        type="text"
                        value={isEditingTarget ? targetInputVal : Number(targetProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        onFocus={() => {
                          setIsEditingTarget(true);
                          setTargetInputVal(targetProfit === '' ? '' : targetProfit.toString());
                        }}
                        onChange={(e) => {
                          setTargetInputVal(e.target.value);
                          const raw = e.target.value.replace(/,/g, '');
                          if (raw === '' || !isNaN(Number(raw))) {
                            setTargetProfit(raw === '' ? '' : Number(raw));
                          }
                        }}
                        onBlur={() => {
                          setIsEditingTarget(false);
                          if (targetProfit === '') setTargetProfit(0);
                        }}
                        className="w-40 text-2xl font-extrabold font-mono bg-transparent text-right focus:outline-none rounded px-1"
                        style={{ color: COLORS.accent }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className={textMuted}>Progress</span>
                      <span className="font-bold text-sm">{Math.min(100, Math.max(0, (allStats.totalPL / (Number(targetProfit) || 1)) * 100)).toFixed(1)}%</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden bg-slate-700/30">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, (allStats.totalPL / (Number(targetProfit) || 1)) * 100))}%`, background: COLORS.gain }} />
                    </div>
                  </div>

                  <div className="pt-3 border-t" style={{ borderColor: themeCardBorder }}>
                    <p className={`text-xs font-medium ${textMuted}`}>{t.netPL}</p>
                    <p className="text-[26px] font-extrabold font-mono tabular-nums mt-1" style={{ color: periodStats.totalPL >= 0 ? COLORS.gain : COLORS.loss }}>
                      {fmt(periodStats.totalPL)}
                    </p>
                    <p className={`text-[11px] mt-1 ${textMuted}`}>
                      {allStats.totalTrades} {t.trades} · {t.balance}: <span className="font-mono font-semibold">{fmt(currentBalance)}</span> {allStats.totalWithdrawal > 0 && `· ${t.withdrawalStat}: `}
                      {allStats.totalWithdrawal > 0 && <span className="font-mono font-semibold text-amber-400">{fmt(allStats.totalWithdrawal)}</span>}
                    </p>
                  </div>
                </div>

                <div className={`${cardClassName} flex flex-col`} style={cardStyle}>
                  <p className={`text-xs font-medium ${textMuted} mb-1`}>{t.winRate}</p>
                  <div className="flex-1 flex items-center justify-center py-1">
                    <WinRateGauge value={periodStats.winRate} wins={periodStats.wins} losses={periodStats.losses} isDark={isDarkMode} t={t} />
                  </div>
                </div>

                <div className={cardClassName} style={cardStyle}>
                  <p className={`text-xs font-medium ${textMuted} mb-1`}>{t.avgWinLoss}</p>
                  <AvgWinLossCombinedBar avgWin={periodStats.avgWin} avgLoss={periodStats.avgLoss} capital={Number(capital || 1)} isDark={isDarkMode} />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatTile isDarkMode={isDarkMode} icon={<Hash size={14} />} label={t.totalTrades} value={`${periodStats.totalTrades}`} color="default" />
                <StatTile isDarkMode={isDarkMode} icon={<Award size={14} />} label={t.bestTrade} value={fmt(periodStats.bestTrade)} color="gain" />
                <StatTile isDarkMode={isDarkMode} icon={<Skull size={14} />} label={t.worstTrade} value={fmt(periodStats.worstTrade)} color="loss" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5 rounded-2xl border overflow-hidden" style={cardStyle}>
                  <div className="p-5 pb-0"><h2 className="font-bold">{t.dailyChart}</h2></div>
                  <div className="p-4">
                    {equityCurve.length > 1 ? (
                      <ResponsiveContainer width="100%" height={290}>
                        <AreaChart data={equityCurve} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="dashGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={COLORS.gain} stopOpacity={0.4} />
                              <stop offset="100%" stopColor={COLORS.gain} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={themeCardBorder} vertical={false} />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} width={55} tickFormatter={(v) => `$${v}`} />
                          <Tooltip contentStyle={tooltipStyle(isDarkMode)} formatter={(v) => fmt(Number(v) || 0)} />
                          <Area type="monotone" dataKey="balance" stroke={COLORS.gain} strokeWidth={2.5} fill="url(#dashGradient)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className={`text-center py-16 text-sm ${textMuted}`}>{t.noEquityData}</p>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-7 rounded-2xl border overflow-hidden flex flex-col" style={cardStyle}>
                  <div className="flex items-center justify-between p-5 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setCalendarDate(moment(calendarDate).subtract(1, 'month').toDate())} className="p-1.5 rounded-lg border" style={{ borderColor: themeCardBorder }}>
                        <ChevronLeft size={16} />
                      </button>
                      
                      <div 
                        className="relative flex items-center justify-center gap-2 px-3 py-1 rounded-lg border hover:bg-white/5 transition cursor-pointer" 
                        style={{ borderColor: themeCardBorder }}
                      >
                        <CalendarDays size={16} className={textMuted} />
                        <span className="font-bold text-sm md:text-base pointer-events-none text-center">
                          {moment(calendarDate).locale(lang === 'th' ? 'th' : 'en').format('MMMM')} {lang === 'th' ? calendarDate.getFullYear() + 543 : calendarDate.getFullYear()}
                        </span>
                        <input
                          type="month"
                          value={moment(calendarDate).format('YYYY-MM')}
                          onChange={(e) => {
                            if (e.target.value) {
                              setCalendarDate(moment(e.target.value, 'YYYY-MM').toDate());
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                      </div>

                      <button onClick={() => setCalendarDate(moment(calendarDate).add(1, 'month').toDate())} className="p-1.5 rounded-lg border" style={{ borderColor: themeCardBorder }}>
                        <ChevronRight size={16} />
                      </button>
                      
                      <button onClick={() => setCalendarDate(new Date())} className="text-xs font-medium px-2.5 py-1.5 rounded-lg border ml-1" style={{ borderColor: themeCardBorder }}>
                        {t.today}
                      </button>
                    </div>

                    <div className="text-xs font-mono">
                      <span className={textMuted}>{t.summaryStats}: </span>
                      <span className="font-bold" style={{ color: monthTotal.pl >= 0 ? COLORS.gain : COLORS.loss }}>{fmt(monthTotal.pl)}</span>
                      <span className={textMuted}> · {monthTotal.days} {t.days}</span>
                      {monthTotal.withdrawal > 0 && (
                        <>
                          <span className={textMuted}> · {t.withdrawalStat}: </span>
                          <span className="font-bold text-amber-400">{fmt(monthTotal.withdrawal)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="px-3 pb-4 flex-1 overflow-x-auto no-scrollbar">
                    <div className="min-w-[560px]">
                      <div className="grid grid-cols-7 lg:grid-cols-8 gap-1.5 mb-1.5">
                        {WEEKDAYS[lang].map((d) => (
                          <div key={d} className={`text-center text-[11px] font-semibold py-1 ${textMuted}`}>{d}</div>
                        ))}
                        <div className="hidden lg:block" />
                      </div>

                      {calendarWeeks.map((week, wi) => {
                        const wt = weekTotal(week);
                        const safeCap = Number(capital) || 1;
                        const wtPct = (wt.pl / safeCap) * 100;
                        const wtSign = wt.pl > 0 ? '+' : '';

                        return (
                          <div key={wi} className="grid grid-cols-7 lg:grid-cols-8 gap-1.5 mb-1.5">
                            {week.map((day) => {
                              const key = day.format('YYYY-MM-DD');
                              const dstat = dailyStats[key];
                              const inMonth = day.isSame(calendarDate, 'month');
                              const isToday = day.isSame(moment(), 'day');
                              if (!inMonth) {
                                return <div key={key} className="aspect-square rounded-lg" style={{ background: isDarkMode ? '#0D0D13' : '#F8FAFC' }} />;
                              }
                              
                              const hasRecords = !!dstat && (dstat.tradeCount > 0 || dstat.withdrawal > 0);
                              const isOnlyWithdrawal = hasRecords && dstat.pl === 0 && dstat.withdrawal > 0;
                              
                              const bg = isOnlyWithdrawal 
                                ? COLORS.withdrawalDeep 
                                : hasRecords && dstat.tradeCount > 0
                                ? (dstat!.pl >= 0 ? COLORS.gainDeep : COLORS.lossDeep) 
                                : themeCardElevated;
                              
                              const plPct = dstat ? (dstat.pl / safeCap) * 100 : 0;
                              const dSign = dstat && dstat.pl > 0 ? '+' : '';
                              
                              return (
                                <button
                                  key={key}
                                  onClick={() => {
                                    setDayDetailsDate(day.toDate());
                                  }}
                                  className="aspect-square rounded-lg p-1.5 flex flex-col justify-between text-left transition hover:brightness-110 relative group"
                                  style={{ background: bg, outline: isToday ? `1.5px solid ${COLORS.accent}` : 'none', outlineOffset: '-1.5px' }}
                                >
                                  <div className="flex justify-between items-start w-full">
                                    <span className={`text-[10px] font-semibold ${hasRecords ? 'text-white/70' : textMuted}`}>{day.date()}</span>
                                    <div className="flex items-center gap-1">
                                      {dstat?.withdrawal > 0 && dstat?.tradeCount > 0 && (
                                        <span className="text-[9px] font-bold px-1 rounded bg-amber-500/30 text-amber-300">W</span>
                                      )}
                                      {dstat?.hasNotes && <StickyNote size={9} className="text-white/50" />}
                                    </div>
                                  </div>

                                  {hasRecords ? (
                                    <div className="mt-auto flex flex-col w-full">
                                      <p className="text-[11px] font-bold font-mono text-white leading-tight truncate">
                                        {dstat.pl !== 0 ? fmtCalendarPL(dstat.pl) : <span className="text-amber-400">{fmtWithdrawalCalendar(dstat.withdrawal)}</span>}
                                      </p>
                                      <div className="flex justify-between items-end w-full mt-0.5">
                                        {dstat.pl !== 0 ? (
                                          <p className="text-[9px] font-mono font-bold leading-tight truncate" style={{ color: dstat!.pl > 0 ? '#86EFAC' : dstat!.pl < 0 ? '#FDA4AF' : '#E2E8F0' }}>
                                            {dSign}{plPct.toFixed(2)}%
                                          </p>
                                        ) : (
                                          <span className="text-[9px] font-mono font-bold text-amber-300">Withdraw</span>
                                        )}
                                        {dstat.tradeCount > 0 && (
                                          <span className="text-[8px] text-white/50 font-medium shrink-0">{dstat.tradeCount}T</span>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/20 rounded-lg">
                                      <Plus size={14} className="text-white" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                            <div className="hidden lg:flex flex-col justify-center rounded-lg px-2 py-1" style={{ background: themeCardElevated }}>
                              <p className={`text-[9px] font-semibold ${textMuted}`}>{t.week} {wi + 1}</p>
                              <p className="text-[11px] font-bold font-mono mt-0.5" style={{ color: wt.days === 0 ? (isDarkMode ? '#64748B' : '#94A3B8') : wt.pl >= 0 ? COLORS.gain : COLORS.loss }}>
                                {fmt(wt.pl)}
                              </p>
                              {wt.days > 0 && (
                                <p className="text-[9px] font-mono font-bold mt-0.5" style={{ color: wt.pl > 0 ? COLORS.gain : wt.pl < 0 ? COLORS.loss : textMuted }}>
                                  {wtSign}{wtPct.toFixed(2)}%
                                </p>
                              )}
                              <p className={`text-[9px] ${textMuted} mt-0.5`}>{wt.days} {t.days}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePage === 'log' && (
            <div className={cardClassName} style={cardStyle}>
              <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <h2 className="text-lg font-bold">{t.tradeLogTitle}</h2>
                <div className="relative w-full md:w-64">
                  <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`${inputClassName} pl-9`}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-6">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className={filterInputClassName}
                  style={inputStyle}
                />
                <select
                  value={filterPair}
                  onChange={(e) => setFilterPair(e.target.value)}
                  className={filterInputClassName}
                  style={inputStyle}
                >
                  <option value="">{t.filterAllPairs}</option>
                  {uniquePairs.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as '' | 'BUY' | 'SELL' | 'WITHDRAWAL')}
                  className={filterInputClassName}
                  style={inputStyle}
                >
                  <option value="">{t.filterAllTypes}</option>
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                  <option value="WITHDRAWAL">WITHDRAWAL</option>
                </select>
                {hasActiveLogFilters && (
                  <button
                    onClick={() => { setSearchQuery(''); setFilterDate(''); setFilterPair(''); setFilterType(''); }}
                    className={`flex items-center gap-1 text-xs font-medium px-3 py-2 rounded-xl transition ${textMuted} hover:text-rose-400`}
                  >
                    <X size={13} />{t.clearFilters}
                  </button>
                )}
              </div>

              {sortedTrades.length === 0 ? (
                <p className={`text-center py-12 ${textMuted}`}>{hasActiveLogFilters ? t.noSearchResult : t.emptyLog}</p>
              ) : (
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`text-left border-b ${textMuted}`} style={{ borderColor: themeCardBorder }}>
                        <th className="py-2.5 pr-3 font-medium">{t.colDate}</th>
                        <th className="py-2.5 pr-3 font-medium">{t.colPair}</th>
                        <th className="py-2.5 pr-3 font-medium">{t.colType}</th>
                        <th className="py-2.5 pr-3 font-medium">{t.colLotOrders}</th>
                        <th className="py-2.5 pr-3 font-medium">{t.colTPSL}</th>
                        <th className="py-2.5 pr-3 font-medium">{t.colNotes}</th>
                        <th className="py-2.5 pr-3 font-medium text-right">{t.colWithdrawal}</th>
                        <th className="py-2.5 pr-3 font-medium text-right">{t.colPL}</th>
                        <th className="py-2.5 pl-3 font-medium text-center">{t.colActions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTrades.map((tr) => {
                          const isWithdrawal = tr.tradeType === '';
                          return (
                          <tr key={tr.id} className="border-b last:border-0 transition" style={{ borderColor: isDarkMode ? '#1A1A24' : '#F1F5F9' }}>
                            <td className="py-3 pr-3 whitespace-nowrap font-mono text-xs">
                              {moment(tr.start).format('DD/MM/')}{lang === 'th' ? tr.start.getFullYear() + 543 : tr.start.getFullYear()}
                            </td>
                            <td className="py-3 pr-3 font-semibold">{isWithdrawal ? '-' : (tr.pair || '-')}</td>
                            <td className="py-3 pr-3">
                              {isWithdrawal ? (
                                <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-amber-500/20 text-amber-400">
                                  WITHDRAWAL
                                </span>
                              ) : (
                                <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${tr.tradeType === 'BUY' ? 'bg-sky-500/20 text-sky-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                  {tr.tradeType || 'BUY'}
                                </span>
                              )}
                            </td>
                            <td className="py-3 pr-3 font-mono text-xs">
                              {isWithdrawal ? '-' : <>{tr.lot || '0.01'} <span className="text-slate-500">/</span> {tr.orders || '1'}</>}
                            </td>
                            <td className="py-3 pr-3 font-mono text-xs">
                              {isWithdrawal ? '-' : <>
                                <span className={tr.tpStatus === 'HIT' ? 'text-green-400 font-bold' : 'text-slate-500'}>TP</span> 
                                <span className="text-slate-500 px-1">/</span> 
                                <span className={tr.slStatus === 'HIT' ? 'text-rose-400 font-bold' : 'text-slate-500'}>SL</span>
                              </>}
                            </td>
                            <td className={`py-3 pr-3 max-w-[150px] truncate ${textMuted}`} title={tr.notes}>{tr.notes || '-'}</td>
                            <td className="py-3 pr-3 text-right font-mono text-amber-400">{tr.withdrawal > 0 ? fmt(tr.withdrawal) : '-'}</td>
                            <td className="py-3 pr-3 text-right font-mono font-bold" style={{ color: tr.amount >= 0 && !isWithdrawal ? COLORS.gain : COLORS.loss }}>
                              {isWithdrawal ? '-' : fmt(tr.amount)}
                            </td>
                            <td className="py-3 pl-3">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={() => handleEditTrade(tr)} title={t.edit} className={`p-1.5 rounded-lg transition ${textMuted} hover:text-blue-400`}>
                                  <Edit2 size={15} />
                                </button>
                                <button onClick={() => handleDeleteTrade(tr.id)} title={t.delete} className={`p-1.5 rounded-lg transition ${textMuted} hover:text-rose-400`}>
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )})}
                    </tbody>
                  </table>
                </div>
              )}

              {sortedTrades.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t" style={{ borderColor: themeCardBorder }}>
                  <div className="flex items-center gap-3">
                    <p className={`text-xs ${textMuted}`}>
                      {t.showingLabel} {(safeCurrentPage - 1) * logPageSize + 1}-{Math.min(safeCurrentPage * logPageSize, sortedTrades.length)} {t.ofLabel} {sortedTrades.length} {t.entries}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs ${textMuted}`}>{t.rowsPerPage}</span>
                      <select
                        value={logPageSize}
                        onChange={(e) => setLogPageSize(Number(e.target.value))}
                        className={`${filterInputClassName} py-1`}
                        style={inputStyle}
                      >
                        {LOG_PAGE_SIZE_OPTIONS.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {totalLogPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={safeCurrentPage === 1}
                      className={`p-1.5 rounded-lg transition ${textMuted} hover:text-white disabled:opacity-30 disabled:cursor-not-allowed`}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {logPageNumbers.map((p, i) =>
                      p === '...' ? (
                        <span key={`ellipsis-${i}`} className={`px-1.5 text-xs ${textMuted}`}>...</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className={`min-w-[30px] px-2 py-1.5 rounded-lg text-xs font-semibold font-mono transition ${p === safeCurrentPage ? '' : `${textMuted} hover:text-white`}`}
                          style={p === safeCurrentPage ? { background: COLORS.accent, color: COLORS.accentText } : {}}
                        >
                          {p}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalLogPages, p + 1))}
                      disabled={safeCurrentPage === totalLogPages}
                      className={`p-1.5 rounded-lg transition ${textMuted} hover:text-white disabled:opacity-30 disabled:cursor-not-allowed`}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {dayDetailsDate && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 cursor-pointer"
          onClick={() => setDayDetailsDate(null)}
        >
          <div 
            className="w-full max-w-md p-6 rounded-2xl shadow-2xl border max-h-[85vh] overflow-y-auto no-scrollbar cursor-default" 
            style={cardStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <List style={{ color: COLORS.accent }} />
                <h2 className="text-xl font-bold">
                  {moment(dayDetailsDate).locale(lang === 'th' ? 'th' : 'en').format('DD MMMM')} {lang === 'th' ? dayDetailsDate.getFullYear() + 543 : dayDetailsDate.getFullYear()}
                </h2>
              </div>
              <button onClick={() => setDayDetailsDate(null)} className={`${textMuted} hover:text-rose-500 transition`}><X size={24} /></button>
            </div>

            <button
              onClick={() => {
                const selectedDateStr = moment(dayDetailsDate).format('YYYY-MM-DD');
                setDayDetailsDate(null);
                resetForm();
                setDate(selectedDateStr);
                setShowModal(true);
              }}
              className="w-full mb-4 flex items-center justify-center gap-2 rounded-xl py-2.5 font-medium text-sm transition hover:brightness-110"
              style={{ background: COLORS.accent, color: COLORS.accentText }}
            >
              <Plus size={16} /> {t.addTrade}
            </button>

            <div className="space-y-3">
              {dayDetailsEvents.length === 0 ? (
                <p className={`text-center py-6 ${textMuted}`}>{t.dayDetailsEmpty}</p>
              ) : dayDetailsEvents.map((event) => {
                const isWithdrawal = event.tradeType === '';
                return (
                <div key={event.id} className="p-4 rounded-xl border-l-4" style={{ background: themeCardElevated, borderLeftColor: event.amount > 0 && !isWithdrawal ? COLORS.gain : event.amount < 0 && !isWithdrawal ? COLORS.loss : COLORS.neutral }}>
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{isWithdrawal ? t.withdrawalStat : (event.pair || '-')}</h3>
                        {isWithdrawal ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-400">
                            WITHDRAWAL
                          </span>
                        ) : (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${event.tradeType === 'BUY' ? 'bg-sky-500/20 text-sky-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {event.tradeType || 'BUY'}
                          </span>
                        )}
                      </div>
                      
                      {!isWithdrawal && (
                        <>
                          <p className={`text-xs font-mono mt-0.5 ${textMuted}`}>Lot: {event.lot || '0.01'} | Orders: {event.orders || '1'}</p>
                          <p className="text-xs font-mono mt-1">
                            <span className={event.tpStatus === 'HIT' ? 'text-green-400 font-bold' : 'text-slate-500'}>TP {event.tpStatus === 'HIT' ? '✓' : ''}</span> | <span className={event.slStatus === 'HIT' ? 'text-rose-400 font-bold' : 'text-slate-500'}>SL {event.slStatus === 'HIT' ? '✓' : ''}</span>
                          </p>
                        </>
                      )}
                      
                      {event.notes && (
                        <p className={`text-sm mt-1 flex items-start gap-1 ${textMuted}`}>
                          <StickyNote size={13} className="mt-0.5 shrink-0" /> <span>{event.notes}</span>
                        </p>
                      )}
                      {event.withdrawal > 0 && !isWithdrawal && (
                        <p className="text-sm text-amber-400 mt-1 flex items-center gap-1">
                          <ArrowDownToLine size={14} /> {t.withdrawn}: {fmt(event.withdrawal)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {isWithdrawal ? (
                        <span className="text-xl font-extrabold font-mono text-amber-400">{fmt(event.withdrawal)}</span>
                      ) : (
                        <span className="text-xl font-extrabold font-mono" style={{ color: event.amount > 0 ? COLORS.gain : event.amount < 0 ? COLORS.loss : COLORS.neutral }}>{fmt(event.amount)}</span>
                      )}
                      <div className="flex gap-1">
                        <button onClick={() => handleEditTrade(event)} className={`p-1 rounded-lg transition ${textMuted} hover:text-blue-400`}><Edit2 size={14} /></button>
                        <button onClick={() => { handleDeleteTrade(event.id); setDayDetailsDate(null); }} className={`p-1 rounded-lg transition ${textMuted} hover:text-rose-400`}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 cursor-pointer"
          onClick={() => { setShowModal(false); resetForm(); }}
        >
          <div 
            className="w-full max-w-md p-6 rounded-2xl shadow-2xl border max-h-[90vh] overflow-y-auto no-scrollbar cursor-default" 
            style={cardStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {editingId ? <><Edit2 size={20} style={{ color: COLORS.accent }} /> {t.editTrade}</> : <><Plus size={20} style={{ color: COLORS.accent }} /> {t.addTrade}</>}
              </h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className={`${textMuted} hover:text-rose-500 transition`}><X size={24} /></button>
            </div>

            <form onSubmit={handleSaveTrade} className="space-y-4" noValidate>
              
              <div className="flex p-1 rounded-xl border mb-4" style={{ borderColor: themeCardBorder, background: isDarkMode ? '#1A1A24' : '#F8FAFC' }}>
                <button
                  type="button"
                  onClick={() => { setEntryMode('TRADE'); setFormErrors((prev) => ({ ...prev, withdrawal: false })); }}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${entryMode === 'TRADE' ? 'shadow' : textMuted}`}
                  style={entryMode === 'TRADE' ? { background: COLORS.accent, color: COLORS.accentText } : {}}
                >
                  {t.logTradeMode}
                </button>
                <button
                  type="button"
                  onClick={() => { setEntryMode('WITHDRAWAL'); setFormErrors((prev) => ({ ...prev, amount: false })); }}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${entryMode === 'WITHDRAWAL' ? 'shadow' : textMuted}`}
                  style={entryMode === 'WITHDRAWAL' ? { background: COLORS.neutral, color: '#fff' } : {}}
                >
                  {t.logWithdrawalMode}
                </button>
              </div>

              {entryMode === 'TRADE' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${textMuted}`}>{t.dateLabel}</label>
                      <input type="date" required value={date} onChange={(e) => { setDate(e.target.value); setFormErrors((prev) => ({ ...prev, date: false })); }} className={inputClassName} style={getFieldStyle(formErrors.date)} />
                      <FieldError show={formErrors.date} />
                    </div>
                    <div>
                      <label className={`flex items-center gap-1 text-sm font-medium mb-1 ${textMuted}`}><Tag size={14} /> {t.pairLabel}</label>
                      <input type="text" placeholder="XAUUSD" value={pair} onChange={(e) => setPair(e.target.value.toUpperCase())} className={inputClassName} style={inputStyle} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${textMuted}`}>{t.typeLabel}</label>
                      <div className="flex gap-1 h-[46px]">
                        <button
                          type="button"
                          onClick={() => setTradeType('BUY')}
                          className={`flex-1 rounded-xl text-xs font-bold font-mono transition border ${tradeType === 'BUY' ? 'bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-500/20' : 'bg-transparent text-sky-400 border-sky-500/40 hover:bg-sky-500/10'}`}
                        >
                          BUY
                        </button>
                        <button
                          type="button"
                          onClick={() => setTradeType('SELL')}
                          className={`flex-1 rounded-xl text-xs font-bold font-mono transition border ${tradeType === 'SELL' ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20' : 'bg-transparent text-rose-400 border-rose-500/40 hover:bg-rose-500/10'}`}
                        >
                          SELL
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${textMuted}`}>{t.lotLabel}</label>
                      <input type="text" placeholder="0.01" value={lot} onChange={(e) => setLot(e.target.value)} className={`${inputClassName} font-mono`} style={inputStyle} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${textMuted}`}>{t.ordersLabel}</label>
                      <input type="number" placeholder="1" value={orders} onChange={(e) => setOrders(e.target.value)} className={`${inputClassName} font-mono`} style={inputStyle} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${textMuted}`}>{t.tpLabel}</label>
                      <button
                        type="button"
                        onClick={() => setTpStatus(tpStatus === 'HIT' ? 'NONE' : 'HIT')}
                        className={`w-full h-[46px] rounded-xl text-xs font-bold font-mono transition border flex items-center justify-center gap-1.5 ${tpStatus === 'HIT' ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20' : 'bg-transparent text-slate-400 border-slate-700 hover:bg-slate-800/40'}`}
                      >
                        <Crosshair size={16} /> TP {tpStatus === 'HIT' ? 'HIT' : 'OFF'}
                      </button>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${textMuted}`}>{t.slLabel}</label>
                      <button
                        type="button"
                        onClick={() => setSlStatus(slStatus === 'HIT' ? 'NONE' : 'HIT')}
                        className={`w-full h-[46px] rounded-xl text-xs font-bold font-mono transition border flex items-center justify-center gap-1.5 ${slStatus === 'HIT' ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20' : 'bg-transparent text-slate-400 border-slate-700 hover:bg-slate-800/40'}`}
                      >
                        <ShieldAlert size={16} /> SL {slStatus === 'HIT' ? 'HIT' : 'OFF'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={`flex items-center gap-1 text-sm font-medium mb-1 ${textMuted}`}><StickyNote size={14} /> {t.notesLabel}</label>
                    <textarea placeholder={t.notesPlaceholder} value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${inputClassName} resize-none`} style={inputStyle} />
                  </div>

                  <hr style={{ borderColor: themeCardBorder }} className="my-4" />

                  {/* 🟢 ถอดช่องถอนเงินออกจากโหมดนี้ เหลือแค่ กำไร/ขาดทุน P&L จัดเต็มช่อง */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${textMuted}`}>{t.plLabel}</label>
                      <input type="number" step="any" required placeholder="0" value={amount} onChange={(e) => { setAmount(e.target.value); setFormErrors((prev) => ({ ...prev, amount: false })); }} className={`${inputClassName} font-mono`} style={getFieldStyle(formErrors.amount)} />
                      <FieldError show={formErrors.amount} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${textMuted}`}>{t.dateLabel}</label>
                      <input type="date" required value={date} onChange={(e) => { setDate(e.target.value); setFormErrors((prev) => ({ ...prev, date: false })); }} className={inputClassName} style={getFieldStyle(formErrors.date)} />
                      <FieldError show={formErrors.date} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${textMuted}`}>{t.withdrawalLabel}</label>
                      <input type="number" step="any" required placeholder="0" value={withdrawal} onChange={(e) => { setWithdrawal(e.target.value); setFormErrors((prev) => ({ ...prev, withdrawal: false })); }} className={`${inputClassName} font-mono text-amber-400 font-bold`} style={getFieldStyle(formErrors.withdrawal)} />
                      <FieldError show={formErrors.withdrawal} />
                    </div>
                  </div>
                  <div>
                    <label className={`flex items-center gap-1 text-sm font-medium mb-1 ${textMuted}`}><StickyNote size={14} /> {t.notesLabel}</label>
                    <textarea placeholder={t.notesPlaceholder} value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={`${inputClassName} resize-none`} style={inputStyle} />
                  </div>
                </>
              )}

              <button type="submit" className="w-full font-bold py-3 rounded-xl transition hover:brightness-110 mt-6" style={{ background: entryMode === 'TRADE' ? COLORS.accent : COLORS.neutral, color: entryMode === 'TRADE' ? COLORS.accentText : '#fff' }}>
                {editingId ? t.saveEdit : t.save}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}