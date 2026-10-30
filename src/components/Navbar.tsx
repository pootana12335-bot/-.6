import React from 'react';
import { 
  Hammer, 
  GraduationCap, 
  BarChart3, 
  UserCheck, 
  Cloud, 
  CloudCheck, 
  AlertTriangle, 
  Inbox, 
  FileSpreadsheet
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  atRiskCount: number;
  pendingSubmissionsCount: number;
  lastSyncTime: string;
  onOpenCloudModal: () => void;
  onExportExcel: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  setCurrentRole,
  activeTab,
  setActiveTab,
  atRiskCount,
  pendingSubmissionsCount,
  lastSyncTime,
  onOpenCloudModal,
  onExportExcel,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-lg">
      {/* Top Banner: App Title & Role Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-md border border-amber-500/30 text-white">
              <Hammer className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-amber-100">WoodCraft GradePro</span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                  ชั้น ม.6 (ม.6/5, ม.6/6)
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden md:block">
                ระบบบันทึกคะแนน ตัดเกรดอัตโนมัติ และติดตามพัฒนาการวิชางานไม้ (20 สัปดาห์)
              </p>
            </div>
          </div>

          {/* Cloud Sync & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cloud Sync Status Button */}
            <button
              onClick={onOpenCloudModal}
              title="ตรวจสอบสถานะฐานข้อมูลคลาวด์และการสำรองข้อมูล"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700/80 border border-stone-700 text-stone-300 text-xs transition"
            >
              <div className="relative flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 relative"></span>
              </div>
              <CloudCheck className="w-3.5 h-3.5 text-emerald-400 hidden sm:inline" />
              <span className="hidden lg:inline text-stone-400">คลาวด์:</span>
              <span className="text-emerald-400 font-medium">สำรองข้อมูลแล้ว</span>
            </button>

            {/* Role Switcher Pill */}
            <div className="flex bg-stone-800 p-1 rounded-xl border border-stone-700">
              <button
                onClick={() => {
                  setCurrentRole('teacher');
                  setActiveTab('gradebook');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentRole === 'teacher'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">โหมด</span>ครูผู้สอน
              </button>

              <button
                onClick={() => {
                  setCurrentRole('student');
                  setActiveTab('student_view');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentRole === 'student'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">มุมมอง</span>นักเรียน
              </button>

              <button
                onClick={() => {
                  setCurrentRole('executive');
                  setActiveTab('executive');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentRole === 'executive'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">แดชบอร์ด</span>ผู้บริหาร
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Navigation for Teacher Mode */}
        {currentRole === 'teacher' && (
          <div className="flex items-center justify-between border-t border-stone-800/80 py-2 overflow-x-auto text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab('gradebook')}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm flex items-center gap-1.5 transition ${
                  activeTab === 'gradebook'
                    ? 'bg-stone-800 text-amber-400 border border-amber-500/40'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                สมุดบันทึกคะแนน 20 สัปดาห์
              </button>

              <button
                onClick={() => setActiveTab('risk_alert')}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm flex items-center gap-1.5 transition relative ${
                  activeTab === 'risk_alert'
                    ? 'bg-stone-800 text-red-400 border border-red-500/40'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-red-400" />
                แจ้งเตือนกลุ่มเสี่ยง
                {atRiskCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] bg-red-600 text-white rounded-full font-bold">
                    {atRiskCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('submissions')}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm flex items-center gap-1.5 transition relative ${
                  activeTab === 'submissions'
                    ? 'bg-stone-800 text-amber-400 border border-amber-500/40'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Inbox className="w-4 h-4" />
                ตรวจชิ้นงานออนไลน์
                {pendingSubmissionsCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] bg-amber-500 text-stone-950 rounded-full font-bold">
                    {pendingSubmissionsCount}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-800 border border-stone-700/80 text-xs text-amber-200">
                <span className="text-stone-400">ครูผู้สอน:</span>
                <span className="font-semibold text-white">นายภูธนะ วงษ์บุญตรี</span>
              </div>
              <button
                onClick={onExportExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                ส่งออก Excel
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
