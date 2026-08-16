"use client";

export default function RecordTimeline({ records }) {
  if (!records || records.length === 0) {
    return (
      <div className="bg-white border border-border rounded-card p-8 text-center text-slate-500 text-sm">
        No medical records found in history.
      </div>
    );
  }

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border pl-8">
      {records.map((rec) => {
        const docName = rec.doctorId?.userId?.name || "Attending Physician";
        const patName = rec.patientId?.userId?.name || "Patient";

        return (
          <div key={rec._id} className="relative group">
            {/* Timeline node */}
            <div className="absolute -left-8 top-1.5 w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-white border border-blue-200"></div>

            <div className="bg-white border border-border rounded-card p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-border pb-2">
                <div>
                  <h4 className="font-bold text-navy text-base">Visit Date: {rec.visitDate}</h4>
                  <p className="text-xs text-slate-500">
                    Physician: <span className="font-medium text-slate-700">Dr. {docName}</span> • Patient: <span className="font-medium text-slate-700">{patName}</span>
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-lightBlue text-primary font-semibold rounded-btn self-start sm:self-auto border border-blue-100">
                  ID: #{rec._id.slice(-6).toUpperCase()}
                </span>
              </div>

              {rec.diagnosis && (
                <div>
                  <span className="text-xs font-bold text-navy uppercase tracking-wider block mb-1">
                    Diagnosis:
                  </span>
                  <p className="text-sm font-semibold text-primary bg-blue-50/50 p-2.5 rounded-btn border border-blue-100">
                    {rec.diagnosis}
                  </p>
                </div>
              )}

              {rec.treatment && (
                <div>
                  <span className="text-xs font-bold text-navy uppercase tracking-wider block mb-1">
                    Treatment Plan:
                  </span>
                  <p className="text-xs text-slate-700 whitespace-pre-line bg-slate-50 p-3 rounded-btn border border-border">
                    {rec.treatment}
                  </p>
                </div>
              )}

              {rec.notes && (
                <div>
                  <span className="text-xs font-bold text-navy uppercase tracking-wider block mb-1">
                    Clinical Notes:
                  </span>
                  <p className="text-xs text-slate-600 whitespace-pre-line bg-slate-50 p-3 rounded-btn border border-border">
                    {rec.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
