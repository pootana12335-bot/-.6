import React, { useState, useMemo } from 'react';
import { 
  Student, 
  ClassRoom, 
  GradeLevel 
} from '../types';
import { WOODWORKING_CURRICULUM } from '../data/woodworkingCurriculum';
import { calculateStudentGrade, checkIsStudentAtRisk } from '../utils/gradeCalculator';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Printer, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  FileSpreadsheet,
  ChevronRight,
  Sparkles,
  Edit3
} from 'lucide-react';
import { printStudentReportCard } from '../utils/exportUtils';

interface TeacherGradeBookProps {
  students: Student[];
  onUpdateScore: (studentId: string, week: number, score: number | null) => void;
  onSelectStudent: (student: Student) => void;
  onAddStudent: (newStudent: Omit<Student, 'id' | 'scores' | 'interventions'>) => void;
  onExportExcel: () => void;
}

export const TeacherGradeBook: React.FC<TeacherGradeBookProps> = ({
  students,
  onUpdateScore,
  onSelectStudent,
  onAddStudent,
  onExportExcel,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'at_risk' | 'honor'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeWeekColumn, setActiveWeekColumn] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Student Form State
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newClass, setNewClass] = useState<ClassRoom>('ม.6/5');
  const [newGender, setNewGender] = useState<'ชาย' | 'หญิง'>('ชาย');

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Class filter
      if (selectedClass !== 'all' && s.classRoom !== selectedClass) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(query);
        const matchCode = s.studentCode.toLowerCase().includes(query);
        if (!matchName && !matchCode) return false;
      }

      // Status filter
      if (selectedStatusFilter === 'at_risk') {
        const risk = checkIsStudentAtRisk(s);
        if (!risk.isAtRisk) return false;
      } else if (selectedStatusFilter === 'honor') {
        const res = calculateStudentGrade(s);
        if (res.grade < 3.5) return false;
      }

      return true;
    });
  }, [students, selectedClass, searchQuery, selectedStatusFilter]);

  const [quickFillConfirmation, setQuickFillConfirmation] = useState<{ week: number; score: number } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleScoreChange = (studentId: string, week: number, valStr: string, maxScore: number) => {
    if (valStr === '') {
      onUpdateScore(studentId, week, null);
      return;
    }
    const num = parseFloat(valStr);
    if (!isNaN(num)) {
      if (num < 0) {
        onUpdateScore(studentId, week, 0);
      } else if (num > maxScore) {
        onUpdateScore(studentId, week, maxScore);
      } else {
        onUpdateScore(studentId, week, num);
      }
    }
  };

  const handleQuickFillWeek = (week: number, scoreToFill: number) => {
    setQuickFillConfirmation({ week, score: scoreToFill });
  };

  const confirmQuickFill = () => {
    if (!quickFillConfirmation) return;
    filteredStudents.forEach((st) => {
      onUpdateScore(st.id, quickFillConfirmation.week, quickFillConfirmation.score);
    });
    setQuickFillConfirmation(null);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) {
      setFormError('กรุณากรอกรหัสนักเรียนและชื่อ-นามสกุลให้ครบถ้วน');
      return;
    }
    setFormError(null);

    const gradeLvl: GradeLevel = 'ม.6';
    onAddStudent({
      studentCode: newCode.trim(),
      name: newName.trim(),
      classRoom: newClass,
      gradeLevel: gradeLvl,
      gender: newGender,
    });

    setNewCode('');
    setNewName('');
    setShowAddModal(false);
  };

  const getGradeBadge = (grade: number) => {
    if (grade >= 4.0) return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
    if (grade >= 3.0) return 'bg-blue-100 text-blue-800 border-blue-300 font-semibold';
    if (grade >= 2.0) return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
    if (grade >= 1.0) return 'bg-orange-100 text-orange-800 border-orange-300 font-semibold';
    return 'bg-red-100 text-red-800 border-red-300 font-bold animate-pulse';
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Class Tabs, Search, Filters, Action buttons */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* Class Selection Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider mr-1">ห้องเรียน:</span>
          {['all', 'ม.6/5', 'ม.6/6'].map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                selectedClass === cls
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cls === 'all' ? 'ทุกห้องเรียน (ม.6/5, ม.6/6)' : cls}
            </button>
          ))}
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหารหัส หรือชื่อนักเรียน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600"
            />
          </div>

          {/* Quick Filter Status */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => setSelectedStatusFilter('all')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                selectedStatusFilter === 'all'
                  ? 'bg-white text-stone-800 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setSelectedStatusFilter('at_risk')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition flex items-center gap-1 ${
                selectedStatusFilter === 'at_risk'
                  ? 'bg-red-500 text-white shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-red-600'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              กลุ่มเฝ้าระวัง
            </button>
            <button
              onClick={() => setSelectedStatusFilter('honor')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition flex items-center gap-1 ${
                selectedStatusFilter === 'honor'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-emerald-700'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              เกรดดีเยี่ยม (3.5+)
            </button>
          </div>

          {/* Add Student Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs sm:text-sm font-medium transition shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">เพิ่มนักเรียน</span>
          </button>
        </div>
      </div>

      {/* 20-Week Info Tip */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-amber-900 gap-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>ครูผู้สอน: นายภูธนะ วงษ์บุญตรี</strong> &nbsp;|&nbsp; 
            <strong>เกณฑ์การบันทึกคะแนน:</strong> สัปดาห์ที่ 1-9 และ 11-19 (สัปดาห์ละ 5 คะแนน) | 
            <span className="bg-amber-200/80 px-1.5 py-0.5 rounded mx-1 font-semibold">สัปดาห์ที่ 10 (กลางภาค 10 คะแนน)</span> | 
            <span className="bg-amber-200/80 px-1.5 py-0.5 rounded mx-1 font-semibold">สัปดาห์ที่ 20 (ปลายภาค 20 คะแนน)</span>
            แปลงเป็นฐาน 100 คะแนน และตัดเกรดอัตโนมัติ
          </span>
        </div>
        <div className="text-stone-500 shrink-0 font-medium">
          แสดงข้อมูล {filteredStudents.length} จากทั้งหมด {students.length} คน
        </div>
      </div>

      {/* Main Gradebook Spreadsheet Container with Sticky Left Columns */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh] relative">
          <table className="w-full text-left text-xs border-collapse">
            {/* Table Header */}
            <thead className="bg-stone-100/90 backdrop-blur sticky top-0 z-30 border-b border-stone-300 text-stone-700 select-none shadow-xs">
              <tr>
                {/* Sticky Left: Index */}
                <th className="sticky left-0 z-30 bg-stone-100 p-2.5 text-center font-bold border-r border-stone-300 w-12 min-w-12">
                  ที่
                </th>
                {/* Sticky Left: Code */}
                <th className="sticky left-12 z-30 bg-stone-100 p-2.5 font-bold border-r border-stone-300 w-20 min-w-20">
                  รหัส
                </th>
                {/* Sticky Left: Name */}
                <th className="sticky left-32 z-30 bg-stone-100 p-2.5 font-bold border-r border-stone-300 w-48 min-w-48 shadow-md">
                  ชื่อ - สกุล
                </th>

                {/* 20 Weeks Headers */}
                {WOODWORKING_CURRICULUM.map((curr) => {
                  const isMidterm = curr.isExam === 'midterm';
                  const isFinal = curr.isExam === 'final';
                  const isExam = isMidterm || isFinal;

                  return (
                    <th
                      key={curr.week}
                      title={`${curr.title} (เต็ม ${curr.maxScore} คะแนน)`}
                      className={`p-2 text-center border-r border-stone-200 transition-colors min-w-[70px] max-w-[85px] ${
                        isExam 
                          ? 'bg-amber-100/80 font-bold text-amber-900 border-amber-300' 
                          : 'hover:bg-stone-200/60'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className={`text-[10px] uppercase font-bold ${isExam ? 'text-amber-800' : 'text-stone-500'}`}>
                          {isMidterm ? 'กลางภาค' : isFinal ? 'ปลายภาค' : `สัปดาห์ ${curr.week}`}
                        </span>
                        <span className="font-bold text-xs mt-0.5">
                          ({curr.maxScore})
                        </span>
                        
                        {/* Quick Fill Button */}
                        {!isExam && (
                          <button
                            onClick={() => handleQuickFillWeek(curr.week, 5)}
                            title={`กรอกคะแนนเต็ม 5 ให้ทุกคนในสัปดาห์ที่ ${curr.week}`}
                            className="mt-1 text-[9px] px-1 py-0.5 bg-stone-200 hover:bg-amber-600 hover:text-white rounded text-stone-600 transition"
                          >
                            ใส่ 5
                          </button>
                        )}
                      </div>
                    </th>
                  );
                })}

                {/* Summary Calculated Columns */}
                <th className="p-2.5 text-center font-bold bg-amber-50 text-amber-950 border-r border-amber-200 w-20 min-w-20">
                  รวมดิบ (120)
                </th>
                <th className="p-2.5 text-center font-bold bg-amber-100 text-amber-950 border-r border-amber-300 w-20 min-w-20">
                  สุทธิ (100)
                </th>
                <th className="p-2.5 text-center font-bold bg-stone-800 text-amber-300 border-r border-stone-700 w-16 min-w-16">
                  เกรด
                </th>
                <th className="p-2.5 text-center font-bold bg-stone-100 text-stone-700 border-r border-stone-200 w-28 min-w-28">
                  สถานะผู้เรียน
                </th>
                <th className="p-2.5 text-center font-bold bg-stone-100 text-stone-700 w-24 min-w-24">
                  เครื่องมือ
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-stone-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={28} className="p-12 text-center text-stone-400">
                    ไม่พบข้อมูลนักเรียนตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const gradeResult = calculateStudentGrade(student);
                  const riskInfo = checkIsStudentAtRisk(student);

                  return (
                    <tr 
                      key={student.id} 
                      className={`hover:bg-amber-50/40 transition-colors ${
                        riskInfo.isAtRisk ? 'bg-red-50/25' : ''
                      }`}
                    >
                      {/* Sticky Index */}
                      <td className="sticky left-0 z-20 bg-white p-2 text-center font-medium text-stone-500 border-r border-stone-200">
                        {idx + 1}
                      </td>

                      {/* Sticky Code */}
                      <td className="sticky left-12 z-20 bg-white p-2 font-mono text-stone-700 border-r border-stone-200">
                        {student.studentCode}
                      </td>

                      {/* Sticky Name + Class badge */}
                      <td className="sticky left-32 z-20 bg-white p-2 border-r border-stone-200 shadow-md">
                        <div className="flex items-center justify-between gap-1">
                          <button
                            onClick={() => onSelectStudent(student)}
                            className="font-medium text-stone-900 hover:text-amber-700 text-left truncate max-w-[130px] flex items-center gap-1.5"
                            title={student.name}
                          >
                            <span>{student.name}</span>
                          </button>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-semibold shrink-0">
                            {student.classRoom}
                          </span>
                        </div>
                      </td>

                      {/* 20-Week Score Inputs */}
                      {WOODWORKING_CURRICULUM.map((curr) => {
                        const score = student.scores[curr.week];
                        const isMidterm = curr.isExam === 'midterm';
                        const isFinal = curr.isExam === 'final';
                        const isExam = isMidterm || isFinal;
                        const hasScore = score !== null && score !== undefined;

                        return (
                          <td 
                            key={curr.week} 
                            className={`p-1 text-center border-r border-stone-200 ${
                              isExam ? 'bg-amber-50/60' : ''
                            }`}
                          >
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max={curr.maxScore}
                              value={hasScore ? score : ''}
                              placeholder="-"
                              onChange={(e) => handleScoreChange(student.id, curr.week, e.target.value, curr.maxScore)}
                              title={`${curr.title} (เต็ม ${curr.maxScore})`}
                              className={`w-12 py-1 text-center font-medium rounded border transition text-xs ${
                                isExam
                                  ? 'border-amber-300 font-bold bg-white focus:ring-amber-500'
                                  : hasScore 
                                    ? score === curr.maxScore 
                                      ? 'border-emerald-300 bg-emerald-50/40 text-emerald-900 font-semibold' 
                                      : 'border-stone-300 bg-white text-stone-800'
                                    : 'border-dashed border-stone-300 bg-stone-50/50 text-stone-400'
                              } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                            />
                          </td>
                        );
                      })}

                      {/* Raw Total */}
                      <td className="p-2 text-center font-bold text-amber-950 bg-amber-50/40 border-r border-amber-200">
                        {gradeResult.rawTotal}
                      </td>

                      {/* Normalized 100 Total */}
                      <td className="p-2 text-center font-extrabold text-stone-900 bg-amber-100/40 border-r border-amber-300">
                        {gradeResult.normalized100}
                      </td>

                      {/* Grade Badge */}
                      <td className="p-2 text-center border-r border-stone-200">
                        <span className={`inline-block px-2 py-0.5 rounded-lg text-xs border ${getGradeBadge(gradeResult.grade)}`}>
                          {gradeResult.grade.toFixed(1)}
                        </span>
                      </td>

                      {/* Student Status & Risk Alert */}
                      <td className="p-2 text-center border-r border-stone-200">
                        {riskInfo.isAtRisk ? (
                          <button
                            onClick={() => onSelectStudent(student)}
                            title={riskInfo.reasons.join('\n')}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 transition"
                          >
                            <AlertCircle className="w-3 h-3 text-red-600 shrink-0" />
                            <span>เฝ้าระวัง</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>ปกติ</span>
                          </span>
                        )}
                      </td>

                      {/* Action Tools */}
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectStudent(student)}
                            title="ดูแดชบอร์ดรายบุคคลและบันทึกการส่งเสริม"
                            className="p-1 text-stone-600 hover:text-amber-800 hover:bg-amber-100 rounded transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => printStudentReportCard(student)}
                            title="พิมพ์ใบรายงานผลการเรียนรายบุคคล (PDF)"
                            className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded transition"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-stone-900 mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-700" />
              เพิ่มรายชื่อนักเรียนใหม่
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              เพิ่มนักเรียนเข้าสู่สมุดคะแนนวิชางานไม้ ม.6 (ม.6/1, ม.6/2, ม.6/5, ม.6/6)
            </p>

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-stone-700 mb-1">รหัสประจำตัวนักเรียน</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 60506 หรือ 60605"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">ชื่อ - นามสกุล (พร้อมคำนำหน้า)</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นายธนาธิป สุขเกษม"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">ห้องเรียน</label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value as ClassRoom)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="ม.6/5">ม.6/5</option>
                    <option value="ม.6/6">ม.6/6</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">เพศ</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as 'ชาย' | 'หญิง')}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormError(null);
                  }}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-medium transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium shadow-sm transition"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Fill Confirmation Modal */}
      {quickFillConfirmation && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-stone-900">ยืนยันการกรอกคะแนนด่วน</h3>
            <p className="text-xs text-stone-600">
              คุณต้องการกรอกคะแนน <strong>{quickFillConfirmation.score} คะแนน</strong> ให้แก่นักเรียนทุกคนในสัปดาห์ที่ {quickFillConfirmation.week} ({filteredStudents.length} คน) ใช่หรือไม่?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQuickFillConfirmation(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmQuickFill}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white shadow-xs transition"
              >
                ยืนยันกรอกคะแนน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
