import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { invitationConcepts } from "./data";

const colors = {
  card: "rgba(16, 18, 41, 0.82)",
  line: "rgba(255,255,255,0.10)",
  text: "#f6f3ff",
  muted: "#b7b4d8",
  pink: "#ff4fd8",
  cyan: "#3ef3ff",
  gold: "#ffd166",
};

const cardStyle = {
  background: colors.card,
  border: `1px solid ${colors.line}`,
  borderRadius: 28,
  padding: 18,
  marginTop: 14,
  boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

const inputStyle = {
  width: "100%",
  marginTop: 12,
  padding: 13,
  borderRadius: 16,
  border: `1px solid ${colors.line}`,
  background: "rgba(255,255,255,0.06)",
  color: "white",
  outline: "none",
  boxSizing: "border-box",
  fontSize: 15,
};

const primaryButton = {
  border: "none",
  borderRadius: 16,
  padding: "12px 16px",
  cursor: "pointer",
  fontWeight: "bold",
  color: "white",
  background: "linear-gradient(135deg, #49a6ff 0%, #9b5cff 55%, #ff4fd8 100%)",
};

const secondaryButton = {
  border: `1px solid ${colors.line}`,
  borderRadius: 16,
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: "bold",
  color: "white",
  background: "rgba(255,255,255,0.05)",
};

const conceptCard = (isActive) => ({
  border: `1px solid ${isActive ? colors.cyan : colors.line}`,
  borderRadius: 22,
  padding: 16,
  background: isActive ? "rgba(73,166,255,0.14)" : "rgba(255,255,255,0.04)",
  cursor: "pointer",
  textAlign: "right",
});

export default function InvitationScreen() {
  const [form, setForm] = useState({
    childName: "",
    eventDate: "",
    eventTime: "",
    location: "",
    hostName: "",
    phone: "",
  });

  const [conceptId, setConceptId] = useState("princess");
  const [image, setImage] = useState("");
  const [format, setFormat] = useState("portrait");
  const cardRef = useRef(null);

  const selectedConcept =
    invitationConcepts.find((item) => item.id === conceptId) ||
    invitationConcepts[0];

  const themeByConcept = {
    princess: {
      bg: "linear-gradient(145deg, #fff4fb 0%, #ffe4f3 45%, #ffd3eb 100%)",
      text: "#5f2450",
      icon: "👑",
      title: "יום הולדת קסום",
    },
    soccer: {
      bg: "linear-gradient(160deg, #163c20 0%, #1f6a37 55%, #2d8f49 100%)",
      text: "white",
      icon: "⚽",
      title: "משחק יום הולדת",
    },
    unicorn: {
      bg: "linear-gradient(145deg, #f7efff 0%, #fce7ff 40%, #e8f3ff 100%)",
      text: "#513273",
      icon: "🦄",
      title: "מסיבה קסומה",
    },
    luxury: {
      bg: "linear-gradient(145deg, #121212 0%, #1c1c1c 50%, #101010 100%)",
      text: "#f7e2a0",
      icon: "✨",
      title: "Premium Invitation",
    },
    "pool-party": {
      bg: "linear-gradient(145deg, #dff8ff 0%, #b8efff 45%, #89dcff 100%)",
      text: "#0f4561",
      icon: "🏖️",
      title: "מסיבת בריכה",
    },
    bachelorette: {
      bg: "linear-gradient(145deg, #fff1f7 0%, #ffdbe9 50%, #f8d6ff 100%)",
      text: "#6d2b57",
      icon: "🥂",
      title: "מסיבת רווקות",
    },
    "golden-age": {
      bg: "linear-gradient(145deg, #fffaf0 0%, #f8ecd2 50%, #f4e2b6 100%)",
      text: "#6a5221",
      icon: "🌷",
      title: "הזמנה חגיגית",
    },
  };

  const activeTheme =
    themeByConcept[selectedConcept.type] || themeByConcept.princess;

  const getFormatStyle = () => {
    if (format === "story") {
      return { minHeight: 640, aspectRatio: "9 / 16" };
    }
    if (format === "square") {
      return { minHeight: 520, aspectRatio: "1 / 1" };
    }
    return { minHeight: 560, aspectRatio: "4 / 5" };
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result?.toString() || "");
    };
    reader.readAsDataURL(file);
  };

  const buildInvitationText = () => {
    return `🎉 ${selectedConcept.name}

חוגגים ל: ${form.childName || "שם הילד/ה"}
📅 תאריך: ${form.eventDate || "לבחירה"}
⏰ שעה: ${form.eventTime || "לבחירה"}
📍 מיקום: ${form.location || "לבחירה"}

נשמח לראותכם איתנו!
באהבה, ${form.hostName || "המשפחה"}${
      form.phone
        ? `

לאישור הגעה: ${form.phone}`
        : ""
    }`;
  };

  const shareOnWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(buildInvitationText())}`,
      "_blank"
    );
  };

  const downloadAsImage = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = "evently_invitation.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      alert("לא הצלחתי להוריד את ההזמנה כתמונה");
    }
  };

  const renderDecor = () => {
    const common = {
      position: "absolute",
      pointerEvents: "none",
      zIndex: 1,
    };

    switch (selectedConcept.type) {
      case "princess":
        return (
          <>
            <div style={{ ...common, top: 18, right: 18, fontSize: 30 }}>
              ✨
            </div>
            <div style={{ ...common, top: 26, left: 20, fontSize: 26 }}>👑</div>
            <div style={{ ...common, bottom: 28, right: 24, fontSize: 24 }}>
              💖
            </div>
            <div style={{ ...common, bottom: 22, left: 22, fontSize: 22 }}>
              ✨
            </div>
          </>
        );
      case "soccer":
        return (
          <>
            <div style={{ ...common, top: 14, right: 16, fontSize: 28 }}>
              ⚽
            </div>
            <div style={{ ...common, bottom: 18, left: 18, fontSize: 28 }}>
              🥅
            </div>
          </>
        );
      case "unicorn":
        return (
          <>
            <div style={{ ...common, top: 20, right: 22, fontSize: 26 }}>
              🌈
            </div>
            <div style={{ ...common, top: 22, left: 20, fontSize: 24 }}>⭐</div>
            <div style={{ ...common, bottom: 24, right: 24, fontSize: 24 }}>
              ✨
            </div>
          </>
        );
      case "luxury":
        return (
          <>
            <div
              style={{
                ...common,
                top: 18,
                right: 22,
                fontSize: 18,
                color: "#ffd166",
              }}
            >
              ✦
            </div>
            <div
              style={{
                ...common,
                top: 18,
                left: 22,
                fontSize: 18,
                color: "#ffd166",
              }}
            >
              ✦
            </div>
            <div
              style={{
                ...common,
                bottom: 18,
                right: 22,
                fontSize: 18,
                color: "#ffd166",
              }}
            >
              ✦
            </div>
            <div
              style={{
                ...common,
                bottom: 18,
                left: 22,
                fontSize: 18,
                color: "#ffd166",
              }}
            >
              ✦
            </div>
          </>
        );
      case "bachelorette":
        return (
          <>
            <div style={{ ...common, top: 18, right: 18, fontSize: 24 }}>
              🥂
            </div>
            <div style={{ ...common, bottom: 18, left: 18, fontSize: 24 }}>
              💖
            </div>
          </>
        );
      case "golden-age":
        return (
          <>
            <div style={{ ...common, top: 18, right: 18, fontSize: 24 }}>
              🌷
            </div>
            <div style={{ ...common, bottom: 18, left: 18, fontSize: 22 }}>
              🌸
            </div>
          </>
        );
      case "pool-party":
        return (
          <>
            <div style={{ ...common, top: 18, right: 18, fontSize: 24 }}>
              ☀️
            </div>
            <div style={{ ...common, bottom: 18, right: 18, fontSize: 24 }}>
              🍹
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const renderInvitationDesign = () => {
    const formatStyle = getFormatStyle();

    return (
      <div
        style={{
          minHeight: formatStyle.minHeight,
          aspectRatio: formatStyle.aspectRatio,
          borderRadius: 34,
          padding: 28,
          background: activeTheme.bg,
          color: activeTheme.text,
          textAlign: "center",
          boxShadow: "0 18px 45px rgba(0,0,0,0.20)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {renderDecor()}

        <div style={{ position: "relative", zIndex: 2 }}>
          {image && (
            <div
              style={{
                width: 130,
                height: 130,
                borderRadius: 999,
                overflow: "hidden",
                margin: "0 auto 14px auto",
                border: "4px solid rgba(255,255,255,0.78)",
                boxShadow: "0 12px 28px rgba(0,0,0,0.20)",
              }}
            >
              <img
                src={image}
                alt="uploaded"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}

          <div style={{ fontSize: 54 }}>{activeTheme.icon}</div>
          <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>
            {activeTheme.title}
          </div>

          <div style={{ marginTop: 20, fontSize: 42, fontWeight: 900 }}>
            {form.childName || "שם הילד/ה"}
          </div>

          <div
            style={{
              marginTop: 24,
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.28)",
              borderRadius: 22,
              padding: 18,
              lineHeight: 2,
              fontSize: 18,
            }}
          >
            <div>
              <strong>📅 תאריך:</strong> {form.eventDate || "תאריך"}
            </div>
            <div>
              <strong>⏰ שעה:</strong> {form.eventTime || "שעה"}
            </div>
            <div>
              <strong>📍 מיקום:</strong> {form.location || "מיקום"}
            </div>
          </div>

          <div style={{ marginTop: 24, fontSize: 16, lineHeight: 1.8 }}>
            מחכים לכם לחגיגה בלתי נשכחת 💫
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div style={cardStyle}>
        <div style={{ fontSize: 26, fontWeight: "bold" }}>יצירת הזמנה</div>

        <input
          placeholder="שם הילד/ה"
          value={form.childName}
          onChange={(e) =>
            setForm((p) => ({ ...p, childName: e.target.value }))
          }
          style={inputStyle}
        />
        <input
          type="date"
          value={form.eventDate}
          onChange={(e) =>
            setForm((p) => ({ ...p, eventDate: e.target.value }))
          }
          style={inputStyle}
        />
        <input
          type="time"
          value={form.eventTime}
          onChange={(e) =>
            setForm((p) => ({ ...p, eventTime: e.target.value }))
          }
          style={inputStyle}
        />
        <input
          placeholder="מיקום"
          value={form.location}
          onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
          style={inputStyle}
        />
        <input
          placeholder="שם המארח/ת"
          value={form.hostName}
          onChange={(e) => setForm((p) => ({ ...p, hostName: e.target.value }))}
          style={inputStyle}
        />
        <input
          placeholder="טלפון לאישור הגעה"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          style={inputStyle}
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={inputStyle}
        />

        <div
          style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}
        >
          <button onClick={() => setFormat("portrait")} style={secondaryButton}>
            פורטרט
          </button>
          <button onClick={() => setFormat("story")} style={secondaryButton}>
            סטורי
          </button>
          <button onClick={() => setFormat("square")} style={secondaryButton}>
            ריבוע
          </button>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: 24, fontWeight: "bold" }}>בחירת קונספט</div>

        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
          {invitationConcepts.map((concept) => (
            <button
              key={concept.id}
              onClick={() => setConceptId(concept.id)}
              style={conceptCard(conceptId === concept.id)}
            >
              <div style={{ fontWeight: "bold", fontSize: 18 }}>
                {concept.emoji} {concept.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: 24, fontWeight: "bold" }}>תצוגה מקדימה</div>

        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 38,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.08) 100%)",
            border: `1px solid ${colors.line}`,
            boxShadow: "0 14px 40px rgba(0,0,0,0.20)",
          }}
        >
          <div ref={cardRef}>{renderInvitationDesign()}</div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginTop: 18,
          }}
        >
          <button onClick={shareOnWhatsApp} style={primaryButton}>
            שליחה בוואטסאפ
          </button>
          <button onClick={downloadAsImage} style={secondaryButton}>
            הורדה כתמונה
          </button>
        </div>
      </div>
    </>
  );
}
