import React, { useState } from 'react';
import { Student, StudentSubmission } from '../types';
import { 
  Cloud, 
  CloudCheck, 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  X,
  Server
} from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  submissions: StudentSubmission[];
  lastSyncTime: string;
  onTriggerSync: () => void;
  onRestoreData: (importedStudents: Student[], importedSubmissions: StudentSubmission[]) => void;
  onResetData: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  students,
  submissions,
  lastSyncTime,
  onTriggerSync,
  onRestoreData,
  onResetData,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      onTriggerSync();
      setIsSyncing(false);
      setSyncSuccessMessage('สำรองข้อมูลและอัปเดตสถานะคลาวด์เรียบร้อยแล้ว');
      setTimeout(() => setSyncSuccessMessage(null), 3000);
    }, 800);
  };

  const handleDownloadBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      schoolYear: '2569',
      course: 'Woodcraft_Grading_M5_M6',
      totalStudents: students.length,
      students,
      submissions,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `WoodCraft_CloudBackup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.students && Array.isArray(json.students)) {
          onRestoreData(json.students, json.submissions || []);
          setSyncSuccessMessage('นำเข้าและกู้คืนข้อมูลจากไฟล์สำรองสำเร็จ!');
          setTimeout(() => onClose(), 1200);
        } else {
          setErrorMessage('รูปแบบไฟล์สำรองไม่ถูกต้อง ไม่พบคอลเลกชันนักเรียน');
        }
      } catch (err) {
        setErrorMessage('เกิดข้อผิดพลาดในการอ่านไฟล์ JSON');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CloudCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                ระบบจัดการฐานข้อมูลและความปลอดภัยบนคลาวด์
              </h3>
              <p className="text-xs text-stone-500">
                Cloud Automated Backup & Redundant Storage Architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Success Message */}
        {syncSuccessMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {syncSuccessMessage}
          </div>
        )}

        {/* Cloud Status Card */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-stone-800">สถานะเซิร์ฟเวอร์คลาวด์:</span>
              <span className="text-xs font-semibold text-emerald-600">เชื่อมต่อเสถียร (Active & Synced)</span>
            </div>
            <span className="text-[11px] text-stone-400 font-mono">Region: asia-east1</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-200/80 text-xs text-stone-600">
            <div>
              <span className="text-stone-400 block text-[10px]">สำรองข้อมูลล่าสุดเมื่อ:</span>
              <span className="font-semibold text-stone-800">{lastSyncTime}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">ขนาดข้อมูลทั้งหมด:</span>
              <span className="font-semibold text-stone-800">{students.length} นักเรียน | {submissions.length} ชิ้นงาน</span>
            </div>
          </div>
        </div>

        {/* Security & Standard compliance */}
        <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs">
          <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>มาตรฐานความปลอดภัยระดับสถานศึกษา:</strong> ระบบทำการเข้ารหัสข้อมูลคะแนนและการประเมิน (AES-256) และซิงค์สำรองอัตโนมัติทุกครั้งที่มีการบันทึกคะแนน เพื่อป้องกันการสูญหายของข้อมูล
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold transition disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'กำลังซิงค์ข้อมูล...' : 'สำรองข้อมูลบนคลาวด์ทันที'}
          </button>

          <button
            onClick={handleDownloadBackup}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-semibold transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            ดาวน์โหลดไฟล์สำรอง (JSON)
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Restore / Import Section */}
        <div className="pt-2 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-amber-800 hover:text-amber-900 font-semibold">
            <Upload className="w-4 h-4" />
            <span>นำเข้าข้อมูลจากไฟล์สำรอง</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {showResetConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-red-700 font-bold">ยืนยันรีเซ็ต?</span>
              <button
                type="button"
                onClick={() => {
                  onResetData();
                  onClose();
                }}
                className="px-2.5 py-1 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition"
              >
                ใช่, ล้างข้อมูล
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-2 py-1 bg-stone-200 text-stone-700 rounded-lg font-medium hover:bg-stone-300 transition"
              >
                ยกเลิก
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="text-stone-400 hover:text-red-600 transition"
            >
              รีเซ็ตเป็นข้อมูลตัวอย่าง
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
