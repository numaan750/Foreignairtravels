"use client";

import { useCallback, useEffect, useState } from "react";
import { FiCalendar, FiClock, FiEye, FiMapPin, FiX } from "react-icons/fi";
import { jsPDF } from "jspdf";
import { useApp } from "@/context/AppContext";

const bookingStatuses = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "on_hold", label: "On hold" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const formatFare = (currency, amount) =>
  `${currency || "SAR"} ${Number(amount || 0).toLocaleString("en-US")}`;

const getStatusLabel = (status) =>
  bookingStatuses.find((item) => item.value === status)?.label || status;

const pdfText = (value) => String(value ?? "")
  .normalize("NFKD")
  .replace(/[^\x20-\x7E]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const barcodePatterns = {
  "0": "nnnwwnwnn", "1": "wnnwnnnnw", "2": "nnwwnnnnw", "3": "wnwwnnnnn",
  "4": "nnnwwnnnw", "5": "wnnwwnnnn", "6": "nnwwwnnnn", "7": "nnnwnnwnw",
  "8": "wnnwnnwnn", "9": "nnwwnnwnn", A: "wnnnnwnnw", B: "nnwnnwnnw",
  C: "wnwnnwnnn", D: "nnnnwwnnw", E: "wnnnwwnnn", F: "nnwnwwnnn",
  G: "nnnnnwwnw", H: "wnnnnwwnn", I: "nnwnnwwnn", J: "nnnnwwwnn",
  K: "wnnnnnnww", L: "nnwnnnnww", M: "wnwnnnnwn", N: "nnnnwnnww",
  O: "wnnnwnnwn", P: "nnwnwnnwn", Q: "nnnnnnwww", R: "wnnnnnwwn",
  S: "nnwnnnwwn", T: "nnnnwnwwn", U: "wwnnnnnnw", V: "nwwnnnnnw",
  W: "wwwnnnnnn", X: "nwnnwnnnw", Y: "wwnnwnnnn", Z: "nwwnwnnnn",
  "-": "nwnnnnwnw", ".": "wwnnnnwnn", " ": "nwwnnnwnn", $: "nwnwnwnnn",
  "/": "nwnwnnnwn", "+": "nwnnnwnwn", "%": "nnnwnwnwn", "*": "nwnnwnwnn",
};

function drawBookingBarcode(doc, value, x, y, maxWidth, height) {
  const characters = `*${value.toUpperCase()}*`;
  const patterns = [...characters].map((character) => barcodePatterns[character]);
  if (patterns.some((pattern) => !pattern)) return;

  const moduleCount = patterns.reduce(
    (sum, pattern) => sum + [...pattern].reduce((width, part) => width + (part === "w" ? 3 : 1), 0),
    characters.length - 1
  );
  const narrowWidth = maxWidth / moduleCount;
  let position = x;
  doc.setFillColor(30, 30, 30);
  patterns.forEach((pattern, characterIndex) => {
    [...pattern].forEach((width, index) => {
      const barWidth = narrowWidth * (width === "w" ? 3 : 1);
      if (index % 2 === 0) doc.rect(position, y, barWidth, height, "F");
      position += barWidth;
    });
    if (characterIndex < patterns.length - 1) position += narrowWidth;
  });
}

async function getLogoDataUrl(logoUrl) {
  if (!logoUrl) return null;

  const response = await fetch(logoUrl);
  if (!response.ok) throw new Error("Airline logo could not be loaded for the PDF.");
  const imageBlob = await response.blob();
  const objectUrl = URL.createObjectURL(imageBlob);

  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("The airline logo could not be prepared for the PDF.");
    context.drawImage(image, 0, 0);
    return {
      dataUrl: canvas.toDataURL("image/png"),
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function createBookingPdf(booking, airlineLogo) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const details = booking.ticketDetails;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 13;
  const contentWidth = pageWidth - margin * 2;
  const bookingReference = booking._id.slice(-8).toUpperCase();
  const dateText = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Not provided"
      : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };
  const money = (value) =>
    `${pdfText(details.currency || "SAR")} ${Number(value || 0).toLocaleString("en-US")}`;
  const colors = {
    blue: [43, 91, 184],
    ink: [25, 31, 39],
    muted: [95, 103, 112],
    border: [95, 95, 95],
  };
  const setColor = (name) => doc.setTextColor(...colors[name]);

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  if (airlineLogo) {
    const scale = Math.min(43 / airlineLogo.width, 25 / airlineLogo.height);
    const logoWidth = airlineLogo.width * scale;
    const logoHeight = airlineLogo.height * scale;
    doc.addImage(
      airlineLogo.dataUrl,
      "PNG",
      margin + (43 - logoWidth) / 2,
      7 + (25 - logoHeight) / 2,
      logoWidth,
      logoHeight,
      undefined,
      "FAST"
    );
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    setColor("ink");
    doc.text(pdfText(details.airline || "Airline"), margin, 19);
  }

  const topRight = pageWidth - margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  setColor("ink");
  doc.text("Travel Itinerary", topRight, 12, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  setColor("ink");
  doc.text(`Booking reference: ${bookingReference}`, topRight, 18, { align: "right" });
  drawBookingBarcode(doc, bookingReference, topRight - 48, 21, 48, 8);
  doc.setFontSize(9);
  setColor("muted");
  doc.text("Booking reference barcode - not airline PNR", topRight, 33, { align: "right" });
  doc.setDrawColor(...colors.blue);
  doc.setLineWidth(0.7);
  doc.line(margin, 39, pageWidth - margin, 39);

  let y = 48;

  const tableColumns = [
    { label: "TYPE", width: 20 },
    { label: "PASSENGER NAME", width: 78 },
    { label: "DATE OF BIRTH", width: 35 },
    { label: "PASSPORT", width: 38 },
    { label: "BAGGAGE", width: 54 },
    { label: "TICKET NO.", width: contentWidth - 225 },
  ];
  const drawPassengerTableHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    setColor("ink");
    let x = margin + 2;
    tableColumns.forEach((column) => {
      doc.text(column.label, x, y + 5.5);
      x += column.width;
    });
    doc.setDrawColor(35, 35, 35);
    doc.setLineWidth(0.45);
    doc.line(margin, y + 9, pageWidth - margin, y + 9);
    y += 9;
  };
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  setColor("ink");
  doc.text("Passenger details", margin, y - 2);
  y += 1;
  drawPassengerTableHeader();
  booking.passengers.forEach((passenger, index) => {
    const values = [
      passenger.type === "adult" ? "ADLT" : passenger.type === "child" ? "CHD" : "INFT",
      `${passenger.title} ${passenger.firstName} ${passenger.lastName}`,
      dateText(passenger.dateOfBirth),
      passenger.passportNumber || "Not provided",
      details.baggage || "Not specified",
      "Not issued",
    ];
    const rows = values.map((value, columnIndex) =>
      doc.splitTextToSize(pdfText(value), tableColumns[columnIndex].width - 4)
    );
    const rowHeight = Math.max(14, ...rows.map((parts) => parts.length * 4.8 + 5));
    if (y + rowHeight > pageHeight - 23) {
      doc.addPage();
      y = 20;
      drawPassengerTableHeader();
    }
    doc.setDrawColor(...colors.border);
    doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    setColor("ink");
    let x = margin + 2.5;
    rows.forEach((parts, columnIndex) => {
      doc.text(parts, x, y + 5);
      x += tableColumns[columnIndex].width;
    });
    y += rowHeight;
  });

  y += 8;
  const sectionBottom = pageHeight - 54;
  if (y + 47 > sectionBottom) {
    doc.addPage();
    y = 20;
  }

  doc.setDrawColor(...colors.blue);
  doc.setLineWidth(0.7);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  const airlineCardWidth = 51;
  const gap = 5;
  const routeWidth = (contentWidth - airlineCardWidth - gap * 2) / 2;
  const cardHeight = 43;
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.35);
  doc.roundedRect(margin, y, airlineCardWidth, cardHeight, 4, 4, "S");
  if (airlineLogo) {
    const scale = Math.min(33 / airlineLogo.width, 14 / airlineLogo.height);
    const logoWidth = airlineLogo.width * scale;
    const logoHeight = airlineLogo.height * scale;
    doc.addImage(
      airlineLogo.dataUrl,
      "PNG",
      margin + (airlineCardWidth - logoWidth) / 2,
      y + 3 + (14 - logoHeight) / 2,
      logoWidth,
      logoHeight,
      undefined,
      "FAST"
    );
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setColor("ink");
  doc.text(pdfText(details.airline || "Airline"), margin + airlineCardWidth / 2, y + 24, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(pdfText(details.groupName), margin + airlineCardWidth / 2, y + 30, { align: "center", maxWidth: airlineCardWidth - 5 });
  doc.setFontSize(9.5);
  doc.text(`Ref: ${bookingReference}`, margin + airlineCardWidth / 2, y + 37, { align: "center" });

  const drawRouteCard = (x, routeSegment, isArrival) => {
    doc.setDrawColor(...colors.border);
    doc.roundedRect(x, y, routeWidth, cardHeight, 4, 4, "S");
    const location = isArrival ? routeSegment?.to : routeSegment?.from;
    const time = isArrival ? routeSegment?.arrivalTime : routeSegment?.departureTime;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    setColor("muted");
    doc.text(isArrival ? "ARRIVAL" : "DEPARTURE", x + 5, y + 6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    setColor("ink");
    doc.text(doc.splitTextToSize(pdfText(location || "TBA"), routeWidth - 10), x + 5, y + 13);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setColor("muted");
    doc.text(`Airport: ${pdfText(location || "TBA")}`, x + 5, y + 23, { maxWidth: routeWidth - 10 });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    setColor("ink");
    doc.text(pdfText(time || (isArrival ? "Landing time TBA" : "Departure time TBA")), x + 5, y + 32);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(isArrival ? `Flight ${pdfText(routeSegment?.flightNumber || "TBA")}` : dateText(details.departureDate), x + 5, y + 40);
    if (!isArrival) {
      doc.setFontSize(9);
      doc.text(`Flight ${pdfText(routeSegment?.flightNumber || "TBA")}`, x + routeWidth - 5, y + 40, { align: "right" });
    }
  };

  const segments = details.segments || [];
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  drawRouteCard(margin + airlineCardWidth + gap, firstSegment, false);
  drawRouteCard(margin + airlineCardWidth + gap + routeWidth + gap, lastSegment, true);
  y += cardHeight + 8;

  for (const segment of segments.slice(1, -1)) {
    if (y + 14 > sectionBottom) {
      doc.addPage();
      y = 20;
    }
    doc.setDrawColor(...colors.border);
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, "S");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    setColor("ink");
    doc.text(`${pdfText(segment.from)} -> ${pdfText(segment.to)}`, margin + 4, y + 5);
    doc.text(`Flight ${pdfText(segment.flightNumber)}  |  ${pdfText(segment.departureTime || "Time TBA")} - ${pdfText(segment.arrivalTime || "Time TBA")}`, margin + 75, y + 5);
    doc.text(dateText(details.departureDate), pageWidth - margin - 4, y + 5, { align: "right" });
    y += 15;
  }

  y += 3;
  if (y + 31 > pageHeight - 14) {
    doc.addPage();
    y = 20;
  }
  doc.setDrawColor(...colors.border);
  doc.roundedRect(margin, y, contentWidth, 31, 3, 3, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 102, 255);
  doc.text("Foreign Air Travel", margin + 5, y + 7);
  doc.setFontSize(15);
  setColor("ink");
  doc.text(`TOTAL: ${money(booking.totalPrice)}`, pageWidth - margin - 5, y + 8, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  setColor("ink");
  doc.text("Mobile: +966 59 638 2847  |  0301 7075427", margin + 5, y + 15);
  doc.text("Email: info@foreignairtravel.com", margin + 5, y + 22);
  doc.text("Address: Stayana Road near McDonald's, Faisalabad 38000, Pakistan", margin + 5, y + 28);

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setColor("muted");
    doc.text("Booking itinerary - airline ticket number is not issued by this confirmation.", margin, pageHeight - 8);
    if (pageCount > 1) doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 8, { align: "right" });
  }

  return {
    blob: doc.output("blob"),
    filename: `group-booking-${bookingReference}.pdf`,
  };
}

function StatusBadge({ status }) {
  const colorClass = status === "confirmed" || status === "completed"
    ? "bg-emerald-50 text-emerald-700"
    : status === "cancelled"
      ? "bg-red-50 text-red-700"
      : status === "on_hold"
        ? "bg-amber-50 text-amber-800"
        : "bg-blue-50 text-blue-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colorClass}`}>
      {getStatusLabel(status)}
    </span>
  );
}

