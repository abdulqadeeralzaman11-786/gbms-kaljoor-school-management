import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { FeeRecord } from '../../types';
import {
  CreditCard,
  Plus,
  Printer,
  Search,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Receipt,
  FileText,
  Save,
  X,
} from 'lucide-react';

export const FeeManagementView: React.FC = () => {
  const { profile, showToast } = useApp();
  const { canAccess } = useAuth();

  const [fees, setFees] = useState<FeeRecord[]>(db.getFeeRecords());
  const [selectedClass, setSelectedClass] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [printingFee, setPrintingFee] = useState<FeeRecord | null>(null);

  const students = db.getStudents();

  const [formData, setFormData] = useState({
    studentId: students[0]?.id || '',
    month: 'March 2026',
    amount: 150,
    paidAmount: 150,
    waiverAmount: 0,
    dueDate: '2026-03-25',
    remarks: 'Farogh-e-Taleem Fund + Sports',
  });

  const filteredFees = fees.filter((f) => {
    if (selectedClass !== 'all' && f.classGrade !== selectedClass) return false;
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (f.studentName || '').toLowerCase().includes(q) ||
        (f.receiptNo || '').toLowerCase().includes(q) ||
        (f.rollNo !== undefined ? f.rollNo.toString() : '').includes(q)
      );
    }
    return true;
  });

  const handleOpenCollect = () => {
    setFormData({
      studentId: students[0]?.id || '',
      month: 'March 2026',
      amount: 150,
      paidAmount: 150,
      waiverAmount: 0,
      dueDate: '2026-03-25',
      remarks: 'Farogh-e-Taleem Fund (FTF)',
    });
    setIsCollectModalOpen(true);
  };

  const handleSaveCollection = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === formData.studentId);
    if (!st) return;

    const amount = Number(formData.amount);
    const paid = Number(formData.paidAmount);
    const waiver = Number(formData.waiverAmount);
    const effectiveDue = amount - waiver;

    let status: 'paid' | 'partial' | 'unpaid' = 'unpaid';
    if (paid >= effectiveDue) status = 'paid';
    else if (paid > 0) status = 'partial';

    const newFee: FeeRecord = {
      id: `FEE-${Date.now()}`,
      studentId: st.id,
      studentName: st.name,
      rollNo: st.rollNo,
      classGrade: st.currentClass,
      feeType: 'School Welfare Fund',
      academicYear: st.academicYear || '2025-2026',
      month: formData.month,
      amount: amount,
      paidAmount: paid,
      waiverAmount: waiver,
      status: status,
      paymentDate: paid > 0 ? new Date().toISOString().split('T')[0] : undefined,
      receiptNo: `REC-${Date.now().toString().slice(-5)}`,
      dueDate: formData.dueDate,
      remarks: formData.remarks,
    };

    db.saveFeeRecord(newFee);
    setFees(db.getFeeRecords());
    setIsCollectModalOpen(false);
    showToast(`Fee receipt generated for ${st.name}!`, 'success');
  };

  const totalDemand = fees.reduce((acc, f: any) => acc + (f.amount || 0), 0);
  const totalCollected = fees.reduce((acc, f: any) => acc + (f.paidAmount || (f.status === 'paid' ? f.amount : 0)), 0);
  const totalWaivers = fees.reduce((acc, f: any) => acc + (f.waiverAmount || 0), 0);
  const totalArrears = totalDemand - totalCollected - totalWaivers;
  const collectionRate = totalDemand > 0 ? Math.round((totalCollected / (totalDemand - totalWaivers)) * 100) : 0;

  const handlePrintChallan = (fee: FeeRecord) => {
    setPrintingFee(fee);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-emerald-700" />
            <span>School Funds & Fees Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Farogh-e-Taleem Fund (FTF), Sports, Exam Dues & Official Receipts • {profile.name}
          </p>
        </div>

        <div className="flex items-center gap-2.5 no-print">
          {canAccess('fees') && (
            <button
              onClick={handleOpenCollect}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Collect Fund / Fee</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 no-print">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Demand</p>
          <p className="text-xl font-black text-slate-900 mt-1">Rs. {totalDemand.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Collected</p>
          <p className="text-xl font-black text-emerald-700 mt-1">Rs. {totalCollected.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Concessions / Free</p>
          <p className="text-xl font-black text-blue-700 mt-1">Rs. {totalWaivers.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Arrears / Pending</p>
          <p className="text-xl font-black text-rose-700 mt-1">Rs. {totalArrears.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs col-span-2 lg:col-span-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recovery Rate</p>
          <p className="text-xl font-black text-emerald-800 mt-1">{collectionRate}%</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student or receipt..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) =>
                setSelectedClass(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))
              }
              className="px-2.5 py-1 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
            >
              <option value="all">All Classes</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                <option key={c} value={c}>
                  Class {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fees Register Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Billing Month</th>
                <th className="py-3 px-4 text-right">Total (Rs.)</th>
                <th className="py-3 px-4 text-right">Paid (Rs.)</th>
                <th className="py-3 px-4 text-right">Balance (Rs.)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No fee records matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredFees.map((f) => {
                  const bal = f.amount - (f.paidAmount || 0) - (f.waiverAmount || 0);
                  return (
                    <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{f.receiptNo}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {f.studentName}
                        <span className="block text-[10px] text-slate-400 font-normal">Roll #{f.rollNo}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800">
                          Class {f.classGrade}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{f.month}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">{f.amount}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        {f.paidAmount}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">{bal}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            f.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : f.status === 'partial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {f.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handlePrintChallan(f)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Fee Modal */}
      {isCollectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base">Collect School Fund / Fee</h3>
              <button
                onClick={() => setIsCollectModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCollection} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Student</label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                  required
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      Class {s.currentClass} - Roll #{s.rollNo} - {s.name} ({s.fatherName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Month / Session</label>
                  <input
                    type="text"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Fee (Rs)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Paid (Rs)</label>
                  <input
                    type="number"
                    value={formData.paidAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, paidAmount: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-emerald-700"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Waiver (Rs)</label>
                  <input
                    type="number"
                    value={formData.waiverAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, waiverAmount: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-blue-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fee Description / Remarks</label>
                <input
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="e.g. Farogh-e-Taleem Fund (FTF) + Examination Fee"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCollectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Generate Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable 3-Copy Bank Challan / School Receipt */}
      {printingFee && (
        <div className="print-only">
          <div className="text-center mb-4">
            <p className="text-xs uppercase font-bold text-slate-700">Govt. of AJ&K • Elementary Education Department</p>
            <h2 className="text-lg font-bold text-slate-900">{profile.name}</h2>
            <p className="text-xs text-slate-600">Official Student Fund Challan • Session: 2025-2026</p>
          </div>

          <div className="grid grid-cols-3 gap-4 border-2 border-slate-800 p-4 rounded-xl text-xs">
            {['School Copy', 'Bank / Office Copy', 'Student Copy'].map((copyName, idx) => (
              <div key={idx} className="border-r last:border-r-0 border-slate-300 pr-3 space-y-2">
                <div className="text-center font-black uppercase text-[10px] bg-slate-100 py-1 rounded">
                  {copyName}
                </div>
                <div className="space-y-1 text-[11px]">
                  <p><strong>Receipt:</strong> {printingFee.receiptNo}</p>
                  <p><strong>Student:</strong> {printingFee.studentName}</p>
                  <p><strong>Class:</strong> Class {printingFee.classGrade}</p>
                  <p><strong>Roll #:</strong> {printingFee.rollNo}</p>
                  <p><strong>Month:</strong> {printingFee.month}</p>
                  <p><strong>Due Date:</strong> {printingFee.dueDate}</p>
                  <div className="border-t border-b border-slate-300 py-1 my-2">
                    <div className="flex justify-between">
                      <span>FTF & Sports:</span>
                      <span className="font-mono">Rs. {printingFee.amount}</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-800">
                      <span>Amount Paid:</span>
                      <span className="font-mono">Rs. {printingFee.paidAmount}</span>
                    </div>
                    {(printingFee.waiverAmount || 0) > 0 && (
                      <div className="flex justify-between text-blue-700">
                        <span>Fee Concession:</span>
                        <span className="font-mono">Rs. {printingFee.waiverAmount}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 italic">{printingFee.remarks}</p>
                </div>
                <div className="pt-6 text-center text-[10px] border-t border-slate-300">
                  Cashier / Headmaster Sign
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
