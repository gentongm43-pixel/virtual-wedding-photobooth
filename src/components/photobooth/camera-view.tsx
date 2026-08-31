"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export type FacingMode = "user" | "environment";

export type CameraErrorCode =
  | "unsupported"
  | "permission-denied"
  | "insecure-context"
  | "unavailable"
  | "security"
  | "timeout"
  | "unknown";

export type CameraDiagnostics = {
  protocol: string;
  hostname: string;
  secureContext: boolean;
  mediaDevices: boolean;
  getUserMedia: boolean;
};

export type CameraViewHandle = {
  captureFrame: () => Promise<Blob>;
  getDimensions: () => { width: number; height: number; ratio: number } | null;
};

type CameraViewProps = {
  active: boolean;
  facingMode: FacingMode;
  onReady: (dimensions: { width: number; height: number; ratio: number }) => void;
  onError: (code: CameraErrorCode) => void;
  onDiagnostics: (diagnostics: CameraDiagnostics) => void;
};

function getErrorCode(error: unknown): CameraErrorCode {
  const name = error instanceof DOMException
    ? error.name
    : error && typeof error === "object" && "name" in error && typeof error.name === "string"
      ? error.name
      : "";
  if (name) {
    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      return "permission-denied";
    }
    if (name === "SecurityError") return "security";
    if (
      name === "NotFoundError" ||
      name === "NotReadableError" ||
      name === "AbortError" ||
      name === "OverconstrainedError"
    ) {
      return "unavailable";
    }
    if (name === "TypeError") return "unsupported";
  }
  return "unknown";
}

const CameraView = forwardRef<CameraViewHandle, CameraViewProps>(
  function CameraView({ active, facingMode, onReady, onError, onDiagnostics }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [videoReady, setVideoReady] = useState(false);

    useImperativeHandle(ref, () => ({
      async captureFrame() {
        const video = videoRef.current;
        if (!video || !video.videoWidth || !video.videoHeight) {
          throw new Error("Camera belum siap.");
        }

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas tidak tersedia.");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", 0.85),
        );
        if (!blob) throw new Error("Foto gagal dibuat.");
        return blob;
      },
      getDimensions() {
        const video = videoRef.current;
        if (!video?.videoWidth || !video.videoHeight) return null;
        return { width: video.videoWidth, height: video.videoHeight, ratio: video.videoWidth / video.videoHeight };
      },
    }), []);

    useEffect(() => {
      let cancelled = false;
      const videoElement = videoRef.current;
      setVideoReady(false);

      const stopStream = () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
      };

      if (!active) {
        stopStream();
        return () => undefined;
      }

      const diagnostics: CameraDiagnostics = {
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        secureContext: window.isSecureContext,
        mediaDevices: Boolean(navigator.mediaDevices),
        getUserMedia: Boolean(navigator.mediaDevices?.getUserMedia),
      };
      onDiagnostics(diagnostics);

      if (!window.isSecureContext) {
        onError("insecure-context");
        return () => undefined;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        onError("unsupported");
        return () => undefined;
      }

      const timeout = window.setTimeout(() => {
        if (!cancelled) {
          stopStream();
          onError("timeout");
        }
      }, 12000);
      let metadataTimeout: number | undefined;
      let metadataHandler: (() => void) | undefined;

      navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
              facingMode,
            },
        })
        .then((stream) => {
          window.clearTimeout(timeout);
          if (cancelled) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }
          streamRef.current = stream;
          const video = videoRef.current;
          if (!video) return;
          video.srcObject = stream;
          metadataTimeout = window.setTimeout(() => {
            if (!cancelled && !video.videoWidth) {
              stopStream();
              onError("timeout");
            }
          }, 12000);
          metadataHandler = () => {
            if (metadataTimeout) window.clearTimeout(metadataTimeout);
            if (cancelled || !video.videoWidth || !video.videoHeight) return;
            setVideoReady(true);
            onReady({
              width: video.videoWidth,
              height: video.videoHeight,
              ratio: video.videoWidth / video.videoHeight,
            });
          };
          video.addEventListener("loadedmetadata", metadataHandler, { once: true });
          void video.play().catch((error: unknown) => {
            window.clearTimeout(metadataTimeout);
            if (!cancelled) onError(getErrorCode(error));
          });
        })
        .catch((error: unknown) => {
          window.clearTimeout(timeout);
          if (metadataTimeout) window.clearTimeout(metadataTimeout);
          if (!cancelled) {
            if (process.env.NODE_ENV === "development") console.error(error);
            onError(getErrorCode(error));
          }
        });

      return () => {
        cancelled = true;
        window.clearTimeout(timeout);
        if (metadataTimeout) window.clearTimeout(metadataTimeout);
        if (videoElement && metadataHandler) videoElement.removeEventListener("loadedmetadata", metadataHandler);
        stopStream();
      };
    }, [active, facingMode, onDiagnostics, onError, onReady]);

    return (
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute left-1/2 top-1/2 max-h-full max-w-full -translate-x-1/2 -translate-y-1/2 object-contain ${
          facingMode === "user" ? "-scale-x-100" : ""
        } ${videoReady ? "opacity-100" : "opacity-0"}`}
      />
    );
  },
);

export default CameraView;