export default function BookingsPage() {
  const { getMyGroupBookings, updateMyGroupBookingStatus } = useApp();
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [actionError, setActionError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [viewingBooking, setViewingBooking] = useState(null);
  const [pdfError, setPdfError] = useState("");
  const [openingPdfId, setOpeningPdfId] = useState("");

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setLoadingError("");
    const { ok, data } = await getMyGroupBookings();
    if (ok) setBookings(data.data);
    else setLoadingError(data.message || "Your bookings could not be loaded.");
    setLoading(false);
  }, [getMyGroupBookings]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadBookings(); });
    return () => window.cancelAnimationFrame(frame);
  }, [loadBookings]);

  const openBookingPdfPreview = async (booking) => {
    setPdfError("");
    setOpeningPdfId(booking._id);
    const previewWindow = window.open("", "_blank");
    if (!previewWindow) {
      setPdfError("Your browser blocked the new preview tab. Allow pop-ups for this website and try again.");
      setOpeningPdfId("");
      return;
    }

    previewWindow.opener = null;
    previewWindow.document.write(
      "<!doctype html><html><head><title>Preparing itinerary</title></head><body style=\"font:16px Arial,sans-serif;padding:32px;color:#12314e\">Preparing your itinerary preview...</body></html>"
    );
    previewWindow.document.close();

    try {
      const logoUrl = booking.ticketDetails.airlineLogo;
      const logo = await getLogoDataUrl(logoUrl);
      const { blob, filename } = createBookingPdf(booking, logo);
      const previewUrl = URL.createObjectURL(blob);
      const safeFilename = filename.replace(/[^\w.-]/g, "_");
      previewWindow.document.open();
      previewWindow.document.write(`<!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Travel itinerary - Foreign Air Travel</title>
            <style>
              * { box-sizing: border-box; }
              html, body { width: 100%; height: 100%; margin: 0; font-family: Arial, sans-serif; }
              body { display: flex; flex-direction: column; background: #e8edf3; color: #12314e; }
              header { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 62px; padding: 10px 20px; background: #fff; border-bottom: 1px solid #dbe3ec; }
              h1 { margin: 0; font-size: 16px; }
              p { margin: 4px 0 0; color: #64748b; font-size: 12px; }
              a { border-radius: 8px; padding: 10px 16px; background: #003366; color: #fff; text-decoration: none; font-size: 13px; font-weight: 700; }
              a:hover { background: #ff6b35; }
              iframe { width: 100%; flex: 1; border: 0; }
              @media (max-width: 520px) { header { padding: 9px 12px; } h1 { font-size: 14px; } a { padding: 9px 11px; font-size: 12px; } }
            </style>
          </head>
          <body>
            <header>
              <div><h1>Travel itinerary</h1><p>Review the itinerary, then download your PDF.</p></div>
              <a href="${previewUrl}" download="${safeFilename}">Download PDF</a>
            </header>
            <iframe src="${previewUrl}" title="Travel itinerary PDF preview"></iframe>
          </body>
        </html>`);
      previewWindow.document.close();
      previewWindow.addEventListener("beforeunload", () => URL.revokeObjectURL(previewUrl), { once: true });
    } catch (error) {
      previewWindow.close();
      setPdfError(error.message || "The PDF preview could not be created.");
    } finally {
      setOpeningPdfId("");
    }
  };

  const updateStatus = async (booking, status) => {
    setSavingId(booking._id);
    setActionError("");
    const { ok, data } = await updateMyGroupBookingStatus(booking._id, status);
    if (ok) {
      setBookings((current) => current.map((item) => (
        item._id === booking._id ? { ...item, status } : item
      )));
    } else {
      setActionError(data.message || "Booking status could not be updated.");
    }
    setSavingId("");
  };

  const visibleBookings = statusFilter
    ? bookings.filter((booking) => booking.status === statusFilter)
    : bookings;

  return (
    <div>
      {/* <h1 className="text-2xl font-bold text-[#003366] sm:text-3xl">My Bookings</h1>
      <p className="mt-1 text-sm text-slate-600">Review and manage your group-ticket bookings.</p> */}

      <label className="mt-5 mb-5 block max-w-xs text-sm font-medium text-[#003366]">
        Filter by status
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="dropdown-select mt-1.5 h-11 w-full rounded-xl border border-[#003366]/15 bg-white px-3 text-sm outline-none focus:border-[#FF6B35]"
        >
          <option value="">All statuses</option>
          {bookingStatuses.map((status) => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
      </label>

      {actionError && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </p>
      )}
      {pdfError && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {pdfError}
        </p>
      )}

      {loading ? (
        <div role="status" className="rounded-2xl bg-white p-6 text-sm text-[#003366]/60 shadow-sm">
          Loading your bookings...
        </div>
      ) : loadingError ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{loadingError}</p>
      ) : visibleBookings.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <FiCalendar aria-hidden="true" className="mx-auto size-8 text-[#FF6B35]" />
          <h2 className="mt-3 text-base font-semibold text-[#003366]">
            {bookings.length ? "No bookings in this status" : "No bookings yet"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {bookings.length ? "Choose another status filter to see your bookings." : "Your group-ticket bookings will appear here."}
          </p>
        </div>
      ) : (
        <section aria-label={`${visibleBookings.length} bookings`} className="space-y-4">
          {visibleBookings.map((booking) => {
            const details = booking.ticketDetails;
            const canManage = !["cancelled", "completed"].includes(booking.status);
            return (
              <article key={booking._id} className="min-w-0 rounded-2xl bg-white p-3 shadow-sm sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {details.airlineLogo ? (
                      <img src={details.airlineLogo} alt="" className="size-9 shrink-0 rounded-lg border border-[#003366]/10 object-contain p-1" />
                    ) : (
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#003366]/5 text-sm font-bold text-[#003366]">
                        {details.airline?.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-[#003366]">{details.groupName}</h2>
                      <p className="truncate text-xs text-[#003366]/65">{details.airline} · {details.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={booking.status} />
                    <button
                      type="button"
                      onClick={() => setViewingBooking(booking)}
                      aria-label={`View passenger details for ${details.groupName}`}
                      title="View passenger details"
                      className="grid size-9 place-items-center rounded-lg border border-[#003366]/15 text-[#003366] transition hover:border-[#FF6B35] hover:bg-[#FF6B35]/5 hover:text-[#FF6B35]"
                    >
                      <FiEye aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid gap-x-5 gap-y-2 border-t border-[#003366]/10 pt-3 text-xs sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                  <div className="flex min-w-0 items-center gap-1.5 text-[#003366]/75">
                    <FiCalendar aria-hidden="true" className="shrink-0 text-[#FF6B35]" />
                    <span className="truncate">{formatDate(details.departureDate)}</span>
                  </div>
                  <div className="flex min-w-0 items-center gap-1.5 text-[#003366]/75">
                    <FiClock aria-hidden="true" className="shrink-0 text-[#FF6B35]" />
                    <span className="truncate">{details.segments.map((segment) => segment.departureTime || "Time TBA").join(", ")}</span>
                  </div>
                  <div className="flex min-w-0 items-center gap-1.5 text-[#003366]/75">
                    <FiMapPin aria-hidden="true" className="shrink-0 text-[#FF6B35]" />
                    <span className="truncate">{details.segments.map((segment) => `${segment.from} → ${segment.to}`).join(", ")}</span>
                  </div>
                  <div className="min-w-0 truncate text-[#003366]/75">
                    <span className="font-medium text-[#003366]">Passengers:</span>{" "}
                    {booking.passengerCounts.adults}A · {booking.passengerCounts.children}C · {booking.passengerCounts.infants}I
                  </div>
                  <div className="min-w-0 truncate text-[#003366]/75">
                    <span className="font-medium text-[#003366]">Contact:</span> {booking.contactPhone}
                  </div>
                  <div className="min-w-0 truncate font-semibold text-[#003366]">
                    <span className="font-medium">Total:</span>{" "}
                    {formatFare(details.currency, booking.totalPrice)}
                    {booking.infantPriceOnCall && booking.passengerCounts.infants > 0 && (
                      <span className="ml-1 font-normal text-slate-500">+ infant on call</span>
                    )}
                  </div>
                </div>

                {(canManage || booking.status === "confirmed") && (
                  <div className="mt-3 grid grid-cols-1 gap-2 border-t border-[#003366]/10 pt-3 sm:flex sm:flex-wrap sm:justify-end">
                    {booking.status === "confirmed" && (
                      <button
                        type="button"
                        onClick={() => { void openBookingPdfPreview(booking); }}
                        disabled={openingPdfId === booking._id}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#FF6B35] disabled:cursor-wait disabled:opacity-60"
                      >
                        <FiEye aria-hidden="true" />
                        {openingPdfId === booking._id ? "Preparing preview..." : "Preview itinerary"}
                      </button>
                    )}
                    {canManage && (
                      <>
                    <button
                      type="button"
                      onClick={() => updateStatus(booking, "on_hold")}
                      disabled={savingId === booking._id || booking.status === "on_hold"}
                      className="rounded-lg border border-[#003366]/15 px-4 py-2 text-sm font-semibold text-[#003366] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingId === booking._id ? "Updating..." : "Put on hold"}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(booking, "cancelled")}
                      disabled={savingId === booking._id}
                      className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel booking
                    </button>
                      </>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      {viewingBooking && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-slate-950/55 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setViewingBooking(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-passenger-title"
            className="my-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-[#003366]/10 px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <h2 id="booking-passenger-title" className="truncate text-base font-semibold text-[#003366]">
                  Passenger details
                </h2>
                <p className="truncate text-xs text-[#003366]/60">
                  {viewingBooking.ticketDetails.groupName} · {viewingBooking.passengers.length} passenger(s)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingBooking(null)}
                aria-label="Close passenger details"
                className="grid size-9 shrink-0 place-items-center rounded-lg text-[#003366]/60 hover:bg-slate-100 hover:text-[#003366]"
              >
                <FiX aria-hidden="true" />
              </button>
            </header>
            <div className="max-h-[75dvh] overflow-auto p-3 sm:p-5">
              <div className="overflow-x-auto rounded-xl border border-[#003366]/10">
                <table className="w-full min-w-[920px] border-collapse text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-[#003366]/60">
                    <tr>
                      <th className="px-3 py-2.5 font-semibold">Passenger</th>
                      <th className="px-3 py-2.5 font-semibold">Gender</th>
                      <th className="px-3 py-2.5 font-semibold">Nationality</th>
                      <th className="px-3 py-2.5 font-semibold">Passport</th>
                      <th className="px-3 py-2.5 font-semibold">Date of birth</th>
                      <th className="px-3 py-2.5 font-semibold">Issue date</th>
                      <th className="px-3 py-2.5 font-semibold">Expiry date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#003366]/10 text-[#003366]/80">
                    {viewingBooking.passengers.map((passenger, index) => (
                      <tr key={`${passenger.type}-${index}`}>
                        <td className="whitespace-nowrap px-3 py-3 font-medium text-[#003366]">
                          {passenger.title} {passenger.firstName} {passenger.lastName}
                          <span className="ml-1 text-[#003366]/50">({passenger.type})</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">{passenger.gender}</td>
                        <td className="whitespace-nowrap px-3 py-3">{passenger.nationality}</td>
                        <td className="whitespace-nowrap px-3 py-3">{passenger.passportNumber}</td>
                        <td className="whitespace-nowrap px-3 py-3">{formatDate(passenger.dateOfBirth)}</td>
                        <td className="whitespace-nowrap px-3 py-3">{formatDate(passenger.passportIssueDate)}</td>
                        <td className="whitespace-nowrap px-3 py-3">{formatDate(passenger.passportExpiry)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Submitted {formatDate(viewingBooking.createdAt)}</p>
            </div>
          </section>
        </div>
      )}

    </div>
  );
}
