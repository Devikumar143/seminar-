import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Keyboard, 
  RotateCw, 
  ShieldCheck,
  ScanLine,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeminarId?: number | string;
  onAttendanceMarked?: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  selectedSeminarId,
  onAttendanceMarked,
}) => {
  const { showToast } = useToast();
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Initialize camera scanner
  useEffect(() => {
    if (isOpen) {
      setScanResult(null);
      setScanError(null);

      Html5Qrcode.getCameras()
        .then((devices) => {
          if (devices && devices.length) {
            setCameras(devices);
            const backCam = devices.find((d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
            const chosenId = backCam ? backCam.id : devices[0].id;
            setActiveCameraId(chosenId);
            startScanning(chosenId);
          } else {
            setScanError('No video camera detected on your device. Please use manual code entry.');
          }
        })
        .catch((err) => {
          console.warn('Camera detection error:', err);
          setScanError('Camera permission not granted or camera not accessible. Please use manual code entry below.');
        });
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const startScanning = async (cameraId: string) => {
    try {
      if (scannerRef.current) {
        await stopScanning();
      }

      const qrCode = new Html5Qrcode('qr-reader-container');
      scannerRef.current = qrCode;

      await qrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleCodeDetected(decodedText);
        },
        () => {
          // ignore scan frame errors
        }
      );
      setScanning(true);
      setScanError(null);
    } catch (err: any) {
      console.error('Error starting QR scanner:', err);
      setScanning(false);
      setScanError('Could not start live camera feed. You can enter the Pass ID manually below.');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleCodeDetected = async (code: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.pause(true);
      }

      const res = await api.post('/attendance/scan', {
        qr_token: code.startsWith('SEM-PASS-') ? code : undefined,
        registration_id: !code.startsWith('SEM-PASS-') ? code : undefined,
        seminar_id: selectedSeminarId || undefined,
      });

      if (res.data.success) {
        setScanResult(res.data.attendance);
        setScanError(null);
        showToast('Attendance Marked Successfully! ✅', 'success');
        if (onAttendanceMarked) onAttendanceMarked();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Attendance scan failed.';
      setScanError(msg);
      if (err.response?.data?.alreadyMarked) {
        setScanResult({
          ...err.response.data.attendance,
          alreadyMarked: true,
        });
      }
      showToast(msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleCodeDetected(manualCode.trim());
  };

  const handleScanNext = async () => {
    setScanResult(null);
    setScanError(null);
    setManualCode('');
    if (scannerRef.current) {
      try {
        scannerRef.current.resume();
      } catch (e) {
        if (activeCameraId) startScanning(activeCameraId);
      }
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopScanning();
          onClose();
        }
      }}
      className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 text-slate-800 animate-fade-in"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 relative my-auto animate-slide-up">
        {/* Header */}
        <div className="bg-white text-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-slate-900">QR Attendance Scanner</h3>
              <p className="text-xs text-slate-500">Scan student fast-pass or enter pass ID</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanning();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Scan Result Display */}
          {scanResult ? (
            <div className={`p-5 rounded-xl border text-center ${
              scanResult.alreadyMarked ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 shadow-xs ${
                scanResult.alreadyMarked ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
              }`}>
                {scanResult.alreadyMarked ? <AlertCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
              </div>

              <span className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-1.5 ${
                scanResult.alreadyMarked ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {scanResult.alreadyMarked ? 'Already Checked-In' : 'Attendance Verified'}
              </span>

              <h4 className="text-base font-bold text-slate-900 mt-1">{scanResult.student_name}</h4>
              <p className="text-xs text-slate-600 font-mono mt-0.5">Student ID: {scanResult.student_id}</p>

              <div className="mt-4 p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Seminar:</span>
                  <span className="text-slate-900 font-semibold text-right">{scanResult.seminar || scanResult.seminar_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Check-in Time:</span>
                  <span className="text-slate-700 font-mono">
                    {new Date(scanResult.check_in_time).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Status:</span>
                  <span className="text-emerald-700 font-bold uppercase">{scanResult.status || 'PRESENT'}</span>
                </div>
              </div>

              <button
                onClick={handleScanNext}
                className="mt-5 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Scan Next Participant
              </button>
            </div>
          ) : (
            <>
              {/* Camera Scanner Viewport */}
              <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-300 shadow-inner flex flex-col items-center justify-center min-h-[260px]">
                {/* HUD Corner crosshairs */}
                <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-white/60 z-10 pointer-events-none" />
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-white/60 z-10 pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-white/60 z-10 pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-white/60 z-10 pointer-events-none" />

                <div id="qr-reader-container" className="w-full max-w-[320px] mx-auto overflow-hidden"></div>

                {isProcessing && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20">
                    <RotateCw className="w-7 h-7 text-white animate-spin mb-2" />
                    <span className="text-xs font-semibold">Validating Pass...</span>
                  </div>
                )}
              </div>

              {/* Error warning if any */}
              {scanError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>{scanError}</span>
                </div>
              )}

              {/* Camera Switcher */}
              {cameras.length > 1 && (
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Camera:</span>
                  <select
                    value={activeCameraId || ''}
                    onChange={(e) => {
                      setActiveCameraId(e.target.value);
                      startScanning(e.target.value);
                    }}
                    className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                  >
                    {cameras.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label || `Camera ${c.id.substring(0, 5)}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Manual Entry Fallback */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                  <Keyboard className="w-3.5 h-3.5 text-slate-500" />
                  <span>Manual Pass Token or Registration ID</span>
                </div>
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. REG-2026-0001 or SEM-PASS-..."
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 font-mono text-slate-900 placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={isProcessing || !manualCode.trim()}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-colors shrink-0"
                  >
                    Verify & Check In
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
