"use client";

import { useCallback, useEffect, useState } from "react";
import { FiCalendar, FiChevronDown, FiClock, FiEye, FiMapPin, FiX } from "react-icons/fi";
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

const formatDateTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

function createBookingPdf(booking, airlineLogo, includePrice) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
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
  const dateTimeText = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Not provided"
      : date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
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
  doc.setFontSize(20);
  setColor("ink");
  doc.text("Travel Itinerary", topRight, 12, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  setColor("ink");
  doc.text(`Booking reference: ${bookingReference}`, topRight, 18, { align: "right" });
  drawBookingBarcode(doc, bookingReference, topRight - 48, 22, 48, 8);
  doc.setFontSize(10);
  setColor("muted");
  doc.text("Booking reference barcode - not airline PNR", topRight, 34, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setColor("ink");
  doc.text(`Status: ${getStatusLabel(booking.status)}`, topRight, 39, { align: "right" });
  doc.setDrawColor(...colors.blue);
  doc.setLineWidth(0.7);
  doc.line(margin, 47, pageWidth - margin, 47);

  let y = 56;

  const tableWidth = contentWidth - 4;
  const tableColumns = includePrice
    ? [
      { label: "TYPE", width: tableWidth * 0.08 },
      { label: "PASSENGER NAME", width: tableWidth * 0.24 },
      { label: "DATE OF BIRTH", width: tableWidth * 0.13 },
      { label: "PASSPORT", width: tableWidth * 0.16 },
      { label: "BAGGAGE", width: tableWidth * 0.13 },
      { label: "MEAL", width: tableWidth * 0.08 },
      { label: "FARE", width: tableWidth * 0.18 },
    ]
    : [
      { label: "TYPE", width: tableWidth * 0.1 },
      { label: "PASSENGER NAME", width: tableWidth * 0.27 },
      { label: "DATE OF BIRTH", width: tableWidth * 0.16 },
      { label: "PASSPORT", width: tableWidth * 0.18 },
      { label: "BAGGAGE", width: tableWidth * 0.17 },
      { label: "MEAL", width: tableWidth * 0.12 },
    ];
  const drawPassengerTableHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    setColor("ink");
    const headerRows = tableColumns.map((column) =>
      doc.splitTextToSize(column.label, column.width - 4)
    );
    const headerHeight = Math.max(9, ...headerRows.map((rows) => rows.length * 4.5 + 3));
    let x = margin + 2;
    headerRows.forEach((rows, index) => {
      doc.text(rows, x + 2, y + 4.5);
      x += tableColumns[index].width;
    });
    doc.setDrawColor(35, 35, 35);
    doc.setLineWidth(0.45);
    doc.line(margin, y + headerHeight, pageWidth - margin, y + headerHeight);
    y += headerHeight;
  };
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  setColor("ink");
  doc.text("Passenger details", margin, y - 2);
  y += 1;
  drawPassengerTableHeader();
  booking.passengers.forEach((passenger) => {
    const values = [
      passenger.type === "adult" ? "ADLT" : passenger.type === "child" ? "CHD" : "INFT",
      `${passenger.title} ${passenger.firstName} ${passenger.lastName}`,
      dateText(passenger.dateOfBirth),
      passenger.passportNumber || "Not provided",
      details.baggage || "Not specified",
      details.mealAvailable ? "Yes" : "No",
      ...(includePrice
        ? [passenger.type === "infant" && details.infantPriceOnCall
          ? "On call"
          : money(details[`${passenger.type}Fare`])]
        : []),
    ];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const rows = values.map((value, columnIndex) =>
      doc.splitTextToSize(pdfText(value), tableColumns[columnIndex].width - 4)
    );
    const rowHeight = Math.max(17, ...rows.map((parts) => parts.length * 5.5 + 6));
    if (y + rowHeight > pageHeight - 23) {
      doc.addPage();
      y = 20;
      drawPassengerTableHeader();
    }
    doc.setDrawColor(...colors.border);
    doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    setColor("ink");
    let x = margin + 2;
    rows.forEach((parts, columnIndex) => {
      doc.text(parts, x + 2, y + 5.5);
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
  const segments = details.segments || [];
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  const getRouteLayout = (routeSegment, isArrival) => {
    const location = isArrival ? routeSegment?.to : routeSegment?.from;
    const time = isArrival ? routeSegment?.arrivalTime : routeSegment?.departureTime;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    const locationLines = doc.splitTextToSize(pdfText(location || "TBA"), routeWidth - 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const airportLines = doc.splitTextToSize(`Airport: ${pdfText(location || "TBA")}`, routeWidth - 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12.5);
    const timeLines = doc.splitTextToSize(
      pdfText(time || (isArrival ? "Landing time TBA" : "Departure time TBA")),
      routeWidth - 10
    );
    const airportY = 15 + locationLines.length * 6.5;
    const timeY = airportY + airportLines.length * 4.2 + 4;
    const detailY = timeY + timeLines.length * 5.2 + 2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const detailWidth = isArrival ? routeWidth - 10 : (routeWidth - 14) / 2;
    const dateLines = isArrival ? [] : doc.splitTextToSize(dateText(details.departureDate), detailWidth);
    const flightLines = doc.splitTextToSize(`Flight ${pdfText(routeSegment?.flightNumber || "TBA")}`, detailWidth);
    return {
      locationLines,
      airportLines,
      timeLines,
      dateLines,
      flightLines,
      airportY,
      timeY,
      detailY,
      detailLineCount: isArrival ? flightLines.length : Math.max(dateLines.length, flightLines.length),
    };
  };
  const routeLayouts = [
    getRouteLayout(firstSegment, false),
    getRouteLayout(lastSegment, true),
  ];
  const cardHeight = Math.max(
    50,
    ...routeLayouts.map((layout) => layout.detailY + layout.detailLineCount * 4 + 5)
  );
  if (y + Math.max(47, cardHeight) > sectionBottom) {
    doc.addPage();
    y = 20;
  }
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
  doc.setFontSize(12);
  setColor("ink");
  doc.text(pdfText(details.airline || "Airline"), margin + airlineCardWidth / 2, y + 24, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(pdfText(details.groupName), margin + airlineCardWidth / 2, y + 30, { align: "center", maxWidth: airlineCardWidth - 5 });
  doc.setFontSize(10.5);
  doc.text(`Ref: ${bookingReference}`, margin + airlineCardWidth / 2, y + 42, { align: "center" });

  const drawRouteCard = (x, routeSegment, isArrival, layout) => {
    doc.setDrawColor(...colors.border);
    doc.roundedRect(x, y, routeWidth, cardHeight, 4, 4, "S");
    const location = isArrival ? routeSegment?.to : routeSegment?.from;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    setColor("muted");
    doc.text(isArrival ? "ARRIVAL" : "DEPARTURE", x + 5, y + 6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    setColor("ink");
    doc.text(layout.locationLines, x + 5, y + 13);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    setColor("muted");
    doc.text(layout.airportLines, x + 5, y + layout.airportY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12.5);
    setColor("ink");
    doc.text(layout.timeLines, x + 5, y + layout.timeY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    if (isArrival) {
      doc.text(layout.flightLines, x + 5, y + layout.detailY);
    } else {
      const detailWidth = (routeWidth - 14) / 2;
      doc.text(layout.dateLines, x + 5, y + layout.detailY);
      doc.text(layout.flightLines, x + 9 + detailWidth, y + layout.detailY);
    }
  };

  drawRouteCard(margin + airlineCardWidth + gap, firstSegment, false, routeLayouts[0]);
  drawRouteCard(margin + airlineCardWidth + gap + routeWidth + gap, lastSegment, true, routeLayouts[1]);
  y += cardHeight + 8;

  for (const segment of segments.slice(1, -1)) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    setColor("ink");
    const segmentRouteLines = doc.splitTextToSize(
      `${pdfText(segment.from)} -> ${pdfText(segment.to)}`,
      contentWidth - 8
    );
    const segmentFlightLines = doc.splitTextToSize(
      `Flight ${pdfText(segment.flightNumber)}  |  ${pdfText(segment.departureTime || "Time TBA")} - ${pdfText(segment.arrivalTime || "Time TBA")}`,
      contentWidth - 8
    );
    const segmentCardHeight = Math.max(
      24,
      7 + (segmentRouteLines.length + segmentFlightLines.length + 1) * 4.5
    );
    if (y + segmentCardHeight > sectionBottom) {
      doc.addPage();
      y = 20;
    }
    doc.setDrawColor(...colors.border);
    doc.roundedRect(margin, y, contentWidth, segmentCardHeight, 2, 2, "S");
    doc.text(segmentRouteLines, margin + 4, y + 6);
    const flightY = y + 6 + segmentRouteLines.length * 4.5;
    doc.text(segmentFlightLines, margin + 4, flightY);
    doc.text(
      dateText(details.departureDate),
      margin + 4,
      flightY + segmentFlightLines.length * 4.5
    );
    y += segmentCardHeight + 3;
  }

  y += 3;
  if (y + 31 > pageHeight - 14) {
    doc.addPage();
    y = 20;
  }
  doc.setDrawColor(...colors.border);
  doc.roundedRect(margin, y, contentWidth, 31, 3, 3, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(0, 102, 255);
  doc.text("Foreign Air Travel", margin + 5, y + 7);
  if (includePrice) {
    doc.setFontSize(16);
    setColor("ink");
    doc.text(`TOTAL: ${money(booking.totalPrice)}`, pageWidth - margin - 5, y + 8, { align: "right" });
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  setColor("ink");
  doc.text("Mobile: +966 59 638 2847  |  0301 7075427", margin + 5, y + 15);
  doc.setFontSize(10);
  doc.text(`Reserved at: ${dateTimeText(booking.createdAt)}`, pageWidth - margin - 5, y + 15, { align: "right" });
  doc.text("Email: info@foreignairtravel.com", margin + 5, y + 22);
  if (booking.confirmedAt) {
    doc.text(`Confirmed at: ${dateTimeText(booking.confirmedAt)}`, pageWidth - margin - 5, y + 22, { align: "right" });
  }
  doc.text("Address: Stayana Road near McDonald's, Faisalabad 38000, Pakistan", margin + 5, y + 28);

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    setColor("muted");
    doc.text(`Booking confirmation - reference ${bookingReference}`, margin, pageHeight - 8);
    if (pageCount > 1) doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 8, { align: "right" });
  }

  return {
    blob: doc.output("blob"),
    filename: `group-booking-${bookingReference}-${includePrice ? "with-price" : "without-price"}.pdf`,
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
    <span className={`inline-block max-w-full break-words rounded-full px-2 py-1.5 text-sm font-semibold leading-tight xl:px-1.5 xl:text-xs ${colorClass}`}>
      {getStatusLabel(status)}
    </span>
  );
}

function getConfirmedPassengerCounts(booking) {
  const counts = booking.passengerCounts || {};
  const confirmed = booking.status === "confirmed" || booking.status === "completed";
  const adults = confirmed ? Number(counts.adults || 0) : 0;
  const children = confirmed ? Number(counts.children || 0) : 0;
  const infants = confirmed ? Number(counts.infants || 0) : 0;
  return { adults, children, infants, total: adults + children + infants };
}

function getAutoCancellationDate(booking) {
  if (booking.autoCancelledAt) return booking.autoCancelledAt;
  if (
    booking.status === "cancelled" &&
    !booking.confirmedAt &&
    booking.expiresAt &&
    new Date(booking.updatedAt) >= new Date(booking.expiresAt)
  ) {
    return booking.updatedAt;
  }
  return null;
}

function BookingActions({ booking, openingPdfId, onView, onPreview }) {
  return (
    <div className="flex w-full flex-col items-stretch gap-2 2xl:w-fit 2xl:items-start">
      <button
        type="button"
        onClick={() => onView(booking)}
        aria-label={`View booking ${booking._id.slice(-8).toUpperCase()}`}
        title="View booking"
        className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-2 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-emerald-700 2xl:w-fit"
      >
        <FiEye aria-hidden="true" />
        View
      </button>
      {booking.status === "confirmed" && (
        <>
          <button
            type="button"
            onClick={() => onPreview(booking, true)}
            disabled={openingPdfId === `${booking._id}-with-price`}
            className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-[#003366] px-2.5 py-2 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-[#FF6B35] disabled:cursor-not-allowed disabled:opacity-60 2xl:w-fit"
          >
            <FiEye aria-hidden="true" />
            {openingPdfId === `${booking._id}-with-price` ? "Preparing..." : "Invoice"}
          </button>
          <button
            type="button"
            onClick={() => onPreview(booking, false)}
            disabled={openingPdfId === `${booking._id}-without-price`}
            aria-label="Preview invoice without price"
            title="Invoice without price"
            className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-1 rounded-lg border border-[#003366]/20 px-2.5 py-2 text-sm font-semibold whitespace-nowrap text-[#003366] transition hover:border-[#FF6B35] hover:text-[#FF6B35] disabled:cursor-not-allowed disabled:opacity-60 2xl:w-fit"
          >
            <FiEye aria-hidden="true" />
            {openingPdfId === `${booking._id}-without-price` ? "Preparing..." : "No price"}
          </button>
        </>
      )}
    </div>
  );
}

export default function BookingsPage() {
  const { getMyGroupBookings, getGroupTicketCategories, updateMyGroupBookingStatus } = useApp();
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryLoadError, setCategoryLoadError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
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
    const [bookingResult, categoryResult] = await Promise.all([
      getMyGroupBookings(),
      getGroupTicketCategories(),
    ]);
    if (bookingResult.ok) setBookings(bookingResult.data.data);
    else setLoadingError(bookingResult.data.message || "Your bookings could not be loaded.");
    if (categoryResult.ok) {
      setCategories(categoryResult.data.data);
      setCategoryLoadError("");
    } else {
      setCategoryLoadError(categoryResult.data.message || "Group categories could not be loaded.");
    }
    setLoading(false);
  }, [getGroupTicketCategories, getMyGroupBookings]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadBookings(); });
    return () => window.cancelAnimationFrame(frame);
  }, [loadBookings]);

  const openBookingPdfPreview = async (booking, includePrice) => {
    setPdfError("");
    setOpeningPdfId(`${booking._id}-${includePrice ? "with-price" : "without-price"}`);
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
      const { blob, filename } = createBookingPdf(booking, logo, includePrice);
      const previewUrl = URL.createObjectURL(blob);
      const safeFilename = filename.replace(/[^\w.-]/g, "_");
      previewWindow.document.open();
      previewWindow.document.write(`<!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Travel itinerary ${includePrice ? "with price" : "without price"} - Foreign Air Travel</title>
            <style>
              * { box-sizing: border-box; }
              html, body { width: 100%; height: 100%; margin: 0; font-family: Arial, sans-serif; }
              body { display: flex; flex-direction: column; background: #e8edf3; color: #12314e; }
              header { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 62px; padding: 10px 20px; background: #fff; border-bottom: 1px solid #dbe3ec; }
              h1 { margin: 0; font-size: 16px; }
              p { margin: 4px 0 0; color: #64748b; font-size: 12px; }
              a { border-radius: 8px; padding: 10px 16px; background: #003366; color: #fff; text-decoration: none; font-size: 13px; font-weight: 700; cursor: pointer; }
              a:hover { background: #ff6b35; }
              iframe { width: 100%; flex: 1; border: 0; }
              @media (max-width: 520px) { header { padding: 9px 12px; } h1 { font-size: 14px; } a { padding: 9px 11px; font-size: 12px; } }
            </style>
          </head>
          <body>
            <header>
              <div><h1>Travel itinerary ${includePrice ? "with price" : "without price"}</h1><p>Review the itinerary, then download your PDF.</p></div>
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

  const categoryOptions = [...new Set([
    ...categories.map((category) => category.name),
    ...bookings.map((booking) => booking.ticketDetails.category),
  ].filter(Boolean))]
    .sort((first, second) => first.localeCompare(second));
  const visibleBookings = bookings.filter((booking) => {
    if (statusFilter && booking.status !== statusFilter) return false;
    if (categoryFilter && booking.ticketDetails.category !== categoryFilter) return false;
    const createdAt = new Date(booking.createdAt);
    if (!Number.isNaN(createdAt.getTime())) {
      const bookingDate = [
        createdAt.getFullYear(),
        String(createdAt.getMonth() + 1).padStart(2, "0"),
        String(createdAt.getDate()).padStart(2, "0"),
      ].join("-");
      if (dateFrom && bookingDate < dateFrom) return false;
      if (dateTo && bookingDate > dateTo) return false;
    }
    return true;
  });

  const openInvoicePreview = (booking, includePrice) => {
    void openBookingPdfPreview(booking, includePrice);
  };

  return (
    <div>
      {/* <h1 className="text-2xl font-bold text-[#003366] sm:text-3xl">My Bookings</h1>
      <p className="mt-1 text-sm text-slate-600">Review and manage your group-ticket bookings.</p> */}

      <div
        className="mt-5 mb-6 grid gap-4 rounded-2xl bg-[#003366] p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-4"
      >
        <label className="block text-sm font-semibold text-white">
          Booking Date From
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="mt-2 h-11 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-[#12314e] outline-none focus:border-[#FF6B35]"
          />
        </label>
        <label className="block text-sm font-semibold text-white">
          Booking Date To
          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className="mt-2 h-11 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-[#12314e] outline-none focus:border-[#FF6B35]"
          />
        </label>
        <label className="block text-sm font-semibold text-white">
          Group Category
          <span className="relative mt-2 block">
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm font-normal text-[#12314e] outline-none focus:border-[#FF6B35]"
            >
              <option value="">All categories</option>
              {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <FiChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#12314e]" />
          </span>
        </label>
        <label className="block text-sm font-semibold text-white">
          Status
          <span className="relative mt-2 block">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm font-normal text-[#12314e] outline-none focus:border-[#FF6B35]"
            >
              <option value="">All statuses</option>
              {bookingStatuses.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
            <FiChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#12314e]" />
          </span>
        </label>
      </div>
      {categoryLoadError && (
        <p role="alert" className="-mt-3 mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {categoryLoadError}
        </p>
      )}

      {actionError && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-base text-red-700">
          {actionError}
        </p>
      )}
      {pdfError && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-base text-red-700">
          {pdfError}
        </p>
      )}

      {loading ? (
        <div role="status" className="rounded-2xl bg-white p-6 text-base text-[#003366]/70 shadow-sm">
          Loading your bookings...
        </div>
      ) : loadingError ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-base text-red-700">{loadingError}</p>
      ) : visibleBookings.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <FiCalendar aria-hidden="true" className="mx-auto size-8 text-[#FF6B35]" />
          <h2 className="mt-3 text-lg font-semibold text-[#003366]">
            {bookings.length ? "No bookings match these filters" : "No bookings yet"}
          </h2>
          <p className="mt-1 text-base text-slate-600">
            {bookings.length ? "Change the selected filters to see your bookings." : "Your group-ticket bookings will appear here."}
          </p>
        </div>
      ) : (
        <section aria-label={`${visibleBookings.length} bookings`}>
          <div className="no-scrollbar overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-sm">
            <table className="w-full min-w-[1480px] table-fixed border-collapse border border-slate-300 text-left text-base xl:min-w-0 [&_td]:border [&_td]:border-slate-300 [&_th]:border [&_th]:border-slate-300">
              <thead className="bg-[#003366] text-base font-semibold text-white">
                <tr>
                  <th className="w-[4%] px-3 py-3">Sr #</th>
                  <th className="w-[14%] px-3 py-3">Booking No</th>
                  <th className="w-[21%] px-3 py-3">Group</th>
                  <th className="w-[25%] px-3 py-3">Passenger</th>
                  <th className="w-[10%] px-3 py-3">Total Price</th>
                  <th className="w-[10%] px-2 py-3 xl:w-[9%] xl:px-1.5">Status</th>
                  <th className="w-[16%] px-2 py-3 xl:w-[14%] xl:px-1.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm text-[#12314e]">
                {visibleBookings.map((booking, index) => {
                  const details = booking.ticketDetails;
                  const requested = booking.passengerCounts || {};
                  const confirmed = getConfirmedPassengerCounts(booking);
                  const autoCancelledAt = getAutoCancellationDate(booking);
                  return (
                    <tr key={booking._id} className="align-top even:bg-slate-50/60">
                      <td className="px-3 py-4">{index + 1}</td>
                      <td className="break-words px-3 py-4">
                        <p className="font-bold">BK-{booking._id.slice(-8).toUpperCase()}</p>
                        <p className="mt-1 text-sm text-slate-600">Created: {formatDateTime(booking.createdAt)}</p>
                        <p className="mt-2 inline-flex max-w-full rounded bg-[#003366] px-2 py-1 text-xs font-semibold text-white">
                          {details.category || "Group ticket"}
                        </p>
                        {autoCancelledAt && (
                          <p className="mt-2 break-words text-sm font-semibold text-red-700">
                            Auto Cancelled on: {formatDateTime(autoCancelledAt)}
                          </p>
                        )}
                        {booking.status === "cancelled" && !autoCancelledAt && (
                          <p className="mt-2 text-sm font-semibold text-red-700">Cancelled</p>
                        )}
                      </td>
                      <td className="break-words px-3 py-4">
                        <p className="font-semibold">{details.airline}</p>
                        <p className="mt-1 text-base font-bold">{details.groupName}</p>
                        <div className="mt-2 space-y-2">
                          {details.segments.map((segment, segmentIndex) => (
                            <div key={`${segment.flightNumber}-${segmentIndex}`} className="break-words rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                              <p className="font-semibold text-[#003366]">{segment.from} → {segment.to}</p>
                              <p className="mt-1 text-sm text-slate-700">Flight: {segment.flightNumber}</p>
                              <p className="mt-1 text-sm text-slate-700">
                                Time: {segment.departureTime || "TBA"} – {segment.arrivalTime || "TBA"}
                              </p>
                            </div>
                          ))}
                        </div>
                        <p className="mt-2 text-sm text-slate-700">Departure: {formatDate(details.departureDate)}</p>
                        <p className="mt-1 text-sm text-slate-700">Baggage: {details.baggage}</p>
                        <p className="mt-1 text-sm text-slate-700">Meal: {details.mealAvailable ? "Yes" : "No"}</p>
                        <p className="mt-1 break-words text-sm text-slate-700">Contact: {booking.contactPhone}</p>
                      </td>
                      <td className="px-3 py-4">
                        <table className="w-full table-fixed border-collapse text-sm">
                          <thead className="bg-slate-100 text-[#12314e]">
                            <tr>
                              <th className="break-words border border-slate-300 px-1.5 py-2 text-left">Status</th>
                              <th className="border border-slate-300 px-1 py-2">Adults</th>
                              <th className="border border-slate-300 px-1 py-2">Child</th>
                              <th className="border border-slate-300 px-1 py-2">Infant</th>
                              <th className="border border-slate-300 px-1 py-2">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <th className="border border-slate-300 px-1.5 py-2 text-left font-semibold text-red-700">Req</th>
                              <td className="border border-slate-300 px-1 py-2">{Number(requested.adults || 0)}</td>
                              <td className="border border-slate-300 px-1 py-2">{Number(requested.children || 0)}</td>
                              <td className="border border-slate-300 px-1 py-2">{Number(requested.infants || 0)}</td>
                              <td className="border border-slate-300 px-1 py-2">{Number(requested.adults || 0) + Number(requested.children || 0) + Number(requested.infants || 0)}</td>
                            </tr>
                            <tr>
                              <th className="border border-slate-300 px-1.5 py-2 text-left font-semibold text-emerald-700">Cnf</th>
                              <td className="border border-slate-300 px-1 py-2">{confirmed.adults}</td>
                              <td className="border border-slate-300 px-1 py-2">{confirmed.children}</td>
                              <td className="border border-slate-300 px-1 py-2">{confirmed.infants}</td>
                              <td className="border border-slate-300 px-1 py-2">{confirmed.total}</td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                      <td className="break-words px-3 py-4 font-semibold text-emerald-800">{formatFare(details.currency, booking.totalPrice)}</td>
                      <td className="min-w-0 overflow-hidden px-2 py-4 xl:px-1.5">
                        <StatusBadge status={booking.status} />
                        {booking.confirmedAt && (
                          <p className="mt-2 break-words text-sm text-slate-600">Confirmed: {formatDateTime(booking.confirmedAt)}</p>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <BookingActions
                          booking={booking}
                          openingPdfId={openingPdfId}
                          onView={setViewingBooking}
                          onPreview={openInvoicePreview}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="hidden">
            {visibleBookings.map((booking, index) => {
              const details = booking.ticketDetails;
              const requested = booking.passengerCounts || {};
              const confirmed = getConfirmedPassengerCounts(booking);
              return (
                <article key={booking._id} className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-3 bg-[#003366] px-4 py-3 text-white">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-300">Sr # {index + 1} · Booking No</p>
                      <p className="mt-1 break-all text-base font-bold">BK-{booking._id.slice(-8).toUpperCase()}</p>
                      <p className="mt-1 text-sm text-slate-200">Created: {formatDateTime(booking.createdAt)}</p>
                      <p className="mt-2 inline-flex max-w-full rounded bg-white px-2 py-1 text-xs font-semibold text-[#003366]">
                        {details.category || "Group ticket"}
                      </p>
                      {booking.autoCancelledAt && (
                        <p className="mt-2 break-words text-sm font-semibold text-red-200">
                          Auto cancelled: {formatDateTime(booking.autoCancelledAt)}
                        </p>
                      )}
                      {booking.status === "cancelled" && !booking.autoCancelledAt && (
                        <p className="mt-2 text-sm font-semibold text-red-200">Cancelled</p>
                      )}
                      {booking.confirmedAt && (
                        <p className="mt-2 break-words text-sm text-slate-200">Confirmed: {formatDateTime(booking.confirmedAt)}</p>
                      )}
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  <dl className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Booked</dt>
                      <dd className="mt-1 text-sm">{formatDate(booking.createdAt)}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Group</dt>
                      <dd className="mt-1 break-words text-sm font-semibold">{details.airline}</dd>
                      <dd className="mt-1 break-words text-base font-bold">{details.groupName}</dd>
                      {details.segments.map((segment, segmentIndex) => (
                        <dd key={`${segment.flightNumber}-${segmentIndex}`} className="mt-2 break-words rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm">
                          <span className="font-semibold">{segment.from} → {segment.to}</span>
                          <span className="mt-1 block">Flight: {segment.flightNumber}</span>
                          <span className="mt-1 block">Time: {segment.departureTime || "TBA"} – {segment.arrivalTime || "TBA"}</span>
                        </dd>
                      ))}
                      <dd className="mt-1 text-sm text-slate-600">Departure: {formatDate(details.departureDate)}</dd>
                      <dd className="mt-1 break-words text-sm text-slate-600">Baggage: {details.baggage}</dd>
                      <dd className="mt-1 break-words text-sm text-slate-600">Meal: {details.mealAvailable ? "Yes" : "No"}</dd>
                      <dd className="mt-1 break-words text-sm text-slate-600">Contact: {booking.contactPhone}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Passenger</dt>
                      <div className="grid grid-cols-5 rounded-lg border border-slate-300 text-center text-xs">
                        <span className="bg-slate-100 p-2 text-left font-semibold">Status</span>
                        <span className="bg-slate-100 p-2 font-semibold">Adults</span>
                        <span className="bg-slate-100 p-2 font-semibold">Child</span>
                        <span className="bg-slate-100 p-2 font-semibold">Infant</span>
                        <span className="bg-slate-100 p-2 font-semibold">Total</span>
                        <span className="border-t border-slate-200 p-2 text-left font-semibold text-red-700">Req</span>
                        <span className="border-t border-slate-200 p-2">{Number(requested.adults || 0)}</span>
                        <span className="border-t border-slate-200 p-2">{Number(requested.children || 0)}</span>
                        <span className="border-t border-slate-200 p-2">{Number(requested.infants || 0)}</span>
                        <span className="border-t border-slate-200 p-2">{Number(requested.adults || 0) + Number(requested.children || 0) + Number(requested.infants || 0)}</span>
                        <span className="border-t border-slate-200 p-2 text-left font-semibold text-emerald-700">Cnf</span>
                        <span className="border-t border-slate-200 p-2">{confirmed.adults}</span>
                        <span className="border-t border-slate-200 p-2">{confirmed.children}</span>
                        <span className="border-t border-slate-200 p-2">{confirmed.infants}</span>
                        <span className="border-t border-slate-200 p-2">{confirmed.total}</span>
                      </div>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Price</dt>
                      <dd className="mt-1 text-base font-semibold text-[#12314e]">{formatFare(details.currency, booking.totalPrice)}</dd>
                    </div>
                  </dl>
                  <div className="border-t border-slate-200 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Action</p>
                    <BookingActions
                      booking={booking}
                      openingPdfId={openingPdfId}
                      onView={setViewingBooking}
                      onPreview={openInvoicePreview}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {viewingBooking && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-slate-950/55 p-2 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setViewingBooking(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-passenger-title"
            className="my-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[90dvh]"
          >
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#003366]/10 px-4 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <h2 id="booking-passenger-title" className="truncate text-lg font-semibold text-[#003366] sm:text-xl">
                  Passenger details
                </h2>
                <p className="mt-1 truncate text-sm text-[#003366]/65">
                  {viewingBooking.ticketDetails.groupName} · {viewingBooking.passengers.length} passenger(s)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingBooking(null)}
                aria-label="Close passenger details"
                className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-lg text-lg text-[#003366]/60 hover:bg-slate-100 hover:text-[#003366]"
              >
                <FiX aria-hidden="true" />
              </button>
            </header>
            <div className="min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-5">
              <div className="grid gap-3 lg:hidden">
                {viewingBooking.passengers.map((passenger, index) => (
                  <article
                    key={`${passenger.type}-${index}`}
                    className="rounded-xl border border-[#003366]/10 bg-white p-4 shadow-sm"
                  >
                    <h3 className="break-words text-base font-semibold text-[#003366]">
                      {passenger.title} {passenger.firstName} {passenger.lastName}
                      <span className="ml-1.5 text-sm font-medium capitalize text-[#003366]/55">
                        ({passenger.type})
                      </span>
                    </h3>
                    <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3">
                      {[
                        ["Gender", passenger.gender],
                        ["Nationality", passenger.nationality],
                        ["Passport", passenger.passportNumber],
                        ["Date of birth", formatDate(passenger.dateOfBirth)],
                        ["Issue date", formatDate(passenger.passportIssueDate)],
                        ["Expiry date", formatDate(passenger.passportExpiry)],
                      ].map(([label, value]) => (
                        <div key={label} className="min-w-0">
                          <dt className="inline-block rounded bg-[#003366] px-2 py-1 text-xs font-semibold text-white">{label}</dt>
                          <dd className="mt-0.5 break-words text-sm font-medium leading-5 text-[#003366]">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </article>
                ))}
              </div>
              <div className="hidden overflow-hidden rounded-xl border border-[#003366]/10 lg:block">
                <table className="w-full table-fixed border-collapse text-left text-sm">
                  <thead className="border-b-2 border-[#FF6B35] bg-[#003366] text-xs uppercase tracking-wide text-white">
                    <tr>
                      <th className="w-[22%] px-3 py-3 font-semibold">Passenger</th>
                      <th className="w-[10%] px-3 py-3 font-semibold">Gender</th>
                      <th className="w-[13%] px-3 py-3 font-semibold">Nationality</th>
                      <th className="w-[15%] px-3 py-3 font-semibold">Passport</th>
                      <th className="w-[14%] px-3 py-3 font-semibold">Date of birth</th>
                      <th className="w-[13%] px-3 py-3 font-semibold">Issue date</th>
                      <th className="w-[13%] px-3 py-3 font-semibold">Expiry date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#003366]/10 text-sm text-[#003366]/80">
                    {viewingBooking.passengers.map((passenger, index) => (
                      <tr key={`${passenger.type}-${index}`}>
                        <td className="break-words px-3 py-3 font-medium text-[#003366]">
                          {passenger.title} {passenger.firstName} {passenger.lastName}
                          <span className="ml-1 text-[#003366]/55">({passenger.type})</span>
                        </td>
                        <td className="break-words px-3 py-3">{passenger.gender}</td>
                        <td className="break-words px-3 py-3">{passenger.nationality}</td>
                        <td className="break-words px-3 py-3">{passenger.passportNumber}</td>
                        <td className="break-words px-3 py-3">{formatDate(passenger.dateOfBirth)}</td>
                        <td className="break-words px-3 py-3">{formatDate(passenger.passportIssueDate)}</td>
                        <td className="break-words px-3 py-3">{formatDate(passenger.passportExpiry)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm text-slate-600">Submitted {formatDate(viewingBooking.createdAt)}</p>
            </div>
          </section>
        </div>
      )}

    </div>
  );
}
