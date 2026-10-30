import React, { useState } from 'react';
import { Student, InterventionRecord } from '../types';
import { calculateStudentGrade, checkIsStudentAtRisk, getStudentLearningTrend } from '../utils/gradeCalculator';
import { WOODWORKING_CURRICULUM } from '../data/woodworkingCurriculum';
import { printStudentReportCard } from '../utils/exportUtils';
import { 
  X, 
  Printer, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  PlusCircle, 
  HeartHandshake, 
  Award,
  BookOpen,
  ShieldCheck,
  Hammer
} from 'lucide-react';

interface StudentDetailModalProps {
  student: Student;
  onClose: () => void;
  onAddIntervention: (studentId: string, intervention: Omit<InterventionRecord, 'id'>) => void;
  onUpdateScore: (studentId: string, week: number, score: number | null) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onAddIntervention,
  onUpdateScore,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'intervention'>('overview');
  const [reason, setReason] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [teacherNote, setTeacherNote] = useState('');
  const [resultStatus, setResultStatus] = useState<'in_progress' | 'resolved' | 'monitoring'>('in_progress');

  const gradeRes = calculateStudentGrade(student);
  const risk = checkIsStudentAtRisk(student);
  const trend = getStudentLearningTrend(student);

  const [interventionSaved, setInterventionSaved] = useState<boolean>(false);

