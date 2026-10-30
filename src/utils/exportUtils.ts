import * as XLSX from 'xlsx';
import { Student } from '../types';
import { calculateStudentGrade } from './gradeCalculator';
import { WOODWORKING_CURRICULUM } from '../data/woodworkingCurriculum';

export function exportStudentsToExcel(students: Student[], classTitle: string = 'รวมทุกห้อง') {
  const rows = students.map((std, index) => {
    const gradeRes = calculateStudentGrade(std);
    
    // Base row info
    const rowObj: Record<string, string | number> = {
      'ลำดับ': index + 1,
      'รหัสนักเรียน': std.studentCode,
      'ชื่อ - นามสกุล': std.name,
      'ระดับชั้น': std.gradeLevel,
      'ห้องเรียน': std.classRoom,
    };

    // 20-week scores
    for (let w = 1; w <= 20; w++) {
      const score = std.scores[w];
      const headerKey = w === 10 
        ? 'สัปดาห์ 10 (กลางภาค 10)' 
        : w === 20 
          ? 'สัปดาห์ 20 (ปลายภาค 20)' 
          : `สัปดาห์ ${w} (5)`;
      rowObj[headerKey] = score !== null && score !== undefined ? score : '-';
    }

    // Results
    rowObj['รวมคะแนนดิบ (120)'] = gradeRes.rawTotal;
    rowObj['คะแนนรวมสุทธิ (100)'] = gradeRes.normalized100;
    rowObj['เกรดที่ได้'] = gradeRes.grade.toFixed(1);
    rowObj['ผลการประเมิน'] = gradeRes.gradeLabel;
    rowObj['สถานะผู้เรียน'] = gradeRes.status === 'at_risk' ? 'เฝ้าระวัง/มีภาวะเสี่ยง' : 'ปกติ/ผ่านเกณฑ์';

    return rowObj;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  const colWidths = [
    { wch: 6 },  // ลำดับ
    { wch: 12 }, // รหัส
    { wch: 28 }, // ชื่อ
    { wch: 10 }, // ระดับ
    { wch: 10 }, // ห้อง
    // 20 weeks
    ...Array(20).fill({ wch: 12 }),
    { wch: 18 }, // รวมดิบ
    { wch: 18 }, // สุทธิ
    { wch: 12 }, // เกรด
    { wch: 24 }, // ผลการประเมิน
    { wch: 20 }, // สถานะ
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'สมุดคะแนน_งานไม้');

  const fileName = `สมุดบันทึกคะแนนวิชางานไม้_${classTitle.replace('/', '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function printStudentReportCard(student: Student) {
  const gradeRes = calculateStudentGrade(student);
  
  // Use a dedicated hidden iframe to avoid popup blocker issues and window.open iframe restrictions
  let printIframe = document.getElementById('woodcraft-print-iframe') as HTMLIFrameElement;
  if (!printIframe) {
    printIframe = document.createElement('iframe');
    printIframe.id = 'woodcraft-print-iframe';
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = 'none';
    printIframe.style.visibility = 'hidden';
    document.body.appendChild(printIframe);
  }

  const curriculumRows = WOODWORKING_CURRICULUM.map((item) => {
    const score = student.scores[item.week];
    const scoreDisplay = score !== null && score !== undefined ? score : '<span style="color:#dc2626;">ยังไม่บันทึก</span>';
    const percent = score !== null && score !== undefined ? Math.round((score / item.maxScore) * 100) + '%' : '-';
    const isExamStyle = item.isExam ? 'background-color: #fef3c7; font-weight: bold;' : '';
    return `
      <tr style="${isExamStyle}">
        <td style="text-align:center; padding: 6px; border: 1px solid #d1d5db;">สัปดาห์ที่ ${item.week}</td>
        <td style="padding: 6px; border: 1px solid #d1d5db;">
          <strong>${item.title}</strong>
          <div style="font-size: 11px; color: #6b7280;">หมวด: ${item.categoryLabel}</div>
        </td>
        <td style="text-align:center; padding: 6px; border: 1px solid #d1d5db;">${item.maxScore}</td>
        <td style="text-align:center; padding: 6px; border: 1px solid #d1d5db; font-weight: bold;">${scoreDisplay}</td>
        <td style="text-align:center; padding: 6px; border: 1px solid #d1d5db;">${percent}</td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="utf-8">
      <title>ใบรายงานผลการเรียนวิชางานไม้ - ${student.name}</title>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Sarabun', sans-serif;
          color: #1f2937;
          margin: 0;
          padding: 24px;
          background: #fff;
          font-size: 13px;
          line-height: 1.4;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none !important; }
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #854d0e;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .header h1 {
          font-size: 20px;
          margin: 0 0 4px 0;
          color: #78350f;
        }
        .header h2 {
          font-size: 15px;
          font-weight: normal;
          margin: 0;
          color: #4b5563;
        }
        .info-box {
          display: flex;
          justify-content: space-between;
          background: #fffbeb;
          border: 1px solid #fde68a;
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 16px;
        }
        .grade-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .stat-card {
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          border-radius: 6px;
          padding: 10px;
          text-align: center;
        }
        .stat-card .val {
          font-size: 22px;
          font-weight: bold;
          color: #92400e;
        }
        .stat-card .lbl {
          font-size: 12px;
          color: #6b7280;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        th {
          background-color: #f3f4f6;
          padding: 8px;
          border: 1px solid #d1d5db;
          font-weight: bold;
        }
        .signatures {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
          text-align: center;
        }
        .sign-block {
          width: 200px;
        }
        .sign-line {
          border-bottom: 1px dotted #9ca3af;
          height: 40px;
          margin-bottom: 6px;
        }
        .btn-print {
          background: #b45309;
          color: #fff;
          border: none;
          padding: 8px 16px;
          font-size: 14px;
          font-family: inherit;
          cursor: pointer;
          border-radius: 6px;
          margin-bottom: 16px;
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 12px;">
        <button class="btn-print" onclick="window.print()">🖨️ สั่งพิมพ์เอกสาร / บันทึกเป็น PDF</button>
      </div>

      <div class="header">
        <h1>กลุ่มสาระการเรียนรู้การงานอาชีพและเทคโนโลยี</h1>
        <h2>ใบรายงานผลสัมฤทธิ์ทางการเรียนรายบุคคล: รายวิชางานไม้และเครื่องเรือน (มัธยมศึกษาปีที่ 5 - 6)</h2>
      </div>

      <div class="info-box">
        <div>
          <div><strong>ชื่อ-สกุล นักเรียน:</strong> ${student.name}</div>
          <div><strong>รหัสประจำตัว:</strong> ${student.studentCode}</div>
          <div><strong>ครูผู้สอน:</strong> นายภูธนะ วงษ์บุญตรี</div>
        </div>
        <div>
          <div><strong>ระดับชั้น:</strong> ${student.gradeLevel} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>ห้องเรียน:</strong> ${student.classRoom}</div>
          <div><strong>ภาคเรียนที่:</strong> 1 / 2569</div>
          <div><strong>กลุ่มสาระฯ:</strong> การงานอาชีพ (งานไม้และเครื่องเรือน)</div>
        </div>
      </div>

      <div class="grade-summary">
        <div class="stat-card">
          <div class="val">${gradeRes.grade.toFixed(1)}</div>
          <div class="lbl">เกรดเฉลี่ย (GPA)</div>
        </div>
        <div class="stat-card">
          <div class="val">${gradeRes.normalized100} / 100</div>
          <div class="lbl">คะแนนรวมสุทธิ</div>
        </div>
        <div class="stat-card">
          <div class="val">${gradeRes.completedAssignmentsCount} / 20</div>
          <div class="lbl">ภาระงานที่ส่งแล้ว</div>
        </div>
        <div class="stat-card">
          <div class="val" style="font-size: 16px; padding-top: 4px;">${gradeRes.gradeLabel}</div>
          <div class="lbl">ผลการประเมิน</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 12%;">สัปดาห์</th>
            <th style="width: 50%;">สาระการเรียนรู้และชิ้นงาน</th>
            <th style="width: 12%;">คะแนนเต็ม</th>
            <th style="width: 13%;">คะแนนที่ได้</th>
            <th style="width: 13%;">ร้อยละ (%)</th>
          </tr>
        </thead>
        <tbody>
          ${curriculumRows}
        </tbody>
      </table>

      ${
        student.interventions.length > 0 
        ? `
          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 6px; margin-bottom: 24px;">
            <strong style="color: #991b1b;">บันทึกการส่งเสริมและพัฒนาการเรียนรู้ (Intervention):</strong>
            ${student.interventions.map(int => `
              <div style="margin-top: 6px; font-size: 12px;">
                • วันที่ ${int.date}: ${int.reason} - บันทึกครู: ${int.teacherNote}
              </div>
            `).join('')}
          </div>
        ` 
        : ''
      }

      <div class="signatures">
        <div class="sign-block">
          <div class="sign-line"></div>
          <div>(นายภูธนะ วงษ์บุญตรี)</div>
          <div>ครูผู้สอนประจำวิชางานไม้</div>
        </div>
        <div class="sign-block">
          <div class="sign-line"></div>
          <div>(...................................................)</div>
          <div>หัวหน้ากลุ่มสาระการเรียนรู้</div>
        </div>
        <div class="sign-block">
          <div class="sign-line"></div>
          <div>(...................................................)</div>
          <div>ผู้อำนวยการสถานศึกษา</div>
        </div>
      </div>
    </body>
    </html>
  `;

  const iframeDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
  if (!iframeDoc) return;

  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  setTimeout(() => {
    try {
      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();
    } catch (e) {
      console.warn('Iframe print fallback triggered', e);
    }
  }, 350);
}
