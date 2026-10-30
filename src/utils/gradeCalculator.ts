import { Student, GradeResult, ClassStatistics } from '../types';
import { WOODWORKING_CURRICULUM } from '../data/woodworkingCurriculum';

export const TOTAL_RAW_POINTS = WOODWORKING_CURRICULUM.reduce((sum, item) => sum + item.maxScore, 0); // 130

export function calculateStudentGrade(student: Student): GradeResult {
  let rawTotal = 0;
  let maxPossibleSoFar = 0;
  let missingCount = 0;
  let completedCount = 0;

  // Calculate weighted parts
  let regularScoreSum = 0; // out of 90
  let regularMaxEvaluated = 0;
  let midtermScore: number | null = null;
  let finalScore: number | null = null;

  WOODWORKING_CURRICULUM.forEach((curr) => {
    const score = student.scores[curr.week];
    if (score !== null && score !== undefined) {
      rawTotal += score;
      maxPossibleSoFar += curr.maxScore;
      completedCount++;

      if (curr.isExam === 'midterm') {
        midtermScore = score;
      } else if (curr.isExam === 'final') {
        finalScore = score;
      } else {
        regularScoreSum += score;
        regularMaxEvaluated += curr.maxScore;
      }
    } else {
      missingCount++;
    }
  });

  // Calculate standard 100-point normalized score:
  // Coursework (18 weeks): 70% of total
  // Midterm (Week 10): 10% of total (เต็ม 10 คะแนน)
  // Final (Week 20): 20% of total (เต็ม 20 คะแนน)
  // รวม 70 + 10 + 20 = 100%
  let normalized100 = 0;
  
  const courseworkWeight = 70;
  const midtermWeight = 10;
  const finalWeight = 20;

  const courseworkPoints = regularMaxEvaluated > 0 
    ? (regularScoreSum / 90) * courseworkWeight 
    : 0;
    
  const midtermPoints = midtermScore !== null 
    ? (midtermScore / 10) * midtermWeight 
    : 0;
    
  const finalPoints = finalScore !== null 
    ? (finalScore / 20) * finalWeight 
    : 0;

  normalized100 = Math.min(100, Math.round((courseworkPoints + midtermPoints + finalPoints) * 10) / 10);

  // Grade mapping (Thai National Education Curriculum)
  let grade = 0;
  let gradeLabel = 'ปรับปรุง (ไม่ผ่านเกณฑ์)';
  let status: GradeResult['status'] = 'at_risk';

  if (normalized100 >= 80) {
    grade = 4.0;
    gradeLabel = 'ดีเยี่ยม (Excellent)';
    status = 'excellent';
  } else if (normalized100 >= 75) {
    grade = 3.5;
    gradeLabel = 'ดีมาก (Very Good)';
    status = 'excellent';
  } else if (normalized100 >= 70) {
    grade = 3.0;
    gradeLabel = 'ดี (Good)';
    status = 'good';
  } else if (normalized100 >= 65) {
    grade = 2.5;
    gradeLabel = 'ค่อนข้างดี (Fairly Good)';
    status = 'good';
  } else if (normalized100 >= 60) {
    grade = 2.0;
    gradeLabel = 'ปานกลาง (Moderate)';
    status = 'pass';
  } else if (normalized100 >= 55) {
    grade = 1.5;
    gradeLabel = 'พอใช้ (Fair)';
    status = 'pass';
  } else if (normalized100 >= 50) {
    grade = 1.0;
    gradeLabel = 'ผ่านเกณฑ์ขั้นต่ำ (Pass)';
    status = 'pass';
  } else {
    grade = 0;
    gradeLabel = 'ต่ำกว่าเกณฑ์ (Needs Improvement)';
    status = 'at_risk';
  }

  const progressPercent = Math.round((completedCount / WOODWORKING_CURRICULUM.length) * 100);

  return {
    rawTotal: Math.round(rawTotal * 10) / 10,
    maxPossibleSoFar,
    normalized100,
    grade,
    gradeLabel,
    status,
    missingAssignmentsCount: missingCount,
    completedAssignmentsCount: completedCount,
    progressPercent,
  };
}

