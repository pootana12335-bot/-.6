import React, { useState } from 'react';
import { Student } from '../types';
import { checkIsStudentAtRisk, calculateStudentGrade } from '../utils/gradeCalculator';
import { 
  AlertTriangle, 
  UserCheck, 
  Clock, 
  Send, 
  Copy, 
  Check, 
  FileText, 
  Eye, 
  ShieldAlert, 
  PhoneCall,
  HeartHandshake
} from 'lucide-react';

interface RiskAlertPanelProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
}

export const RiskAlertPanel: React.FC<RiskAlertPanelProps> = ({
  students,
  onSelectStudent,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const atRiskStudents = students.filter((s) => checkIsStudentAtRisk(s).isAtRisk);

  const handleCopyNotificationMessage = (student: Student, reasons: string[]) => {
    const gradeRes = calculateStudentGrade(student);
    const text = `[แจ้งเตือนผลการเรียนวิชางานไม้]\nเรียน ผู้ปกครองของ ${student.name} (${student.classRoom} รหัส ${student.studentCode})\n\nครูผู้สอน (นายภูธนะ วงษ์บุญตรี) ขอรายงานความก้าวหน้าการเรียนวิชางานไม้ คะแนนปัจจุบัน ${gradeRes.normalized100}/100 (เกรด ${gradeRes.grade.toFixed(1)})\n\nข้อสังเกตที่ควรได้รับการสนับสนุน:\n${reasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\nทางโรงเรียนได้จัดโปรแกรมสอนซ่อมเสริมเพื่อช่วยเหลือนักเรียนให้ผ่านเกณฑ์ ขอความอนุเคราะห์ผู้ปกครองร่วมกำชับติดตามครับ\nด้วยความเคารพอย่างสูง,\nนายภูธนะ วงษ์บุญตรี (ครูผู้สอน)`;

    navigator.clipboard.writeText(text);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Alert Header Banner */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-red-800/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-red-300 text-xs font-semibold mb-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>ระบบวิเคราะห์และเฝ้าระวังผู้เรียนที่มีผลการเรียนต่ำกว่าปกติ (Early Warning & Intervention)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ศูนย์แจ้งเตือนและช่วยเหลือผู้เรียนรายบุคคล
          </h1>
          <p className="text-xs sm:text-sm text-red-200 mt-1 max-w-2xl">
            ตรวจพบนักเรียนที่มีคะแนนต่ำกว่าเกณฑ์ ค้างส่งงาน หรือแนวโน้มพัฒนาการลดลง เพื่อให้คำแนะนำและช่วยเหลือได้อย่างทันท่วงที
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur px-5 py-3 rounded-2xl border border-white/10 text-center shrink-0">
          <div className="text-xs text-red-200">นักเรียนในกลุ่มเฝ้าระวัง</div>
          <div className="text-3xl font-black text-red-300 mt-0.5">
            {atRiskStudents.length} <span className="text-sm font-normal text-white">คน</span>
          </div>
          <div className="text-[10px] text-red-200 mt-0.5">จากทั้งหมด {students.length} คน</div>
        </div>
      </div>

      {/* Main List of At-Risk Students */}
      {atRiskStudents.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">ยอดเยี่ยมมาก! ไม่มีนักเรียนในกลุ่มเสี่ยงในขณะนี้</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            นักเรียนทุกคนมีผลคะแนนผ่านเกณฑ์มาตรฐาน 50% และส่งผลงานช่างไม้ต่อเนื่องตามกำหนดเวลา
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {atRiskStudents.map((student) => {
            const gradeRes = calculateStudentGrade(student);
            const risk = checkIsStudentAtRisk(student);

            return (
              <div
                key={student.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-red-200 shadow-xs hover:border-red-300 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-800 flex items-center justify-center font-bold text-xl border border-red-200 shrink-0">
                      ⚠️
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-stone-900">{student.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold">
                          {student.classRoom} ({student.gradeLevel})
                        </span>
                        <span className="text-xs text-stone-400 font-mono">
                          รหัส: {student.studentCode}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        คะแนนสะสมสุทธิ: <strong className="text-red-600">{gradeRes.normalized100}/100</strong> (เกรด {gradeRes.grade.toFixed(1)}) | 
                        ส่งงานแล้ว {gradeRes.completedAssignmentsCount}/20 สัปดาห์
                      </div>
                    </div>
                  </div>

                  {/* Severity Badge & Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyNotificationMessage(student, risk.reasons)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition"
                      title="คัดลอกข้อความแจ้งเตือนสำหรับส่งทาง LINE หรือประสานผู้ปกครอง"
                    >
                      {copiedId === student.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">คัดลอกแล้ว!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>คัดลอกข้อความแจ้งผู้ปกครอง</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onSelectStudent(student)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      จัดการแผนช่วยเหลือ
                    </button>
                  </div>
                </div>

                {/* Reasons List */}
                <div className="bg-red-50/80 rounded-2xl p-4 border border-red-100 space-y-2">
                  <div className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    สัญญาณเตือนที่ระบบตรวจพบ:
                  </div>
                  <ul className="space-y-1 text-xs text-red-800 pl-5 list-disc">
                    {risk.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                {/* Existing Interventions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100 gap-2">
                  <div>
                    <strong>สถานะการช่วยเหลือ: </strong>
                    {student.interventions.length > 0 ? (
                      <span className="text-amber-800 font-medium">
                        บันทึกแผนแล้ว {student.interventions.length} ครั้ง (ล่าสุด: {student.interventions[student.interventions.length - 1].date})
                      </span>
                    ) : (
                      <span className="text-stone-400">ยังไม่มีการบันทึกแผนสอนซ่อมเสริม</span>
                    )}
                  </div>
                  <button
                    onClick={() => onSelectStudent(student)}
                    className="text-amber-800 hover:underline font-bold text-left sm:text-right"
                  >
                    + เพิ่มบันทึกการสอนซ่อมเสริม / นัดหมายคาบปฏิบัติ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
