import React, { useState } from 'react';
import { StudentSubmission, Student } from '../types';
import { WOODWORKING_CURRICULUM } from '../data/woodworkingCurriculum';
import { 
  Inbox, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Sparkles, 
  Eye, 
  Check, 
  RotateCcw,
  ExternalLink
} from 'lucide-react';

interface SubmissionManagementProps {
  submissions: StudentSubmission[];
  students: Student[];
  onGradeSubmission: (submissionId: string, score: number, feedback: string) => void;
}

export const SubmissionManagement: React.FC<SubmissionManagementProps> = ({
  submissions,
  students,
  onGradeSubmission,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'graded'>('all');
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState<number>(5);
  const [feedbackInput, setFeedbackInput] = useState<string>('');

  const filtered = submissions.filter((s) => {
    if (filterStatus === 'pending') return s.status === 'pending';
    if (filterStatus === 'graded') return s.status === 'graded';
    return true;
  });

  const handleStartReview = (sub: StudentSubmission) => {
    setActiveReviewId(sub.id);
    setScoreInput(sub.score ?? 5);
    setFeedbackInput(sub.feedback ?? 'ชิ้นงานมีความประณีต รอยต่อเข้ามุมได้ฉาก 90 องศาดีมาก');
  };

  const handleSaveGrade = (subId: string) => {
    onGradeSubmission(subId, scoreInput, feedbackInput);
    setActiveReviewId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-amber-700" />
            กล่องตรวจชิ้นงานออนไลน์ (Woodcraft Submissions Queue)
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            ตรวจประเมินภาพถ่ายผลงานช่างไม้ที่นักเรียนส่งผ่านระบบคลาวด์ พร้อมให้ข้อเสนอแนะพัฒนาฝีมือ
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterStatus === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            ทั้งหมด ({submissions.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterStatus === 'pending' ? 'bg-amber-600 text-white shadow-xs font-bold' : 'text-stone-600'
            }`}
          >
            รอตรวจ ({submissions.filter((s) => s.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('graded')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterStatus === 'graded' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-stone-600'
            }`}
          >
            ตรวจแล้ว ({submissions.filter((s) => s.status === 'graded').length})
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-stone-400 text-xs">
            ไม่พบรายการชิ้นงานในสถานะที่เลือก
          </div>
        ) : (
          filtered.map((sub) => {
            const student = students.find((s) => s.id === sub.studentId);
            const curr = WOODWORKING_CURRICULUM.find((c) => c.week === sub.week);
            const isReviewing = activeReviewId === sub.id;

            return (
              <div
                key={sub.id}
                className={`bg-white rounded-3xl p-6 border transition shadow-xs ${
                  sub.status === 'pending' ? 'border-amber-300 ring-2 ring-amber-500/10' : 'border-stone-200'
                }`}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image Preview */}
                  {sub.imageUrl && (
                    <div className="md:w-64 shrink-0">
                      <div className="relative group rounded-2xl overflow-hidden border border-stone-200 aspect-4/3 bg-stone-100">
                        <img
                          src={sub.imageUrl}
                          alt={sub.workTitle}
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <a
                          href={sub.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium gap-1.5 transition"
                        >
                          <ExternalLink className="w-4 h-4" /> ดูภาพขนาดเต็ม
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Submission Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                            สัปดาห์ที่ {sub.week} (เต็ม {curr?.maxScore || 5} คะแนน)
                          </span>
                          <span className="text-xs text-stone-500">{curr?.categoryLabel}</span>
                          <span className="text-xs font-mono text-stone-400">ส่งเมื่อ: {sub.submittedAt}</span>
                        </div>
                        <h3 className="text-base font-bold text-stone-900 mt-1">{sub.workTitle}</h3>
                      </div>

                      {/* Status Tag */}
                      <div>
                        {sub.status === 'graded' ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            ให้คะแนนแล้ว ({sub.score}/5)
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                            รอตรวจประเมิน
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/60 flex items-center gap-3 text-xs">
                      <span className="font-bold text-stone-900">{student?.name || 'ไม่พบชื่อนักเรียน'}</span>
                      <span className="text-stone-400">•</span>
                      <span className="text-stone-600">{student?.classRoom}</span>
                      <span className="text-stone-400">•</span>
                      <span className="font-mono text-stone-500">รหัส {student?.studentCode}</span>
                    </div>

                    {/* Student Notes */}
                    <div className="text-xs text-stone-700 bg-amber-50/40 p-3 rounded-xl border border-amber-200/60">
                      <strong>บันทึกจากผู้เรียน:</strong> {sub.notes}
                    </div>

                    {/* Feedback if already graded */}
                    {sub.feedback && !isReviewing && (
                      <div className="text-xs text-emerald-950 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <strong>คำติชมจากครู:</strong> {sub.feedback}
                        </div>
                      </div>
                    )}

                    {/* Grading Form */}
                    {isReviewing ? (
                      <div className="bg-stone-100 p-4 rounded-2xl border border-stone-300 space-y-3 mt-3 animate-in fade-in">
                        <h4 className="text-xs font-bold text-stone-800">
                          ประเมินและให้คะแนน (สัปดาห์ที่ {sub.week})
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                          <div>
                            <label className="block text-[11px] font-medium text-stone-700 mb-1">
                              คะแนนที่ได้ (เต็ม 5)
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="5"
                              value={scoreInput}
                              onChange={(e) => setScoreInput(parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-1.5 border border-stone-300 rounded-xl bg-white font-bold text-center"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[11px] font-medium text-stone-700 mb-1">
                              คำติชมและข้อเสนอแนะเชิงสร้างสรรค์
                            </label>
                            <input
                              type="text"
                              value={feedbackInput}
                              onChange={(e) => setFeedbackInput(e.target.value)}
                              placeholder="เช่น งานเข้าเดือยแน่นสนิท ผิวไม้เรียบเนียน ยอดเยี่ยม..."
                              className="w-full px-3 py-1.5 border border-stone-300 rounded-xl bg-white text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setActiveReviewId(null)}
                            className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-200 rounded-xl font-medium transition"
                          >
                            ยกเลิก
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveGrade(sub.id)}
                            className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition"
                          >
                            บันทึกคะแนนและส่งข้อเสนอแนะ
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleStartReview(sub)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {sub.status === 'graded' ? 'แก้ไขผลการตรวจ' : 'ตรวจชิ้นงานและให้คะแนน'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