  const handleSubmitIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !actionTaken.trim()) return;

    onAddIntervention(student.id, {
      date: new Date().toISOString().split('T')[0],
      reason: reason.trim(),
      actionTaken: actionTaken.trim(),
      resultStatus,
      teacherNote: teacherNote.trim() || 'ติดตามผลการพัฒนาต่อเนื่อง',
    });

    setReason('');
    setActionTaken('');
    setTeacherNote('');
    setInterventionSaved(true);
    setTimeout(() => setInterventionSaved(false), 3500);
  };

  // Category performance
  const categoryScores: Record<string, { earned: number; total: number }> = {};
  trend.forEach((t) => {
    if (!categoryScores[t.categoryLabel]) {
      categoryScores[t.categoryLabel] = { earned: 0, total: 0 };
    }
    categoryScores[t.categoryLabel].total += t.maxScore;
    if (t.score !== null && t.score !== undefined) {
      categoryScores[t.categoryLabel].earned += t.score;
    }
  });

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-5 sm:p-6 border-b border-amber-900/40 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10 sm:pr-0">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-600/30 border border-amber-400/40 flex items-center justify-center text-xl font-bold text-amber-200 shadow-inner">
                {student.gender === 'หญิง' ? '👧' : '👦'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold tracking-tight text-white">{student.name}</h2>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {student.classRoom} ({student.gradeLevel})
                  </span>
                  <span className="text-xs font-mono text-stone-400">
                    รหัส: {student.studentCode}
                  </span>
                </div>
                <p className="text-xs text-stone-300 mt-1 flex items-center gap-2 flex-wrap">
                  <span>รายวิชางานไม้และเครื่องเรือน</span>
                  <span>•</span>
                  <span>ภาคเรียนที่ 1/2569</span>
                  <span>•</span>
                  <span className="text-amber-300">ครูผู้สอน: นายภูธนะ วงษ์บุญตรี</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => printStudentReportCard(student)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md transition"
              >
                <Printer className="w-4 h-4" />
                พิมพ์ ปพ.5 (PDF)
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="bg-stone-800/80 rounded-2xl p-3 border border-stone-700/60 text-center">
              <div className="text-xs text-stone-400">เกรดเฉลี่ยปัจจุบัน</div>
              <div className="text-2xl font-black text-amber-400 mt-0.5">
                {gradeRes.grade.toFixed(1)}
              </div>
              <div className="text-[10px] text-stone-300 mt-0.5">{gradeRes.gradeLabel.split(' ')[0]}</div>
            </div>

            <div className="bg-stone-800/80 rounded-2xl p-3 border border-stone-700/60 text-center">
              <div className="text-xs text-stone-400">คะแนนสุทธิ (เต็ม 100)</div>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">
                {gradeRes.normalized100}
              </div>
              <div className="text-[10px] text-stone-300 mt-0.5">คะแนนดิบ {gradeRes.rawTotal}/130</div>
            </div>

            <div className="bg-stone-800/80 rounded-2xl p-3 border border-stone-700/60 text-center">
              <div className="text-xs text-stone-400">ส่งงานแล้ว</div>
              <div className="text-2xl font-black text-sky-400 mt-0.5">
                {gradeRes.completedAssignmentsCount} / 20
              </div>
              <div className="text-[10px] text-stone-300 mt-0.5">ความคืบหน้า {gradeRes.progressPercent}%</div>
            </div>

            <div className="bg-stone-800/80 rounded-2xl p-3 border border-stone-700/60 text-center">
              <div className="text-xs text-stone-400">สถานะและแนวโน้ม</div>
              <div className="text-base font-bold mt-1.5 flex items-center justify-center gap-1">
                {risk.isAtRisk ? (
                  <span className="text-red-400 flex items-center gap-1 text-xs font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" /> ต้องช่วยเหลือ
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1 text-xs font-bold">
                    <CheckCircle className="w-3.5 h-3.5" /> ปกติ / ก้าวหน้า
                  </span>
                )}
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5">
                {risk.isAtRisk ? `${risk.reasons.length} ข้อสังเกต` : 'พร้อมประเมินชิ้นงาน'}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="bg-stone-100 px-6 py-2 border-b border-stone-200 flex items-center gap-2 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'overview'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            📊 แนวโน้มพัฒนาการ 20 สัปดาห์
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'curriculum'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            📋 รายละเอียดคะแนนและเกณฑ์ประเมิน
          </button>
          <button
            onClick={() => setActiveTab('intervention')}
            className={`px-3 py-1.5 rounded-xl transition relative ${
              activeTab === 'intervention'
                ? 'bg-white text-amber-900 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            🤝 แผนช่วยเหลือและสอนซ่อมเสริม
            {student.interventions.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-amber-600 text-white text-[10px] rounded-full">
                {student.interventions.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW & LEARNING TREND */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Risk Alert Notice if applicable */}
              {risk.isAtRisk && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900">
                  <div className="flex items-center gap-2 font-bold text-sm text-red-800">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    ระบบตรวจพบภาวะเสี่ยงทางการเรียน (Early Warning Alert)
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-red-700 pl-7 list-disc">
                    {risk.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                  <div className="mt-3 pl-7">
                    <button
                      onClick={() => setActiveTab('intervention')}
                      className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition"
                    >
                      เปิดบันทึกแผนช่วยเหลือและสอนซ่อมเสริมทันที
                    </button>
                  </div>
                </div>
              )}

              {/* Visual 20-Week Trend Chart */}
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-700" />
                      กราฟแนวโน้มพัฒนาการคะแนน 20 สัปดาห์
                    </h3>
                    <p className="text-xs text-stone-500">
                      แสดงผลสัมฤทธิ์เป็นร้อยละ (%) เทียบกับคะแนนเต็มของแต่ละสัปดาห์
                    </p>
                  </div>
                </div>

                {/* Bar Graph */}
                <div className="h-44 flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 border-b border-stone-300">
                  {trend.map((t) => {
                    const pct = t.percent ?? 0;
                    const hasData = t.score !== null && t.score !== undefined;
                    const isMidterm = t.isExam === 'midterm';
                    const isFinal = t.isExam === 'final';

                    return (
                      <div key={t.week} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                        {/* Hover Tooltip */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none whitespace-nowrap bg-stone-900 text-white text-[11px] p-2 rounded-xl shadow-lg border border-stone-700">
                          <span className="font-bold">{t.title}</span>
                          <span>สัปดาห์ที่ {t.week} {isMidterm ? '(กลางภาค)' : isFinal ? '(ปลายภาค)' : ''}</span>
                          <span className="text-amber-400 font-bold">
                            {hasData ? `${t.score} / ${t.maxScore} คะแนน (${pct}%)` : 'ยังไม่ได้ประเมิน'}
                          </span>
                        </div>

                        {/* Bar */}
                        <div 
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            !hasData
                              ? 'bg-stone-200 h-2'
                              : isMidterm || isFinal
                                ? 'bg-amber-600 hover:bg-amber-500'
                                : pct >= 80 
                                  ? 'bg-emerald-500 hover:bg-emerald-400' 
                                  : pct >= 50 
                                    ? 'bg-amber-400 hover:bg-amber-300' 
                                    : 'bg-red-400 hover:bg-red-300'
                          }`}
                          style={{ height: hasData ? `${Math.max(8, pct * 0.9)}%` : '8px' }}
                        ></div>

                        {/* Label */}
                        <span className={`text-[9px] mt-1 font-mono ${isMidterm || isFinal ? 'font-bold text-amber-900' : 'text-stone-500'}`}>
                          {isMidterm ? 'กลาง' : isFinal ? 'ปลาย' : `W${t.week}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex items-center justify-between mt-3 text-[11px] text-stone-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 80%+ (ดีเยี่ยม)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> 50-79% (ปานกลาง)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> &lt;50% (ต้องพัฒนา)
                    </span>
                  </div>
                  <span>คลิกแท็บ &quot;รายละเอียดคะแนน&quot; เพื่อปรับแก้คะแนน</span>
                </div>
              </div>

              {/* Categorical Competencies Breakdown */}
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200">
                <h3 className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-700" />
                  สมรรถนะตามหมวดหมู่งานไม้ (Workplace Competencies)
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(categoryScores).map(([catLabel, data]) => {
                    const pct = data.total > 0 ? Math.round((data.earned / data.total) * 100) : 0;
                    return (
                      <div key={catLabel} className="bg-white p-3.5 rounded-xl border border-stone-200">
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className="font-semibold text-stone-800">{catLabel}</span>
                          <span className="font-bold text-amber-800">{pct}% ({data.earned}/{data.total})</span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED 20-WEEK CURRICULUM & SCORE EDIT */}
          {activeTab === 'curriculum' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-500">
                คุณสามารถตรวจและปรับแก้คะแนนของนักเรียนในแต่ละสัปดาห์ได้โดยตรง ระบบจะคำนวณและตัดเกรดใหม่ทันที
              </p>

              <div className="divide-y divide-stone-200 border border-stone-200 rounded-2xl overflow-hidden bg-white">
                {WOODWORKING_CURRICULUM.map((curr) => {
                  const score = student.scores[curr.week];
                  const hasScore = score !== null && score !== undefined;
                  const isExam = curr.isExam !== undefined;

                  return (
                    <div 
                      key={curr.week} 
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isExam ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      <div className="space-y-1 max-w-lg">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isExam ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-700'
                          }`}>
                            {isExam ? curr.isExam === 'midterm' ? 'สอบกลางภาค' : 'สอบปลายภาค' : `สัปดาห์ที่ ${curr.week}`}
                          </span>
                          <span className="text-xs text-stone-500 font-medium">{curr.categoryLabel}</span>
                        </div>
                        <h4 className="text-sm font-bold text-stone-900">{curr.title}</h4>
                        <p className="text-xs text-stone-600">{curr.description}</p>
                        
                        {/* Rubrics Preview */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {curr.rubric.map((r, ri) => (
                            <span key={ri} className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded border border-stone-200">
                              • {r.criteria} ({r.weight})
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Score Input */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-[10px] text-stone-400">คะแนนที่ได้ / เต็ม {curr.maxScore}</div>
                          <div className="text-xs font-semibold text-stone-700">
                            {hasScore ? `${Math.round((score / curr.maxScore) * 100)}%` : 'ยังไม่ได้บันทึก'}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max={curr.maxScore}
                            value={hasScore ? score : ''}
                            placeholder="-"
                            onChange={(e) => {
                              const val = e.target.value === '' ? null : parseFloat(e.target.value);
                              onUpdateScore(student.id, curr.week, val);
                            }}
                            className="w-16 py-1.5 px-2 text-center text-sm font-bold border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                          />
                          <button
                            onClick={() => onUpdateScore(student.id, curr.week, curr.maxScore)}
                            title="ให้คะแนนเต็ม"
                            className="px-2 py-1.5 text-xs bg-stone-100 hover:bg-emerald-600 hover:text-white rounded-xl transition text-stone-600"
                          >
                            เต็ม
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: INTERVENTION & ASSISTANCE PLAN */}
          {activeTab === 'intervention' && (
            <div className="space-y-6">
              {/* Form to add intervention */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-amber-950 mb-1 flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-amber-700" />
                  บันทึกมาตรการช่วยเหลือและแผนการสอนซ่อมเสริม (Individual Intervention Plan)
                </h3>
                <p className="text-xs text-amber-800 mb-4">
                  ใช้สำหรับการติดตามช่วยเหลือนักเรียนที่มีผลการเรียนต่ำกว่าปกติ ขาดส่งงาน หรือต้องการพัฒนาทักษะเฉพาะด้าน
                </p>

                {interventionSaved && (
                  <div className="mb-3 p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    บันทึกแผนส่งเสริมและช่วยเหลือผู้เรียนเรียบร้อยแล้ว
                  </div>
                )}

                <form onSubmit={handleSubmitIntervention} className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      สาเหตุ / พฤติกรรมการเรียนรู้ที่ตรวจพบ
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น ขาดส่งงานสัปดาห์ที่ 8-11 หรือทำชิ้นงานเข้าเดือยไม่ผ่านเกณฑ์ฉาก 90 องศา"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      มาตรการให้ความช่วยเหลือ / แผนการสอนซ่อมเสริม
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="เช่น นัดหมายฝึกปฏิบัติซ่อมเสริมวันพฤหัสบดีคาบ 8, ให้เพื่อนคู่หูช่วยประกบสอนการลับใบกบ, ส่งแบบประเมินให้ผู้ปกครองรับทราบ"
                      value={actionTaken}
                      onChange={(e) => setActionTaken(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">
                        ข้อเสนอแนะเพิ่มเติมของครูผู้สอน
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น นักเรียนเริ่มมีสมาธิดีขึ้น แนะนำให้ส่งงานภายในสัปดาห์หน้า"
                        value={teacherNote}
                        onChange={(e) => setTeacherNote(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-stone-700 mb-1">
                        สถานะการติดตาม
                      </label>
                      <select
                        value={resultStatus}
                        onChange={(e) => setResultStatus(e.target.value as any)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="in_progress">อยู่ระหว่างดำเนินการช่วยเหลือ (In Progress)</option>
                        <option value="monitoring">เฝ้าติดตามผลต่อเนื่อง (Monitoring)</option>
                        <option value="resolved">แก้ไขปัญหาสำเร็จและผ่านเกณฑ์แล้ว (Resolved)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-medium shadow-sm transition text-xs sm:text-sm"
                    >
                      <PlusCircle className="w-4 h-4" />
                      บันทึกแผนช่วยเหลือ
                    </button>
                  </div>
                </form>
              </div>

              {/* History of Interventions */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-stone-500" />
                  ประวัติการให้คำปรึกษาและซ่อมเสริม ({student.interventions.length} รายการ)
                </h4>

                {student.interventions.length === 0 ? (
                  <div className="text-center p-8 bg-stone-50 rounded-2xl border border-dashed border-stone-300 text-stone-400 text-xs">
                    ยังไม่มีประวัติการบันทึกแผนช่วยเหลือสำหรับนักเรียนคนนี้
                  </div>
                ) : (
                  student.interventions.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                            📅 วันที่ {item.date}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.resultStatus === 'resolved' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : item.resultStatus === 'monitoring'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.resultStatus === 'resolved' ? 'แก้ไขสำเร็จ' : item.resultStatus === 'monitoring' ? 'เฝ้าติดตาม' : 'กำลังดำเนินการ'}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-stone-800">
                        <strong>สาเหตุ:</strong> {item.reason}
                      </div>

                      <div className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        <strong>มาตรการช่วยเหลือ:</strong> {item.actionTaken}
                      </div>

                      {item.teacherNote && (
                        <div className="text-xs text-stone-500 italic">
                          📝 บันทึกครู: {item.teacherNote}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 px-6 py-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <div>
            คะแนนจะถูกบันทึกลงฐานข้อมูลคลาวด์โดยอัตโนมัติ
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-medium transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
