import React from 'react';
import { Student } from '../types';
import { computeClassStatistics, calculateStudentGrade } from '../utils/gradeCalculator';
import { 
  Building2, 
  Users, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Printer, 
  BarChart, 
  CheckCircle2, 
  Hammer,
  Sparkles
} from 'lucide-react';

interface ExecutiveDashboardProps {
  students: Student[];
  onExportExcel: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  students,
  onExportExcel,
}) => {
  const allStats = computeClassStatistics(students);
  const c605Stats = computeClassStatistics(students.filter((s) => s.classRoom === 'ม.6/5'));
  const c606Stats = computeClassStatistics(students.filter((s) => s.classRoom === 'ม.6/6'));

  const printExecutiveSummary = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-2">
            <Building2 className="w-4 h-4" />
            <span>รายงานสารสนเทศสำหรับฝ่ายบริหารและหัวหน้ากลุ่มสาระฯ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            แดชบอร์ดสรุปผลการจัดการเรียนรู้วิชางานไม้ ชั้น ม.6 (ม.6/5 และ ม.6/6)
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl">
            สรุปผลสัมฤทธิ์ทางการเรียน คุณภาพชิ้นงานตามเกณฑ์มาตรฐาน และระบบเฝ้าระวังผู้เรียนกลุ่มเสี่ยง ประจำปีการศึกษา 2569
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={printExecutiveSummary}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            พิมพ์รายงานสรุปผู้บริหาร
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Students */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>นักเรียนทั้งหมดที่ลงทะเบียน</span>
            <Users className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-3xl font-black text-stone-900 mt-2">
            {allStats.studentCount} <span className="text-sm font-normal text-stone-500">คน</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            ม.6/5 ({c605Stats.studentCount} คน) | ม.6/6 ({c606Stats.studentCount} คน)
          </div>
        </div>

        {/* KPI 2: Mean GPA */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>เกรดเฉลี่ยรวม (Mean GPA)</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-2">
            {allStats.averageGrade.toFixed(2)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            คะแนนเฉลี่ยร้อยละ {allStats.averageScore} / 100
          </div>
        </div>

        {/* KPI 3: Passing Rate */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>อัตราการผ่านเกณฑ์ (Pass Rate)</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-blue-600 mt-2">
            {allStats.passingRate}%
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            เกณฑ์ผ่าน: เกรดตั้งแต่ 1.0 ขึ้นไป
          </div>
        </div>

        {/* KPI 4: At-Risk */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>กลุ่มเฝ้าระวัง / ต้องการช่วยเหลือ</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-3xl font-black text-red-600 mt-2">
            {allStats.atRiskCount} <span className="text-sm font-normal text-stone-500">คน</span>
          </div>
          <div className="text-[11px] text-red-600 font-medium mt-1">
            {allStats.atRiskCount > 0 ? 'มีแผนการสอนซ่อมเสริมรองรับแล้ว' : 'นักเรียนทุกคนผ่านเกณฑ์'}
          </div>
        </div>
      </div>

      {/* Grade Distribution & Level Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Grade Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <BarChart className="w-4 h-4 text-amber-700" />
              การกระจายตัวของระดับผลการเรียน (Grade Distribution)
            </h3>
            <span className="text-xs text-stone-500">ตามมาตรฐานกระทรวงฯ</span>
          </div>

          <div className="space-y-2.5 pt-2">
            {Object.entries(allStats.gradeCounts).reverse().map(([gr, count]) => {
              const pct = allStats.studentCount > 0 ? Math.round((count / allStats.studentCount) * 100) : 0;
              const isHonor = gr === '4.0' || gr === '3.5';
              const isFail = gr === '0';

              return (
                <div key={gr} className="flex items-center gap-3 text-xs">
                  <div className={`w-12 font-bold text-right shrink-0 ${isFail ? 'text-red-600' : isHonor ? 'text-emerald-700' : 'text-stone-700'}`}>
                    เกรด {gr}
                  </div>
                  <div className="flex-1 bg-stone-100 rounded-full h-5 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 flex items-center px-2 text-[10px] text-white font-bold ${
                        isFail ? 'bg-red-500' : isHonor ? 'bg-emerald-600' : 'bg-amber-600'
                      }`}
                      style={{ width: `${Math.max(5, pct)}%` }}
                    >
                      {count > 0 && `${count} คน`}
                    </div>
                  </div>
                  <div className="w-12 text-stone-500 font-mono text-right text-[11px] shrink-0">
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Grade 6 Classroom Comparison */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-700" />
            การเปรียบเทียบผลสัมฤทธิ์รายห้องเรียน ชั้น ม.6
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* M.6/5 Card */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-center space-y-2">
              <span className="px-3 py-1 rounded-full bg-amber-700 text-white text-xs font-bold">
                ห้อง ม.6/5
              </span>
              <div className="text-2xl font-black text-stone-900">
                GPA {c605Stats.averageGrade.toFixed(2)}
              </div>
              <div className="text-xs text-stone-500">
                คะแนนเฉลี่ย: {c605Stats.averageScore} / 100 • อัตราผ่านเกณฑ์: <strong className="text-emerald-600">{c605Stats.passingRate}%</strong>
              </div>
              <div className="text-xs text-stone-500">
                นักเรียนทั้งหมด: {c605Stats.studentCount} คน • กลุ่มเฝ้าระวัง: <strong className={c605Stats.atRiskCount > 0 ? 'text-red-600' : 'text-emerald-600'}>{c605Stats.atRiskCount} คน</strong>
              </div>
            </div>

            {/* M.6/6 Card */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-center space-y-2">
              <span className="px-3 py-1 rounded-full bg-amber-900 text-white text-xs font-bold">
                ห้อง ม.6/6
              </span>
              <div className="text-2xl font-black text-stone-900">
                GPA {c606Stats.averageGrade.toFixed(2)}
              </div>
              <div className="text-xs text-stone-500">
                คะแนนเฉลี่ย: {c606Stats.averageScore} / 100 • อัตราผ่านเกณฑ์: <strong className="text-emerald-600">{c606Stats.passingRate}%</strong>
              </div>
              <div className="text-xs text-stone-500">
                นักเรียนทั้งหมด: {c606Stats.studentCount} คน • กลุ่มเฝ้าระวัง: <strong className={c606Stats.atRiskCount > 0 ? 'text-red-600' : 'text-emerald-600'}>{c606Stats.atRiskCount} คน</strong>
              </div>
            </div>
          </div>

          {/* Competency Summary Bars */}
          <div className="pt-2 border-t border-stone-100 space-y-2">
            <div className="text-xs font-bold text-stone-700">ผลสัมฤทธิ์ตามสาระสำคัญงานไม้:</div>
            {Object.entries(allStats.categoryAverages).map(([cat, avg]) => (
              <div key={cat} className="flex items-center justify-between text-xs">
                <span className="text-stone-600">{cat}</span>
                <span className="font-bold text-stone-800">{avg}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Executive Report Note for Quality Assurance */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6">
        <h3 className="text-sm font-bold text-amber-950 mb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-800" />
          บทวิเคราะห์เชิงบริหารสำหรับการประกันคุณภาพการศึกษา (SAR Summary)
        </h3>
        <p className="text-xs text-amber-900 leading-relaxed">
          จากการประเมินผลการเรียนรู้ตลอด 20 สัปดาห์ พบว่านักเรียนส่วนใหญ่มีทักษะด้านความปลอดภัยและการปฏิบัติตามกฎระเบียบโรงฝึกงานอยู่ในระดับดีเยี่ยม (95%+) 
          สำหรับชิ้นงานสร้างสรรค์ (กล่องไม้เอนกประสงค์และเก้าอี้สตูลไม้จริง) นักเรียนสามารถประยุกต์ใช้เทคนิคการเข้าไม้แบบเดือยเหลี่ยมและร่องเดือยได้ตามเกณฑ์มาตรฐาน 
          สำหรับผู้เรียนกลุ่มเฝ้าระวัง ({allStats.atRiskCount} คน) ครูผู้สอนได้จัดทำแผนการสอนซ่อมเสริมรายบุคคล (Individualized Remedial Plan) 
          พร้อมช่องทางส่งงานออนไลน์เพื่อเปิดโอกาสให้พัฒนาทักษะซ้ำจนผ่านเกณฑ์
        </p>
      </div>
    </div>
  );
};
