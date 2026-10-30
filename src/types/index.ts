export type GradeLevel = 'ม.6';
export type ClassRoom = 'ม.6/5' | 'ม.6/6';

export type UserRole = 'teacher' | 'student' | 'executive';

export type WorkCategory = 
  | 'safety'       // ความปลอดภัยและเครื่องมือ
  | 'joinery'      // การเข้าไม้และโครงสร้าง
  | 'cutting'      // การวัด ตัด เลื่อย ไส เจาะ
  | 'project'      // การประดิษฐ์ชิ้นงาน
  | 'finishing'    // การขัดแต่งและเคลือบผิว
  | 'exam';        // สอบกลางภาคและปลายภาค

export interface WeekCurriculum {
  week: number;
  title: string;
  category: WorkCategory;
  categoryLabel: string;
  description: string;
  maxScore: number;
  isExam?: 'midterm' | 'final';
  rubric: {
    criteria: string;
    weight: string;
  }[];
}

export interface StudentSubmission {
  id: string;
  studentId: string;
  week: number;
  workTitle: string;
  submittedAt: string;
  imageUrl?: string;
  notes: string;
  status: 'pending' | 'graded' | 'revision';
  score?: number;
  feedback?: string;
}

export interface InterventionRecord {
  id: string;
  date: string;
  reason: string;
  actionTaken: string;
  resultStatus: 'in_progress' | 'resolved' | 'monitoring';
  teacherNote: string;
}

export interface Student {
  id: string;
  studentCode: string; // เช่น 54321
  name: string;
  classRoom: ClassRoom;
  gradeLevel: GradeLevel;
  avatarUrl?: string;
  gender: 'ชาย' | 'หญิง';
  // 20-week scores: week1 to week20 (week 10 = midterm, week 20 = final)
  scores: Record<number, number | null>;
  notes?: string;
  interventions: InterventionRecord[];
}

export interface GradeResult {
  rawTotal: number;         // ผลรวมคะแนนดิบที่ได้
  maxPossibleSoFar: number; // คะแนนเต็มสูงสุดจนถึงสัปดาห์ปัจจุบัน
  normalized100: number;    // คะแนนเต็มปรับฐาน 100
  grade: number;            // เกรด 0 - 4.0
  gradeLabel: string;       // ดีเยี่ยม, ดีมาก, ดี, ผ่านเกณฑ์, ปรับปรุง
  status: 'excellent' | 'good' | 'pass' | 'at_risk';
  missingAssignmentsCount: number;
  completedAssignmentsCount: number;
  progressPercent: number;
}

export interface ClassStatistics {
  studentCount: number;
  averageScore: number;
  averageGrade: number;
  highestScore: number;
  lowestScore: number;
  passingRate: number;
  atRiskCount: number;
  gradeCounts: Record<string, number>;
  categoryAverages: Record<string, number>;
}
