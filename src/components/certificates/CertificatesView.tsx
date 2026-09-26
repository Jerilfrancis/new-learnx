import React, { useState } from "react";
import {
  Award,
  Share2,
  Download,
  ExternalLink,
  CheckCircle2,
  X,
  Sparkles,
  QrCode,
} from "lucide-react";
import { Certificate } from "../../types";

interface CertificatesViewProps {
  certificates: Certificate[];
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({ certificates }) => {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyVerificationLink = (cert: Certificate) => {
    navigator.clipboard.writeText(`https://codeinfinite.dev/verify/${cert.credentialId}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-lg bg-[#112D4E] text-white shadow-md space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#3F72AF]/20 rounded-full hidden pointer-events-none" />
        <div className="flex items-center gap-2 text-[#112D4E] font-bold text-xs">
          <Sparkles className="w-4 h-4 text-[#3F72AF]" />
          <span>Verifiable Credentials & Industry Diplomas</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Your Verified Credentials & Diplomas
        </h1>
        <p className="text-xs text-[#112D4E]/[.55] max-w-xl">
          Share your certificates directly to LinkedIn, Twitter, and GitHub. All certificates contain a tamper-proof QR code verification link.
        </p>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            onClick={() => setSelectedCert(cert)}
            className="p-6 rounded-lg bg-[#112D4E] text-white border border-[#112D4E]/[.12] shadow-md hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden group"
          >
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-[#112D4E]/[.04] text-[#112D4E] border border-[#112D4E]/[.12] text-[10px] font-bold">
                  ✓ Authenticated Credential
                </span>
                <Award className="w-6 h-6 text-[#112D4E] group-hover:rotate-12 transition-transform" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white leading-snug">
                  {cert.title}
                </h3>
                <p className="text-xs text-[#112D4E]/[.55] mt-1">
                  Issued by {cert.issuer}
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                {cert.skillsVerified.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-[#112D4E] text-[#112D4E]/[.55] text-[10px] font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#112D4E]/[.12] flex items-center justify-between text-xs text-[#112D4E]/[.55] relative z-10">
              <span>{cert.issueDate}</span>
              <span className="text-[#3F72AF] font-bold group-hover:translate-x-1 transition-transform">
                View Certificate →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Certificate Detailed Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-[#112D4E]/70  flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-md border border-[#112D4E]/[.12] p-6 sm:p-8 space-y-6 my-auto animate-in fade-in zoom-in duration-200 text-[#112D4E] relative">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 p-2 text-[#112D4E]/[.55] hover:text-[#112D4E]/[.72] rounded-full hover:bg-[#112D4E]/[.04]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Template Box */}
            <div className="p-8 rounded-lg bg-[#112D4E]/[.04] border-4 border-[#112D4E]/[.12] text-center space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-[#3F72AF]">
                <Award className="w-5 h-5" /> LearnX Global Academy
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#112D4E] uppercase">
                Certificate of Mastery
              </h2>

              <p className="text-xs text-[#112D4E]/[.55]">This is to verify that</p>

              <p className="text-2xl sm:text-3xl font-black text-[#3F72AF] underline decoration-[#3F72AF]">
                {selectedCert.recipientName}
              </p>

              <p className="text-xs text-[#112D4E]/[.72] max-w-md mx-auto leading-relaxed">
                has successfully completed all required modules, assignments, and capstones for
              </p>

              <h3 className="text-lg font-extrabold text-[#112D4E]">
                "{selectedCert.title}"
              </h3>

              <div className="pt-4 flex items-center justify-around border-t border-[#112D4E]/[.12] text-xs">
                <div>
                  <p className="font-extrabold text-[#112D4E]">{selectedCert.signatureName}</p>
                  <p className="text-[10px] text-[#112D4E]/[.55]">Chief Academic Officer</p>
                </div>

                <div className="flex flex-col items-center">
                  <img
                    src={selectedCert.qrCodeUrl}
                    alt="Verification QR"
                    className="w-16 h-16 rounded-lg ring-1 ring-[#112D4E]/[.25]"
                  />
                  <span className="text-[9px] font-mono text-[#112D4E]/[.55] mt-1">
                    {selectedCert.credentialId}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => handleCopyVerificationLink(selectedCert)}
                className="px-4 py-2 rounded-xl bg-[#112D4E]/[.04] text-[#112D4E] font-bold text-xs hover:bg-[#112D4E]/[.08] cursor-pointer flex items-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                {copiedLink ? "Link Copied!" : "Copy Share Link"}
              </button>

              <button
                onClick={() => {
                  // Generate downloadable Certificate image using Canvas
                  const canvas = document.createElement("canvas");
                  canvas.width = 1200;
                  canvas.height = 800;
                  const ctx = canvas.getContext("2d");
                  if (ctx) {
                    // Background
                    ctx.fillStyle = "#112D4E";
                    ctx.fillRect(0, 0, 1200, 800);

                    // Border
                    ctx.strokeStyle = "#3F72AF";
                    ctx.lineWidth = 12;
                    ctx.strokeRect(30, 30, 1140, 740);

                    ctx.strokeStyle = "#3F72AF";
                    ctx.lineWidth = 4;
                    ctx.strokeRect(45, 45, 1110, 710);

                    // Header
                    ctx.fillStyle = "#3F72AF";
                    ctx.font = "bold 24px sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText("LEARNX ACADEMY", 600, 120);

                    ctx.fillStyle = "#ffffff";
                    ctx.font = "900 44px sans-serif";
                    ctx.fillText("CERTIFICATE OF MASTERY", 600, 180);

                    ctx.fillStyle = "#112D4E";
                    ctx.font = "20px sans-serif";
                    ctx.fillText("This is proudly presented to", 600, 240);

                    // Recipient
                    ctx.fillStyle = "#3F72AF";
                    ctx.font = "bold 48px sans-serif";
                    ctx.fillText(selectedCert.recipientName, 600, 310);

                    // Underline
                    ctx.strokeStyle = "#3F72AF";
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.moveTo(350, 330);
                    ctx.lineTo(850, 330);
                    ctx.stroke();

                    // Description
                    ctx.fillStyle = "#112D4E";
                    ctx.font = "22px sans-serif";
                    ctx.fillText("for successfully completing all curriculum requirements for", 600, 390);

                    // Course title
                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 36px sans-serif";
                    ctx.fillText(`"${selectedCert.title}"`, 600, 460);

                    // Footer metadata
                    ctx.fillStyle = "#112D4E";
                    ctx.font = "18px sans-serif";
                    ctx.fillText(`Certificate ID: ${selectedCert.credentialId}`, 600, 540);
                    ctx.fillText(`Issued on: ${selectedCert.issueDate} • Verified by LearnX`, 600, 580);

                    // Signature & Seal
                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 22px sans-serif";
                    ctx.fillText(selectedCert.signatureName, 600, 670);
                    ctx.fillStyle = "#112D4E";
                    ctx.font = "16px sans-serif";
                    ctx.fillText("Chief Academic Officer", 600, 700);

                    // Download trigger
                    const link = document.createElement("a");
                    link.download = `Certificate_${selectedCert.credentialId}.png`;
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                  }
                }}
                className="px-5 py-2 rounded-xl bg-[#3F72AF] text-white font-bold text-xs hover:bg-[#112D4E] transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" /> Download Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
