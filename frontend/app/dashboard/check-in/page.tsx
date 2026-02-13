
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { api as axios } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Camera, RefreshCw, Clock, AlertCircle, ScanFace } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

export default function CheckInPage() {
    const [loading, setLoading] = useState(true);
    const [statusData, setStatusData] = useState<any>(null);
    const [location, setLocation] = useState<{ lat: number; long: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const webcamRef = useRef<Webcam>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Face Detection State
    const [faceDetector, setFaceDetector] = useState<FaceDetector | null>(null);
    const [isFaceDetected, setIsFaceDetected] = useState(false);
    const requestRef = useRef<number | null>(null);

    // 1. Initialize Face Detector
    useEffect(() => {
        const initializeFaceDetector = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                );
                const detector = await FaceDetector.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO"
                });
                setFaceDetector(detector);
            } catch (error) {
                console.error("Face Detector initialization failed:", error);
                // Fallback: Allow check-in if detector fails to load? Or block?
                // Let's block for security as requested, but maybe show a different error.
                toast.error("Gagal memuat sistem deteksi wajah.");
            }
        };

        if (typeof window !== 'undefined') {
            initializeFaceDetector();
        }
    }, []);

    // 2. Detection Loop
    const detectFace = useCallback(async () => {
        if (!faceDetector || !webcamRef.current?.video || webcamRef.current.video.readyState !== 4) {
            requestRef.current = requestAnimationFrame(detectFace);
            return;
        }

        const video = webcamRef.current.video;
        const startTimeMs = performance.now();
        const detections = faceDetector.detectForVideo(video, startTimeMs);

        if (detections.detections.length > 0) {
            // Check confidence score if needed, usually default is good enough
            setIsFaceDetected(true);
        } else {
            setIsFaceDetected(false);
        }

        requestRef.current = requestAnimationFrame(detectFace);
    }, [faceDetector]);

    useEffect(() => {
        if (faceDetector && !imgSrc) {
            detectFace();
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [faceDetector, detectFace, imgSrc]);


    // Clock Update
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Initial Data Fetch
    const fetchStatus = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/dashboard/attendance/status");
            setStatusData(response.data.data);
        } catch (err: any) {
            console.error(err);
            toast.error("Gagal memuat status absensi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    // Location Tracking
    useEffect(() => {
        if ("geolocation" in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLong = position.coords.longitude;
                    setLocation({ lat: userLat, long: userLong });

                    if (statusData?.factory) {
                        const dist = calculateDistance(
                            userLat,
                            userLong,
                            statusData.factory.lat,
                            statusData.factory.long
                        );
                        setDistance(dist);
                    }
                },
                (err) => {
                    console.error(err);
                    setError("Gagal mendapatkan lokasi. Pastikan GPS aktif.");
                },
                { enableHighAccuracy: true }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        } else {
            setError("Browser tidak mendukung Geolocation.");
        }
    }, [statusData]);

    // Haversine Formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // metres
        const q1 = (lat1 * Math.PI) / 180;
        const q2 = (lat2 * Math.PI) / 180;
        const dq = ((lat2 - lat1) * Math.PI) / 180;
        const dl = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(dq / 2) * Math.sin(dq / 2) +
            Math.cos(q1) * Math.cos(q2) * Math.sin(dl / 2) * Math.sin(dl / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    const retake = () => {
        setImgSrc(null);
        setIsFaceDetected(false); // Reset detection state
    };

    // Submit Check-In
    const handleSubmit = async (directImgSrc?: string) => {
        const finalImgSrc = directImgSrc || imgSrc;
        if (!location || !finalImgSrc || !statusData) return;

        // Validasi Wajah (Double Check saat submit)
        if (!directImgSrc && !isFaceDetected) {
            toast.error("Wajah tidak terdeteksi. Silakan posisikan wajah Anda di depan kamera.");
            return;
        }

        // Radius Validation
        if (statusData.factory && distance !== null && distance > statusData.factory.radius) {
            toast.error(`Anda berada di luar radius kantor (${Math.round(distance)}m). Max: ${statusData.factory.radius}m`);
            return;
        }

        try {
            setSubmitting(true);

            const res = await fetch(finalImgSrc);
            const blob = await res.blob();
            const file = new File([blob], "attendance.jpg", { type: "image/jpeg" });

            const formData = new FormData();
            formData.append("lat", String(location.lat));
            formData.append("long", String(location.long));
            formData.append("status", statusData.action === 'CHECK_IN' ? '0' : '1');
            formData.append("distance", String(Math.round(distance || 0)));
            formData.append("photo", file);

            await axios.post("/dashboard/attendance/check-in", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success(statusData.action === 'CHECK_IN' ? "Berhasil Check-In!" : "Berhasil Check-Out!");
            setImgSrc(null);
            fetchStatus();

        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Gagal melakukan absensi.");
            if (directImgSrc) setImgSrc(null); // Reset if failed
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

    const isWithinRadius = distance !== null && statusData?.factory && distance <= statusData.factory.radius;

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-4">
            <div className="max-w-md mx-auto pt-3 px-4 space-y-2">

                {/* Compact Title */}
                <div className="flex items-center justify-between px-2">
                    <h1 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tighter">Presensi Kehadiran</h1>
                    <Badge variant="outline" className="text-[0.55rem] font-bold rounded-full py-0 h-5">
                        {statusData?.action === 'CHECK_IN' ? 'Masuk' : 'Keluar'}
                    </Badge>
                </div>

                {/* Clock & Status Card */}
                <Card className="border-none dark:border dark:border-slate-800 shadow-sm dark:bg-slate-900 overflow-hidden rounded-[1.5rem]">
                    <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex flex-col">
                            <p className="text-[0.5rem] font-bold tracking-[0.1em] text-slate-400 uppercase">Waktu Sekarang</p>
                            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">
                                {format(currentTime, "HH.mm.ss")}
                            </h2>
                            <p className="text-[0.5rem] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                {format(currentTime, "EEEE, d MMM yyyy", { locale: id })}
                            </p>
                        </div>

                        {/* Location Pill */}
                        <div className={`px-2.5 py-1 rounded-full flex items-center gap-1 text-[0.55rem] font-black uppercase ${isWithinRadius ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'}`}>
                            <MapPin className="h-2.5 w-2.5" />
                            <span>{Math.round(distance || 0)}m</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Thin Warning Alert if outside radius */}
                {!isWithinRadius && statusData?.factory && (
                    <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-xl p-2 flex items-center gap-2">
                        <AlertCircle className="h-3 w-3 text-rose-600" />
                        <p className="text-[0.55rem] font-black text-rose-700 dark:text-rose-400 uppercase leading-none">Jarak terlalu jauh! (Maks: {statusData.factory.radius}m)</p>
                    </div>
                )}

                {/* Photo Guidelines */}
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                        <ScanFace className="h-4 w-4 text-slate-800 dark:text-slate-200" />
                        <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tighter">Ketentuan Foto Absensi</h3>
                    </div>
                    <ul className="space-y-1.5 list-disc list-inside text-[0.6rem] font-medium text-slate-600 dark:text-slate-400">
                        <li><span className="font-bold text-slate-800 dark:text-slate-200">Wajib Background Area dan berada di Radius Area Kantor/Perusahaan.</span></li>
                        <li>Wajah harus terlihat jelas, <span className="font-bold">Lepas Masker</span>, Kacamata Hitam, atau Topi yang menutupi wajah.</li>
                        <li>Pastikan pencahayaan cukup terang agar wajah terdeteksi sistem.</li>
                        <li>Gunakan pakaian rapi / seragam sesuai ketentuan perusahaan.</li>
                    </ul>
                </div>

                {/* Camera Area Card */}
                <Card className="border-none dark:border dark:border-slate-800 shadow-sm dark:bg-slate-900 rounded-[1.5rem] overflow-hidden">
                    <CardContent className="p-2 space-y-2">
                        <div className="aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative border-2 border-white dark:border-slate-700 shadow-sm">
                            {imgSrc ? (
                                <img src={imgSrc} alt="Captured" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        videoConstraints={{ facingMode: { ideal: "user" }, width: 800 }} // Ensure user facing
                                        className="w-full h-full object-cover mirror" // Add mirror class if needed for flip
                                        style={{ transform: 'scaleX(-1)' }} // Simple mirror effect
                                    />
                                    {/* Face Status Overlay */}
                                    <div className="absolute top-2 left-2 right-2 flex justify-center">
                                        {!faceDetector ? (
                                            <Badge className="bg-slate-800/80 text-white border-none text-[0.55rem] uppercase font-bold backdrop-blur-sm">
                                                <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Memuat AI...
                                            </Badge>
                                        ) : isFaceDetected ? (
                                            <Badge className="bg-emerald-500/80 text-white border-none text-[0.55rem] uppercase font-bold backdrop-blur-sm shadow-sm animate-in fade-in zoom-in duration-300">
                                                <ScanFace className="mr-1 h-3 w-3" /> Wajah Terdeteksi
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-rose-500/80 text-white border-none text-[0.55rem] uppercase font-bold backdrop-blur-sm shadow-sm animate-pulse">
                                                <AlertCircle className="mr-1 h-3 w-3" /> Wajah Tidak Terdeteksi
                                            </Badge>
                                        )}
                                    </div>
                                    {/* Face Bounding Box SVG Layer could go here if we used detection coords */}
                                </>
                            )}
                        </div>

                        {/* Action Buttons */}
                        {imgSrc ? (
                            <Button
                                variant="outline"
                                onClick={retake}
                                className="w-full rounded-xl py-3 text-[0.6rem] h-auto font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 dark:hover:bg-slate-800"
                                disabled={submitting}
                            >
                                <RefreshCw className="mr-2 h-3 w-3" /> Foto Ulang
                            </Button>
                        ) : null}

                        <Button
                            className={`w-full rounded-xl py-5 text-xs h-auto font-black uppercase tracking-widest shadow-md transition-all duration-300 ${(!imgSrc && !isFaceDetected && faceDetector)
                                ? 'bg-slate-400 cursor-not-allowed opacity-70'
                                : (statusData?.action === 'CHECK_IN' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-rose-600 hover:bg-rose-700')
                                }`}
                            onClick={async () => {
                                if (imgSrc) {
                                    await handleSubmit();
                                } else {
                                    // Capture then Submit
                                    // Prevent capture if no face
                                    if (!isFaceDetected) {
                                        toast.error("Wajah tidak terdeteksi. Mohon posisikan wajah Anda.");
                                        return;
                                    }

                                    const photo = webcamRef.current?.getScreenshot();
                                    if (photo) {
                                        setImgSrc(photo);
                                        // Use the photo directly for submission to avoid waiting for state update
                                        await handleSubmit(photo);
                                    }
                                }
                            }}
                            disabled={!!(submitting || (!imgSrc && !location) || (imgSrc && !isWithinRadius) || (!imgSrc && !isFaceDetected && faceDetector))}
                        >
                            <div className="flex items-center gap-2">
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                                <span>{statusData?.action === 'CHECK_IN' ? 'Absen Masuk' : 'Absen Keluar'}</span>
                            </div>
                        </Button>
                    </CardContent>
                </Card>

                {/* Compact History Section */}
                {statusData?.logs?.length > 0 && (
                    <div className="space-y-4 pt-4">
                        <div className="flex justify-between items-center px-2">
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm italic">Riwayat Hari Ini</h3>
                            <Badge variant="outline" className="rounded-full text-[0.6rem] font-bold px-3">
                                {statusData.logs.length} Log
                            </Badge>
                        </div>
                        <div className="space-y-3">
                            {statusData.logs.map((log: any) => (
                                <div key={log.id} className="bg-white dark:bg-slate-900 rounded-3xl p-4 flex justify-between items-center shadow-sm border border-slate-50 dark:border-slate-800">
                                    <div className="flex gap-4 items-center">
                                        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${log.status === '0' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400'}`}>
                                            <span className="text-xs font-black">{log.status === '0' ? 'IN' : 'OUT'}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{log.status === '0' ? 'Check-In' : 'Check-Out'}</p>
                                            <p className="text-[0.6rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{format(new Date(log.attTime), "HH:mm:ss")}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[0.6rem] font-black text-slate-600 dark:text-slate-400 tracking-tighter uppercase">{log.distance} Meter</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
