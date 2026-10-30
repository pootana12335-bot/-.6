import React, { useState, useEffect } from 'react';
import { Student, StudentSubmission } from '../types';
import { WOODWORKING_CURRICULUM } from '../data/woodworkingCurriculum';
import { calculateStudentGrade, getStudentLearningTrend } from '../utils/gradeCalculator';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Upload, 
  Image as ImageIcon, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Award, 
  Calculator,
  MessageSquare,
  Smartphone,
  ChevronDown,
  Hammer
} from 'lucide-react';

interface StudentPortalProps {
  students: Student[];
  submissions: StudentSubmission[];
  onSubmitWork: (submission: Omit<StudentSubmission, 'id' | 'submittedAt' | 'status'>) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  students,
  submissions,
  onSubmitWork,
}) => {
  // Active student selection
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'my_grades' | 'submit_work' | 'simulator'>('my_grades');

  // Submit work form state
  const [targetWeek, setTargetWeek] = useState<number>(11);
  const [workTitle, setWorkTitle] = useState<string>('กล่องไม้เอนกประสงค์ (Project 1)');
  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80');
  const [studentNotes, setStudentNotes] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Simulator target score state
  const [simulatedUpcomingScore, setSimulatedUpcomingScore] = useState<number>(5);

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const gradeRes = currentStudent ? calculateStudentGrade(currentStudent) : null;
  const trend = currentStudent ? getStudentLearningTrend(currentStudent) : [];

  // Trigger celebration confetti for high achievers
  useEffect(() => {
    if (gradeRes && gradeRes.grade >= 3.5) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  }, [selectedStudentId]);

  // Filter submissions for this student
  const mySubmissions = submissions.filter((sub) => sub.studentId === currentStudent?.id);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;

    const curr = WOODWORKING_CURRICULUM.find((w) => w.week === targetWeek);

    onSubmitWork({
      studentId: currentStudent.id,
      week: targetWeek,
      workTitle: workTitle || curr?.title || `ชิ้นงานสัปดาห์ที่ ${targetWeek}`,
      imageUrl: imageUrl.trim() || undefined,
      notes: studentNotes.trim() || 'ส่งผลงานช่างไม้ผ่านระบบออนไลน์',
    });

    setSubmitSuccess(true);
    setStudentNotes('');
    setTimeout(() => setSubmitSuccess(false), 4000);
  };

  const sampleImages = [
    { label: 'รอยต่อเข้าเดือยไม้ (Joint)', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80' },
    { label: 'กล่องไม้ประณีต (Box)', url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80' },
    { label: 'เก้าอี้สตูลไม้จริง (Stool)', url: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80' },
    { label: 'งานขัดแต่งและลงวานิช (Finishing)', url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80' },
  ];

  if (!currentStudent || !gradeRes) {
    return <div className="p-8 text-center text-stone-500">ไม่พบข้อมูลนักเรียน</div>;
  }

  // Simulated grade calculation
  const missingWeeksCount = trend.filter((t) => t.score === null || t.score === undefined).length;
  const simulatedProjectedTotal = Math.min(100, gradeRes.normalized100 + Math.round((missingWeeksCount * (simulatedUpcomingScore / 5)) * 2));
  let projectedGrade = 0;
  if (simulatedProjectedTotal >= 80) projectedGrade = 4.0;
  else if (simulatedProjectedTotal >= 75) projectedGrade = 3.5;
  else if (simulatedProjectedTotal >= 70) projectedGrade = 3.0;
  else if (simulatedProjectedTotal >= 65) projectedGrade = 2.5;
  else if (simulatedProjectedTotal >= 60) projectedGrade = 2.0;
  else if (simulatedProjectedTotal >= 55) projectedGrade = 1.5;
  else if (simulatedProjectedTotal >= 50) projectedGrade = 1.0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Student Selector Card (Mobile friendly) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-2xl shrink-0">
            {currentStudent.gender === 'หญิง' ? '👧' : '👦'}
          </div>
          <div>
            <div className="text-xs text-stone-400">เข้าสู่ระบบในชื่อนักเรียน:</div>
            <div className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
              <span>{currentStudent.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                {currentStudent.classRoom}
              </span>
            </div>
            <div className="text-xs text-stone-500 font-mono">
              รหัสนักเรียน: {currentStudent.studentCode} | วิชางานไม้และเครื่องเรือน | ครูผู้สอน: นายภูธนะ วงษ์บุญตรี
            </div>
          </div>
        </div>

        {/* Quick Switch Student Dropdown for demo & test */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 whitespace-nowrap">สลับผู้เรียน:</span>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-amber-500"
          >
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.studentCode} - {st.name} ({st.classRoom})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Student Hero Card */}
      <div className="bg-gradient-to-br from-amber-900 via-stone-900 to-amber-950 rounded-3xl text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Background Woodcraft Texture Accent */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center pointer-events-none">
          <Hammer className="w-64 h-64 text-amber-200" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              รายงานผลคะแนนเรียลไทม์ผ่านระบบคลาวด์
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              ผลการเรียนวิชางานไม้ ชั้น ม.6
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-md">
              ประเมินทักษะฝีมือช่างไม้ ความปลอดภัย การเข้าไม้ และชิ้นงานประดิษฐ์ ครบทั้ง 20 สัปดาห์
            </p>
          </div>

          {/* Grade Big Badge */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15">
            <div className="text-center">
              <div className="text-xs uppercase text-amber-300 font-bold tracking-wider">เกรดเฉลี่ยปัจจุบัน</div>
              <div className="text-4xl sm:text-5xl font-black text-amber-400 mt-0.5">
                {gradeRes.grade.toFixed(1)}
              </div>
              <div className="text-xs text-stone-200 mt-1 font-medium">{gradeRes.gradeLabel.split(' ')[0]}</div>
            </div>

            <div className="h-12 w-px bg-white/20"></div>

            <div className="text-center">
              <div className="text-xs uppercase text-stone-300 font-medium">คะแนนรวมสุทธิ</div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mt-0.5">
                {gradeRes.normalized100}
              </div>
              <div className="text-xs text-stone-300 mt-1">เต็ม 100 คะแนน</div>
            </div>
          </div>
        </div>

        {/* Progress Bar of 20 Weeks */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex justify-between text-xs text-stone-300 mb-2 font-medium">
            <span>ความคืบหน้าการส่งงานและสอบวัดผล</span>
            <span className="text-amber-300 font-bold">{gradeRes.completedAssignmentsCount} จาก 20 สัปดาห์ ({gradeRes.progressPercent}%)</span>
          </div>
          <div className="w-full bg-stone-800 rounded-full h-3 overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${gradeRes.progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Student Portal Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('my_grades')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'my_grades'
              ? 'bg-amber-800 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Award className="w-4 h-4" />
          สมุดคะแนน 20 สัปดาห์
        </button>

        <button
          onClick={() => setActiveTab('submit_work')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition relative ${
            activeTab === 'submit_work'
              ? 'bg-amber-800 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Upload className="w-4 h-4" />
          ส่งชิ้นงานผ่านระบบออนไลน์
          {mySubmissions.length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-stone-900 rounded-full text-[10px]">
              {mySubmissions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'simulator'
              ? 'bg-amber-800 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Calculator className="w-4 h-4" />
          คำนวณเกรดล่วงหน้า
        </button>
      </div>

      {/* TAB 1: MY 20-WEEK GRADES */}
      {activeTab === 'my_grades' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WOODWORKING_CURRICULUM.map((curr) => {
              const score = currentStudent.scores[curr.week];
              const isExam = curr.isExam !== undefined;
              const hasScore = score !== null && score !== undefined;

              return (
                <div
                  key={curr.week}
                  className={`bg-white p-4 rounded-2xl border transition shadow-xs ${
                    isExam
                      ? 'border-amber-400 bg-amber-50/40'
                      : hasScore
                        ? 'border-stone-200'
                        : 'border-dashed border-stone-300 bg-stone-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isExam ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-700'
                        }`}>
                          {isExam ? curr.isExam === 'midterm' ? '⭐ สอบกลางภาค' : '🏆 สอบปลายภาค' : `สัปดาห์ที่ ${curr.week}`}
                        </span>
                        <span className="text-[11px] text-stone-500">{curr.categoryLabel}</span>
                      </div>
                      <h3 className="text-sm font-bold text-stone-800">{curr.title}</h3>
                      <p className="text-xs text-stone-500 line-clamp-2">{curr.description}</p>
                    </div>

                    {/* Score Tag */}
                    <div className="text-right shrink-0">
                      {hasScore ? (
                        <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-center">
                          <div className="text-xs text-emerald-700 font-semibold">คะแนนที่ได้</div>
                          <div className="text-lg font-black text-emerald-900 leading-none mt-0.5">
                            {score} <span className="text-xs font-normal text-emerald-700">/{curr.maxScore}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-xl text-center">
                          <div className="text-[10px] text-stone-500">สถานะ</div>
                          <div className="text-xs font-bold text-amber-700 mt-0.5">รอส่งงาน/ตรวจ</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rubric Points */}
                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-wrap gap-1.5">
                    {curr.rubric.map((r, ri) => (
                      <span key={ri} className="text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                        {r.criteria} ({r.weight})
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SUBMIT WORK ONLINE */}
      {activeTab === 'submit_work' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  ส่งภาพถ่ายชิ้นงานและบันทึกผลการปฏิบัติงาน
                </h3>
                <p className="text-xs text-stone-500">
                  อัปโหลดภาพถ่ายชิ้นงานไม้ของคุณเพื่อให้ครูผู้สอนตรวจประเมินและให้ข้อเสนอแนะแบบเรียลไทม์
                </p>
              </div>
            </div>

            {submitSuccess && (
              <div className="mb-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-xs font-medium animate-in fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                ส่งชิ้นงานขึ้นระบบคลาวด์เรียบร้อยแล้ว ครูผู้สอนจะได้รับการแจ้งเตือนเพื่อตรวจให้คะแนน
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    เลือกสัปดาห์ที่ส่งงาน (เต็ม 5 คะแนน)
                  </label>
                  <select
                    value={targetWeek}
                    onChange={(e) => {
                      const w = parseInt(e.target.value);
                      setTargetWeek(w);
                      const c = WOODWORKING_CURRICULUM.find((item) => item.week === w);
                      if (c) setWorkTitle(c.title);
                    }}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500"
                  >
                    {WOODWORKING_CURRICULUM.filter((w) => !w.isExam).map((item) => (
                      <option key={item.week} value={item.week}>
                        สัปดาห์ที่ {item.week}: {item.title} ({item.categoryLabel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    หัวข้อชิ้นงาน / ชื่อผลงาน
                  </label>
                  <input
                    type="text"
                    required
                    value={workTitle}
                    onChange={(e) => setWorkTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  เลือกรูปภาพตัวอย่างหรือระบุ URL ภาพถ่ายชิ้นงาน
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {sampleImages.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImageUrl(s.url)}
                      className={`p-2 rounded-xl border text-left text-[11px] transition ${
                        imageUrl === s.url
                          ? 'border-amber-600 bg-amber-50 font-bold text-amber-900'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <img src={s.url} alt={s.label} className="w-full h-16 object-cover rounded-lg mb-1" />
                      {s.label}
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  placeholder="หรือวางลิงก์ URL รูปภาพผลงานของคุณที่นี่..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  คำอธิบายชิ้นงาน / เทคนิคที่ใช้ / สิ่งที่ได้เรียนรู้
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="เช่น ผมใช้เทคนิคการเข้าเดือยเหลี่ยม ขัดกระดาษทรายเบอร์ 120 และ 240 ตามเสี้ยนไม้ ทาเคลือบแลกเกอร์ด้าน 2 เที่ยว ไม่มีรอยหยด..."
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold shadow-md transition"
                >
                  <Upload className="w-4 h-4" />
                  ส่งชิ้นงานเข้าสู่ระบบ
                </button>
              </div>
            </form>
          </div>

          {/* Submissions List for Current Student */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-500" />
              ประวัติการส่งชิ้นงานของคุณ ({mySubmissions.length} รายการ)
            </h4>

            {mySubmissions.length === 0 ? (
              <div className="text-center p-8 bg-white rounded-2xl border border-stone-200 text-stone-400 text-xs">
                คุณยังไม่ได้ส่งชิ้นงานผ่านระบบออนไลน์
              </div>
            ) : (
              mySubmissions.map((sub) => (
                <div key={sub.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-4">
                  {sub.imageUrl && (
                    <img
                      src={sub.imageUrl}
                      alt={sub.workTitle}
                      className="w-full sm:w-36 h-28 object-cover rounded-xl border border-stone-200 shrink-0"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                          สัปดาห์ที่ {sub.week}
                        </span>
                        <h4 className="text-sm font-bold text-stone-900">{sub.workTitle}</h4>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sub.status === 'graded'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sub.status === 'graded' ? `ตรวจแล้ว (${sub.score}/5 คะแนน)` : 'รอครูผู้สอนตรวจ'}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      <strong>บันทึกของนักเรียน:</strong> {sub.notes}
                    </p>

                    {sub.feedback && (
                      <div className="text-xs text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <strong>คำติชมจากครูผู้สอน (ครูภูธนะ วงษ์บุญตรี):</strong> {sub.feedback}
                        </div>
                      </div>
                    )}

                    <div className="text-[10px] text-stone-400">
                      ส่งเมื่อ: {sub.submittedAt}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: GRADE SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                ระบบคำนวณและคาดการณ์เกรดล่วงหน้า (Grade Simulator)
              </h3>
              <p className="text-xs text-stone-500">
                ทดลองวางแผนเป้าหมายคะแนนสำหรับชิ้นงานที่ยังไม่ได้ส่ง เพื่อดูว่าคุณจะได้รับเกรดเฉลี่ยเท่าใดในปลายภาค
              </p>
            </div>
          </div>

          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-stone-700">
                หากในภาระงานที่เหลือ ({missingWeeksCount} สัปดาห์) คุณทำคะแนนเฉลี่ยได้:
              </span>
              <span className="text-sm font-bold text-amber-800">
                {simulatedUpcomingScore} จาก 5 คะแนน
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={simulatedUpcomingScore}
              onChange={(e) => setSimulatedUpcomingScore(parseFloat(e.target.value))}
              className="w-full accent-amber-700"
            />

            <div className="flex justify-between text-[11px] text-stone-400 font-medium">
              <span>1.0 (พอใช้)</span>
              <span>2.5 (ปานกลาง)</span>
              <span>4.0 (ดีมาก)</span>
              <span>5.0 (ดีเยี่ยม/เต็ม)</span>
            </div>
          </div>

          {/* Simulator Result Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
              <div className="text-xs text-amber-800 font-medium">คะแนนรวมสุทธิที่คาดว่าจะได้</div>
              <div className="text-4xl font-black text-amber-950 mt-1">
                {simulatedProjectedTotal} <span className="text-sm font-normal text-amber-800">/ 100</span>
              </div>
              <div className="text-xs text-amber-700 mt-1">
                (คะแนนเดิม {gradeRes.normalized100} + คะแนนคาดการณ์)
              </div>
            </div>

            <div className="bg-stone-900 text-white rounded-2xl p-5 text-center">
              <div className="text-xs text-stone-400 font-medium">เกรดเฉลี่ยที่คาดว่าจะได้รับ</div>
              <div className="text-4xl font-black text-amber-400 mt-1">
                {projectedGrade.toFixed(1)}
              </div>
              <div className="text-xs text-stone-300 mt-1">
                {projectedGrade >= 3.5 ? '🏆 มีสิทธิ์ได้รับเกียรติบัตรดีเด่น' : projectedGrade >= 2.0 ? 'ผ่านเกณฑ์มาตรฐาน' : '⚠️ ต้องเร่งส่งงานเพื่อหลีกเลี่ยงเกรด 0'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
