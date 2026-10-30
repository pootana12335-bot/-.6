/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Student, StudentSubmission, UserRole, InterventionRecord, ClassRoom } from './types';
import { INITIAL_STUDENTS, INITIAL_SUBMISSIONS } from './data/initialData';
import { checkIsStudentAtRisk } from './utils/gradeCalculator';
import { exportStudentsToExcel } from './utils/exportUtils';
import { Navbar } from './components/Navbar';
import { TeacherGradeBook } from './components/TeacherGradeBook';
import { StudentDetailModal } from './components/StudentDetailModal';
import { StudentPortal } from './components/StudentPortal';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { RiskAlertPanel } from './components/RiskAlertPanel';
import { SubmissionManagement } from './components/SubmissionManagement';
import { CloudSyncModal } from './components/CloudSyncModal';
import { Hammer, Heart, ShieldCheck, Sparkles } from 'lucide-react';

const STORAGE_KEY_STUDENTS = 'woodcraft_grade_students_v4';
const STORAGE_KEY_SUBMISSIONS = 'woodcraft_grade_submissions_v4';

export default function App() {
  // Load persistent state
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (saved) {
        const parsed: any[] = JSON.parse(saved);
        return parsed
          .filter((st) => st.classRoom !== 'ม.6/1' && st.classRoom !== 'ม.6/2')
          .map((st) => {
            let updatedRoom: ClassRoom = st.classRoom === 'ม.6/6' || st.classRoom === 'ม.5/2' ? 'ม.6/6' : 'ม.6/5';

            let week10Score = st.scores[10];
            if (week10Score !== null && week10Score !== undefined && week10Score > 10) {
              week10Score = Math.round((week10Score / 2) * 10) / 10;
            }

            return {
              ...st,
              classRoom: updatedRoom,
              gradeLevel: 'ม.6' as const,
              scores: {
                ...st.scores,
                10: week10Score,
              },
            };
          });
      }
    } catch (e) {
      console.error('Failed to load students from localStorage', e);
    }
    return INITIAL_STUDENTS;
  });

  const [submissions, setSubmissions] = useState<StudentSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load submissions from localStorage', e);
    }
    return INITIAL_SUBMISSIONS;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('teacher');
  const [activeTab, setActiveTab] = useState<string>('gradebook');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  // Save to localStorage & simulate cloud sync
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [students, submissions]);

  // Keep selected student modal in sync when their scores change
  useEffect(() => {
    if (selectedStudentForModal) {
      const updated = students.find((s) => s.id === selectedStudentForModal.id);
      if (updated) setSelectedStudentForModal(updated);
    }
  }, [students]);

  const updateStudentScore = (studentId: string, week: number, score: number | null) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          scores: {
            ...s.scores,
            [week]: score,
          },
        };
      })
    );
    setLastSyncTime(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const handleAddIntervention = (studentId: string, intervention: Omit<InterventionRecord, 'id'>) => {
    const newRecord: InterventionRecord = {
      id: `int-${Date.now()}`,
      ...intervention,
    };

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          interventions: [newRecord, ...s.interventions],
        };
      })
    );
    setLastSyncTime(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const handleAddStudent = (newStudentData: Omit<Student, 'id' | 'scores' | 'interventions'>) => {
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      ...newStudentData,
      scores: {},
      interventions: [],
    };

    setStudents((prev) => [newStudent, ...prev]);
    setLastSyncTime(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const handleStudentSubmitWork = (newSub: Omit<StudentSubmission, 'id' | 'submittedAt' | 'status'>) => {
    const created: StudentSubmission = {
      id: `sub-${Date.now()}`,
      ...newSub,
      submittedAt: new Date().toLocaleString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'pending',
    };

    setSubmissions((prev) => [created, ...prev]);
    setLastSyncTime(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const handleGradeSubmission = (submissionId: string, score: number, feedback: string) => {
    let targetStudentId = '';
    let targetWeek = 0;

    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id !== submissionId) return sub;
        targetStudentId = sub.studentId;
        targetWeek = sub.week;
        return {
          ...sub,
          status: 'graded',
          score,
          feedback,
        };
      })
    );

    // Also update student's score in the gradebook automatically!
    if (targetStudentId && targetWeek) {
      updateStudentScore(targetStudentId, targetWeek, score);
    }
  };

  const handleExportExcelAll = () => {
    exportStudentsToExcel(students, 'ม6_5_ม6_6');
  };

  const atRiskCount = students.filter((s) => checkIsStudentAtRisk(s).isAtRisk).length;
  const pendingSubmissionsCount = submissions.filter((s) => s.status === 'pending').length;

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900">
      
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        atRiskCount={atRiskCount}
        pendingSubmissionsCount={pendingSubmissionsCount}
        lastSyncTime={lastSyncTime}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
        onExportExcel={handleExportExcelAll}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Role: Teacher */}
        {currentRole === 'teacher' && (
          <>
            {activeTab === 'gradebook' && (
              <TeacherGradeBook
                students={students}
                onUpdateScore={updateStudentScore}
                onSelectStudent={(st) => setSelectedStudentForModal(st)}
                onAddStudent={handleAddStudent}
                onExportExcel={handleExportExcelAll}
              />
            )}

            {activeTab === 'risk_alert' && (
              <RiskAlertPanel
                students={students}
                onSelectStudent={(st) => setSelectedStudentForModal(st)}
              />
            )}

            {activeTab === 'submissions' && (
              <SubmissionManagement
                submissions={submissions}
                students={students}
                onGradeSubmission={handleGradeSubmission}
              />
            )}
          </>
        )}

        {/* Role: Student */}
        {currentRole === 'student' && (
          <StudentPortal
            students={students}
            submissions={submissions}
            onSubmitWork={handleStudentSubmitWork}
          />
        )}

        {/* Role: Executive */}
        {currentRole === 'executive' && (
          <ExecutiveDashboard
            students={students}
            onExportExcel={handleExportExcelAll}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-6 border-t border-stone-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Hammer className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-stone-300">
              WoodCraft GradePro — ระบบตัดเกรดและประเมินผลวิชางานไม้ ม.6 (ม.6/5, ม.6/6)
            </span>
            <span className="hidden sm:inline text-amber-400 font-medium">
              (ครูผู้สอน: นายภูธนะ วงษ์บุญตรี)
            </span>
          </div>
          <div className="flex items-center gap-4 text-stone-500">
            <span>มาตรฐานหลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Cloud Secured (AES-256)
            </span>
          </div>
        </div>
      </footer>

      {/* Deep-Dive Student Detail Modal */}
      {selectedStudentForModal && (
        <StudentDetailModal
          student={selectedStudentForModal}
          onClose={() => setSelectedStudentForModal(null)}
          onAddIntervention={handleAddIntervention}
          onUpdateScore={updateStudentScore}
        />
      )}

      {/* Cloud Sync & Backup Modal */}
      <CloudSyncModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        students={students}
        submissions={submissions}
        lastSyncTime={lastSyncTime}
        onTriggerSync={() => {
          setLastSyncTime(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }}
        onRestoreData={(importedStds, importedSubs) => {
          setStudents(importedStds);
          setSubmissions(importedSubs);
        }}
        onResetData={() => {
          setStudents(INITIAL_STUDENTS);
          setSubmissions(INITIAL_SUBMISSIONS);
        }}
      />
    </div>
  );
}