export function checkIsStudentAtRisk(student: Student): { isAtRisk: boolean; reasons: string[]; severity: 'high' | 'medium' | 'low' } {
  const result = calculateStudentGrade(student);
  const reasons: string[] = [];
  
  if (result.normalized100 < 50 && result.completedAssignmentsCount >= 5) {
    reasons.push(`คะแนนรวมปัจจุบัน ${result.normalized100} คะแนน ต่ำกว่าเกณฑ์มาตรฐาน 50 คะแนน (เกรด 0)`);
  }

  // Check consecutive missing scores in recent 3 evaluated weeks
  let consecutiveMissing = 0;
  for (let w = 1; w <= 20; w++) {
    const sc = student.scores[w];
    if (sc === null || sc === undefined) {
      consecutiveMissing++;
    } else {
      consecutiveMissing = 0;
    }
  }

  if (consecutiveMissing >= 2) {
    reasons.push(`ค้างส่งงานติดต่อกัน ${consecutiveMissing} สัปดาห์`);
  }

  // Midterm fail check (เต็ม 10 คะแนน, ต่ำกว่า 5 คะแนนถือว่าเสี่ยง)
  const midtermScore = student.scores[10];
  if (midtermScore !== null && midtermScore < 5) {
    reasons.push(`คะแนนสอบกลางภาค (${midtermScore}/10) ต่ำกว่ากึ่งหนึ่ง`);
  }

  // Trend decline check
  const recentValidScores: number[] = [];
  for (let w = 1; w <= 20; w++) {
    const sc = student.scores[w];
    if (sc !== null && sc !== undefined && WOODWORKING_CURRICULUM[w - 1].maxScore === 5) {
      recentValidScores.push(sc);
    }
  }

  if (recentValidScores.length >= 4) {
    const last2 = (recentValidScores[recentValidScores.length - 1] + recentValidScores[recentValidScores.length - 2]) / 2;
    const prev2 = (recentValidScores[recentValidScores.length - 3] + recentValidScores[recentValidScores.length - 4]) / 2;
    if (prev2 >= 4 && last2 <= 2.5) {
      reasons.push('แนวโน้มผลการเรียนและทักษะช่างไม้ลดลงอย่างมีนัยสำคัญในระยะหลัง');
    }
  }

  const isAtRisk = reasons.length > 0;
  const severity = reasons.length >= 2 || result.normalized100 < 45 ? 'high' : reasons.length === 1 ? 'medium' : 'low';

  return { isAtRisk, reasons, severity };
}

export function computeClassStatistics(students: Student[]): ClassStatistics {
  if (students.length === 0) {
    return {
      studentCount: 0,
      averageScore: 0,
      averageGrade: 0,
      highestScore: 0,
      lowestScore: 0,
      passingRate: 0,
      atRiskCount: 0,
      gradeCounts: {},
      categoryAverages: {},
    };
  }

  let totalNorm = 0;
  let totalGrade = 0;
  let highest = -1;
  let lowest = 999;
  let passCount = 0;
  let atRiskCount = 0;

  const gradeCounts: Record<string, number> = {
    '4.0': 0,
    '3.5': 0,
    '3.0': 0,
    '2.5': 0,
    '2.0': 0,
    '1.5': 0,
    '1.0': 0,
    '0': 0,
  };

  const categoryTotals: Record<string, { sum: number; count: number }> = {};

  students.forEach((s) => {
    const res = calculateStudentGrade(s);
    totalNorm += res.normalized100;
    totalGrade += res.grade;
    if (res.normalized100 > highest) highest = res.normalized100;
    if (res.normalized100 < lowest) lowest = res.normalized100;
    if (res.grade >= 1.0) passCount++;

    const gradeKey = res.grade.toFixed(1).replace('.0', res.grade === 0 ? '0' : '.0');
    if (gradeCounts[gradeKey] !== undefined) {
      gradeCounts[gradeKey]++;
    } else if (res.grade === 0) {
      gradeCounts['0']++;
    }

    const risk = checkIsStudentAtRisk(s);
    if (risk.isAtRisk) atRiskCount++;

    // Compute category performance
    WOODWORKING_CURRICULUM.forEach((c) => {
      const sc = s.scores[c.week];
      if (sc !== null && sc !== undefined) {
        if (!categoryTotals[c.categoryLabel]) {
          categoryTotals[c.categoryLabel] = { sum: 0, count: 0 };
        }
        categoryTotals[c.categoryLabel].sum += (sc / c.maxScore) * 100;
        categoryTotals[c.categoryLabel].count += 1;
      }
    });
  });

  const categoryAverages: Record<string, number> = {};
  Object.keys(categoryTotals).forEach((key) => {
    const item = categoryTotals[key];
    categoryAverages[key] = item.count > 0 ? Math.round((item.sum / item.count) * 10) / 10 : 0;
  });

  return {
    studentCount: students.length,
    averageScore: Math.round((totalNorm / students.length) * 10) / 10,
    averageGrade: Math.round((totalGrade / students.length) * 100) / 100,
    highestScore: highest === -1 ? 0 : highest,
    lowestScore: lowest === 999 ? 0 : lowest,
    passingRate: Math.round((passCount / students.length) * 1000) / 10,
    atRiskCount,
    gradeCounts,
    categoryAverages,
  };
}

export function getStudentLearningTrend(student: Student) {
  return WOODWORKING_CURRICULUM.map((item) => {
    const score = student.scores[item.week];
    const percent = score !== null && score !== undefined 
      ? Math.round((score / item.maxScore) * 100) 
      : null;
    return {
      week: item.week,
      title: item.title,
      maxScore: item.maxScore,
      score,
      percent,
      isExam: item.isExam,
      categoryLabel: item.categoryLabel,
    };
  });
}
