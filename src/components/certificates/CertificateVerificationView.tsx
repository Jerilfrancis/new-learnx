import React, { useEffect, useState } from "react";
import { Award, CheckCircle2, XCircle } from "lucide-react";
import { coursesApi } from "../../services/api";

interface CertificateVerificationViewProps {
  certificateId: string;
}

export const CertificateVerificationView: React.FC<CertificateVerificationViewProps> = ({ certificateId }) => {
  const [state, setState] = useState<"loading" | "valid" | "invalid" | "error">("loading");
  const [certificate, setCertificate] = useState<any>(null);

  useEffect(() => {
    coursesApi.getCertificate(certificateId)
      .then((response) => {
        if (response.success && response.certificate) {
          setCertificate(response.certificate);
          setState("valid");
        } else {
          setState("invalid");
        }
      })
      .catch(() => setState("invalid"));
  }, [certificateId]);

  return (
    <main className="min-h-screen bg-[#112D4E] text-white flex items-center justify-center p-6">
      <section className="w-full max-w-lg rounded-lg border border-[#112D4E]/[.12] bg-[#112D4E] p-8 shadow-md">
        {state === "loading" && <p className="text-center text-[#112D4E]/[.55]">Checking credential...</p>}
        {state === "invalid" || state === "error" ? (
          <div className="text-center space-y-4">
            <XCircle className="mx-auto h-16 w-16 text-[#112D4E]" />
            <h1 className="text-2xl font-black">Credential not found</h1>
            <p className="text-sm text-[#112D4E]/[.55]">This credential ID could not be verified.</p>
            <p className="font-mono text-xs text-[#112D4E]/[.55]">{certificateId}</p>
          </div>
        ) : state === "valid" ? (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <CheckCircle2 className="mx-auto h-16 w-16 text-[#112D4E]" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#112D4E]">Verified credential</p>
              <h1 className="text-2xl font-black">{certificate.courseTitle}</h1>
            </div>
            <div className="space-y-3 rounded-lg border border-[#112D4E]/[.12] bg-[#112D4E] p-5 text-sm">
              <div className="flex justify-between gap-4"><span className="text-[#112D4E]/[.55]">Recipient</span><strong>{certificate.studentName}</strong></div>
              <div className="flex justify-between gap-4"><span className="text-[#112D4E]/[.55]">Educator</span><strong>{certificate.instructorName}</strong></div>
              <div className="flex justify-between gap-4"><span className="text-[#112D4E]/[.55]">Issued</span><strong>{new Date(certificate.issueDate).toLocaleDateString()}</strong></div>
              <div className="flex justify-between gap-4"><span className="text-[#112D4E]/[.55]">Credential ID</span><strong className="font-mono text-[#112D4E]">{certificate.certificateId}</strong></div>
            </div>
            <Award className="mx-auto h-8 w-8 text-[#112D4E]" />
          </div>
        ) : null}
      </section>
    </main>
  );
};
