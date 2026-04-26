import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Agenda Igreja Santa Tereza";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0e0718 0%, #1a0d22 60%, #2a1035 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        {/* Calendar icon */}
        <div
          style={{
            width: 140,
            height: 140,
            background: "#7e5686",
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
            boxShadow: "0 0 60px rgba(126,86,134,0.6)",
          }}
        >
          {/* Cross */}
          <div style={{ position: "relative", width: 60, height: 60, display: "flex" }}>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                transform: "translateX(-50%)",
                width: 14,
                height: 60,
                background: "#e8f9a2",
                borderRadius: 7,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "35%",
                left: 0,
                width: 60,
                height: 14,
                background: "#e8f9a2",
                borderRadius: 7,
              }}
            />
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#e8f9a2",
            letterSpacing: -1,
            marginBottom: 16,
          }}
        >
          Igreja Santa Tereza
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            color: "rgba(165,170,217,0.8)",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Agenda de Pregações
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "linear-gradient(90deg, #7e5686, #f8a13f, #7e5686)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
