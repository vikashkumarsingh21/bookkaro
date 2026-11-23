'use client';

import React, { useState } from 'react';
import {
  Plus,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import { useProviderPortal } from '@/context/ProviderPortalContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { DaySchedule } from '@/data/mockProviderPortalData';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

export default function ProviderPortalServicesPage() {
  const { currentWorkspace } = useWorkspace();
  const isStaff = currentWorkspace === 'PARTNER_STAFF';

  const {
    activeMerchant,
    services,
    toggleServiceActive,
    addService,
    weeklySchedule,
    updateWeeklySchedule,
    branches,
    branchStaff,
    addBranchStaff,
    toggleStaffStatus,
  } = useProviderPortal();

  // Add Service Modal
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState<number>(4500);
  const [newServiceDuration, setNewServiceDuration] = useState<number>(60);
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // Add Staff Modal
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffBranch, setStaffBranch] = useState(branches[0]?.branchName || 'South Gandhi Maidan Executive Wing');

  // Schedule editing state
  const [scheduleState, setScheduleState] = useState<DaySchedule[]>(weeklySchedule);
  const [scheduleSavedToast, setScheduleSavedToast] = useState(false);

  // If role is PARTNER_STAFF, render owner access guard
  if (isStaff) {
    return (
      <div className="py-12 max-w-2xl mx-auto space-y-6">
        <div className="p-8 rounded-[10px] bg-white border border-[#E5DDD2] text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-lg bg-[#FAF1EB] border border-[#F3DEC9] flex items-center justify-center text-[#9C421C] mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#9C421C]">
              Role Access Boundary
            </div>
            <h1 className="font-[var(--font-partner-display)] font-bold text-2xl text-[#141413] tracking-tight mt-1">
              Restricted to Partner Owner
            </h1>
            <p className="text-xs sm:text-sm text-[#52524E] mt-2 max-w-md mx-auto leading-relaxed">
              Your active session is running with <strong>PARTNER_STAFF</strong> privileges. Front-desk staff access is restricted to guest roster arrivals, slot acceptance, and 4-digit Venue PIN verification.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#F6F3EE] border border-[#E5DDD2] text-xs text-[#52524E] text-left space-y-1.5">
            <div className="font-bold text-[#141413]">Owner-Only Capabilities on this page:</div>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>Creating, pricing, and pausing bookable hospitality packages</li>
              <li>Setting weekly operating hours and booking slot intervals</li>
              <li>Provisioning staff seats and managing front-desk permissions</li>
            </ul>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <Button
              href="/provider-portal/bookings"
              variant="outline"
              className="bg-[#9C421C] text-white hover:bg-[#7F3516] border-none font-bold text-xs min-h-[44px] px-5 rounded-lg shadow-xs"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Go to Incoming Queue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Add Service Submit
  const handleAddServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    addService({
      name: newServiceName.trim(),
      category: activeMerchant.category,
      priceInr: Number(newServicePrice) || 2500,
      durationMinutes: Number(newServiceDuration) || 60,
      description: newServiceDesc.trim() || 'Custom hospitality package for guest bookings.',
      isActive: true,
      depositRequired: false,
    });

    setIsAddServiceModalOpen(false);
    setNewServiceName('');
    setNewServiceDesc('');
  };

  // Handle Add Staff Submit
  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim()) return;

    addBranchStaff({
      name: staffName.trim(),
      email: staffEmail.trim() || `${staffName.toLowerCase().replace(/\s+/g, '.')}@hotelmaurya.com`,
      phone: staffPhone.trim() || '+91 94310 00000',
      assignedBranch: staffBranch,
      role: 'PARTNER_STAFF',
      status: 'ACTIVE',
    });

    setIsAddStaffModalOpen(false);
    setStaffName('');
    setStaffEmail('');
    setStaffPhone('');
  };

  // Toggle Day Open
  const handleToggleDay = (dayIndex: number) => {
    setScheduleState((prev) =>
      prev.map((d, idx) => (idx === dayIndex ? { ...d, isOpen: !d.isOpen } : d))
    );
  };

  // Save Schedule
  const handleSaveSchedule = () => {
    updateWeeklySchedule(scheduleState);
    setScheduleSavedToast(true);
    setTimeout(() => setScheduleSavedToast(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#52524E]">
            <span className="w-2 h-2 rounded-full bg-[#21503A]" />
            <span>Packages, Staff &amp; Operating Hours (Owner Mode)</span>
          </div>
          <h1 className="font-[var(--font-partner-display)] font-bold text-2xl sm:text-3xl text-[#141413] tracking-tight mt-1">
            Services, Schedule &amp; Staff
          </h1>
          <p className="text-xs sm:text-sm text-[#52524E] mt-0.5">
            Configure hospitality packages, manage front-desk staff accounts, and adjust venue operating hours.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-[#E5DDD2] bg-white text-[#141413] hover:border-[#9C421C] font-bold text-xs min-h-[44px] px-4 rounded-lg"
            onClick={() => setIsAddStaffModalOpen(true)}
            leftIcon={<UserPlus className="w-3.5 h-3.5 text-[#9C421C]" />}
          >
            Add Branch Staff
          </Button>
          <Button
            variant="outline"
            className="bg-[#9C421C] text-white hover:bg-[#7F3516] border-none font-bold text-xs min-h-[44px] px-5 rounded-lg shadow-xs"
            onClick={() => setIsAddServiceModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Service Package
          </Button>
        </div>
      </div>

      {scheduleSavedToast && (
        <div className="p-3.5 rounded-lg bg-[#EBF1ED] border border-[#CFDFD5] text-[#21503A] text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#21503A]" />
          <span>Weekly schedule updated successfully. Guest booking calendars refreshed in real-time.</span>
        </div>
      )}

      {/* 2. SERVICES & PACKAGES CATALOG */}
      <div className="bg-white rounded-[10px] border border-[#E5DDD2] overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#E5DDD2] flex items-center justify-between">
          <div>
            <h2 className="font-[var(--font-partner-display)] font-bold text-base text-[#141413]">
              Active Hospitality Packages ({services.length})
            </h2>
            <p className="text-xs text-[#52524E] mt-0.5">
              Packages displayed to guests discovering {activeMerchant.name} in {activeMerchant.city}
            </p>
          </div>
          <Badge variant="sand" size="sm">
            {activeMerchant.category.toUpperCase()}
          </Badge>
        </div>

        <div className="divide-y divide-[#E5DDD2]">
          {services.map((srv) => (
            <div
              key={srv.id}
              className={`
                p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors
                ${srv.isActive ? 'hover:bg-[#F6F3EE]/50' : 'bg-[#F6F3EE]/40 opacity-60'}
              `}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-[var(--font-partner-display)] font-bold text-sm text-[#141413]">
                    {srv.name}
                  </h3>
                  <span
                    className={`
                      text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider
                      ${srv.isActive
                        ? 'bg-[#EBF1ED] text-[#21503A] border border-[#CFDFD5]'
                        : 'bg-[#EFEAE2] text-[#52524E] border border-[#E5DDD2]'
                      }
                    `}
                  >
                    {srv.isActive ? 'Active on Roster' : 'Paused'}
                  </span>
                </div>
                <p className="text-xs text-[#52524E] line-clamp-1">
                  {srv.description}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-[#52524E] pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#21503A]" />
                    <span>{srv.durationMinutes >= 60 ? `${srv.durationMinutes / 60}h` : `${srv.durationMinutes}m`} duration</span>
                  </span>
                  <span>•</span>
                  <span>Instant Front-Desk Dispatch</span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5DDD2]">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#52524E] block leading-none">
                    Counter Rate
                  </span>
                  <span className="font-[var(--font-partner-display)] font-bold text-base text-[#141413] tabular-nums">
                    ₹{srv.priceInr.toLocaleString('en-IN')}
                  </span>
                </div>

                <Button
                  variant="outline"
                  className="border-[#E5DDD2] bg-white text-[#141413] hover:border-[#9C421C] font-bold text-xs min-h-[40px] px-3.5 rounded-lg"
                  onClick={() => toggleServiceActive(srv.id)}
                >
                  {srv.isActive ? 'Pause Package' : 'Activate Package'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. BRANCH STAFF ACCESS & CREDENTIALS */}
      <div className="bg-white rounded-[10px] border border-[#E5DDD2] overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#E5DDD2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#21503A]" />
              <h2 className="font-[var(--font-partner-display)] font-bold text-base text-[#141413]">
                Front-Desk Staff Accounts (Role: PARTNER_STAFF)
              </h2>
            </div>
            <p className="text-xs text-[#52524E] mt-0.5">
              Staff accounts have restricted access to arrival queues and 4-digit Venue PIN verification.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="forest-subtle" size="sm">
              Provider ID: BK-PRV-PAT-001
            </Badge>
            <Badge variant="sand" size="sm">
              KYC Approved
            </Badge>
          </div>
        </div>

        <div className="divide-y divide-[#E5DDD2]">
          {branchStaff.map((staff) => (
            <div
              key={staff.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F6F3EE]/50 transition-colors"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-[var(--font-partner-display)] font-bold text-sm text-[#141413]">
                    {staff.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-[#EFEAE2] text-[#52524E] border border-[#E5DDD2]">
                    {staff.role}
                  </span>
                  <span
                    className={`
                      text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider
                      ${staff.status === 'ACTIVE'
                        ? 'bg-[#EBF1ED] text-[#21503A] border border-[#CFDFD5]'
                        : 'bg-[#FCECEC] text-[#942228] border border-[#F5C2C4]'
                      }
                    `}
                  >
                    {staff.status}
                  </span>
                </div>
                <div className="text-xs text-[#52524E] flex items-center gap-3 flex-wrap">
                  <span>{staff.phone}</span>
                  <span>•</span>
                  <span>{staff.email}</span>
                  <span>•</span>
                  <span>Wing: {staff.assignedBranch}</span>
                </div>
                <div className="text-[11px] text-[#52524E]">
                  Added on {staff.addedDate} • Scope: Front-Desk Triage, PIN Check-In Verification
                </div>
              </div>

              <div className="shrink-0">
                <Button
                  variant="outline"
                  className="border-[#E5DDD2] bg-white text-[#141413] hover:border-[#9C421C] font-bold text-xs min-h-[40px] px-3.5 rounded-lg"
                  onClick={() => toggleStaffStatus(staff.id)}
                >
                  {staff.status === 'ACTIVE' ? 'Revoke Access' : 'Reactivate'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. WEEKLY OPERATING HOURS */}
      <div className="bg-white rounded-[10px] border border-[#E5DDD2] p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-[var(--font-partner-display)] font-bold text-base text-[#141413]">
              Weekly Booking Hours ({activeMerchant.city})
            </h2>
            <p className="text-xs text-[#52524E] mt-0.5">
              Set customer booking windows for daily check-in slots and table reservations
            </p>
          </div>
          <Button
            variant="outline"
            className="bg-[#9C421C] text-white hover:bg-[#7F3516] border-none font-bold text-xs min-h-[44px] px-5 rounded-lg shadow-xs"
            onClick={handleSaveSchedule}
          >
            Save Operating Hours
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {scheduleState.map((day, idx) => (
            <div
              key={day.day}
              className={`
                p-4 rounded-lg border transition-all space-y-2
                ${day.isOpen
                  ? 'bg-white border-[#E5DDD2] hover:border-[#9C421C]/40'
                  : 'bg-[#F6F3EE] border-[#E5DDD2] opacity-60'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className="font-[var(--font-partner-display)] font-bold text-xs text-[#141413]">
                  {day.day}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleDay(idx)}
                  className={`
                    px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors
                    ${day.isOpen
                      ? 'bg-[#EBF1ED] text-[#21503A] border border-[#CFDFD5]'
                      : 'bg-[#E5DDD2] text-[#52524E]'
                    }
                  `}
                >
                  {day.isOpen ? 'Open' : 'Closed'}
                </button>
              </div>

              {day.isOpen ? (
                <div className="text-xs text-[#52524E] font-mono">
                  {day.openTime} – {day.closeTime}
                </div>
              ) : (
                <div className="text-xs text-[#52524E] italic">
                  Not accepting bookings
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. ADD NEW SERVICE MODAL */}
      {/* ========================================================= */}
      {isAddServiceModalOpen && (
        <Modal
          isOpen={isAddServiceModalOpen}
          onClose={() => setIsAddServiceModalOpen(false)}
          title="Add New Hospitality Package"
          description={`Create a new bookable package for ${activeMerchant.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleAddServiceSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#141413]">
                Package Title <span className="text-[#9C421C]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Executive Courtyard Suite Stay"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-[#E5DDD2] focus:border-[#9C421C] focus:ring-1 focus:ring-[#9C421C] outline-none text-[#141413] bg-white min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#141413]">
                  Counter Price in INR (₹) <span className="text-[#9C421C]">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(Number(e.target.value))}
                  className="w-full text-xs p-3 rounded-lg border border-[#E5DDD2] focus:border-[#9C421C] focus:ring-1 focus:ring-[#9C421C] outline-none text-[#141413] bg-white tabular-nums min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#141413]">
                  Duration (Minutes) <span className="text-[#9C421C]">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={15}
                  step={15}
                  value={newServiceDuration}
                  onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                  className="w-full text-xs p-3 rounded-lg border border-[#E5DDD2] focus:border-[#9C421C] focus:ring-1 focus:ring-[#9C421C] outline-none text-[#141413] bg-white tabular-nums min-h-[44px]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#141413]">
                Description &amp; Inclusions
              </label>
              <textarea
                rows={3}
                placeholder="Itemize what is included in this reservation or hospitality package..."
                value={newServiceDesc}
                onChange={(e) => setNewServiceDesc(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-[#E5DDD2] focus:border-[#9C421C] focus:ring-1 focus:ring-[#9C421C] outline-none text-[#141413] bg-white resize-none"
              />
            </div>

            <div className="pt-2 border-t border-[#E5DDD2] flex items-center justify-end gap-2.5">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setIsAddServiceModalOpen(false)}
                className="min-h-[44px]"
              >
                Cancel
              </Button>
              <button
                type="submit"
                className="bg-[#9C421C] text-white hover:bg-[#7F3516] font-bold text-xs min-h-[44px] px-5 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Package</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* 6. ADD BRANCH STAFF MODAL */}
      {/* ========================================================= */}
      {isAddStaffModalOpen && (
        <Modal
          isOpen={isAddStaffModalOpen}
          onClose={() => setIsAddStaffModalOpen(false)}
          title="Add Front-Desk Staff Account"
          description={`Grant PARTNER_STAFF queue access for ${activeMerchant.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleAddStaffSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#141413]">
                Full Name <span className="text-[#9C421C]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Chandra"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-[#E5DDD2] focus:border-[#9C421C] focus:ring-1 focus:ring-[#9C421C] outline-none text-[#141413] bg-white min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#141413]">
                  Mobile Number <span className="text-[#9C421C]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 94310 XXXXX"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-[#E5DDD2] focus:border-[#9C421C] focus:ring-1 focus:ring-[#9C421C] outline-none text-[#141413] bg-white min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#141413]">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="staff@hotelmaurya.com"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-[#E5DDD2] focus:border-[#9C421C] focus:ring-1 focus:ring-[#9C421C] outline-none text-[#141413] bg-white min-h-[44px]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#141413]">
                Assigned Venue Wing <span className="text-[#9C421C]">*</span>
              </label>
              <select
                value={staffBranch}
                onChange={(e) => setStaffBranch(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-[#E5DDD2] focus:border-[#9C421C] focus:ring-1 focus:ring-[#9C421C] outline-none text-[#141413] bg-white min-h-[44px]"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.branchName}>
                    {b.branchName} ({b.locality})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3.5 rounded-lg bg-[#EFEAE2] border border-[#E5DDD2] text-[11px] text-[#52524E]">
              Role: <strong>PARTNER_STAFF</strong>. This account will have access to the booking queue and guest 4-digit PIN verification, but will NOT be able to view financial ledger rows or modify package pricing.
            </div>

            <div className="pt-2 border-t border-[#E5DDD2] flex items-center justify-end gap-2.5">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setIsAddStaffModalOpen(false)}
                className="min-h-[44px]"
              >
                Cancel
              </Button>
              <button
                type="submit"
                className="bg-[#9C421C] text-white hover:bg-[#7F3516] font-bold text-xs min-h-[44px] px-5 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Staff Account</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
