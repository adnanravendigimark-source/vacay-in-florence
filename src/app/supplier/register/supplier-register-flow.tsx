"use client";

import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VacayLogo } from "@/components/ui/vacay-logo";
import { registerSupplierDirectAction } from "./actions";
import { RecaptchaCheckbox, type RecaptchaCheckboxHandle } from "@/components/auth/recaptcha-checkbox";

interface LocationResult {
  id: string;
  title: string;
  subtitle: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  street?: string;
  formattedAddress: string;
}

const BUSINESS_TYPES = [
  "Tour Operator",
  "Activity Provider",
  "Transportation & Transfer",
  "Museum & Historical Landmark",
  "Wine Tasting & Culinary Experience",
  "Travel Agency",
  "Hospitality & Accommodation",
  "Other Experience Provider",
];

const COUNTRIES = [
  "Italy",
  "France",
  "Spain",
  "Germany",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Switzerland",
  "Austria",
  "Netherlands",
  "Belgium",
  "Japan",
  "China",
  "India",
  "United Arab Emirates",
  "Morocco",
  "Turkey",
  "Brazil",
  "Mexico",
  "Egypt",
  "Argentina",
  "Peru",
  "Colombia",
  "Other",
];

const COUNTRY_DIAL_CODES = [
  { code: "+39", label: "Italy (+39)" },
  { code: "+1", label: "US/CA (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+33", label: "France (+33)" },
  { code: "+49", label: "Germany (+49)" },
  { code: "+34", label: "Spain (+34)" },
  { code: "+91", label: "India (+91)" },
  { code: "+971", label: "UAE (+971)" },
  { code: "+41", label: "Switzerland (+41)" },
  { code: "+61", label: "Australia (+61)" },
];

export function SupplierRegisterFlow({
  initialEmail,
  initialError,
}: {
  initialEmail?: string;
  initialError?: string;
}) {
  const router = useRouter();

  // Mode: "hero" (Screen 1 Split Layout) or "wizard" (Screens 2, 3, 4, 5 Multi-step)
  const [mode, setMode] = useState<"wizard" | "hero">("wizard");
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Business Details
    companyName: "",
    businessType: "Tour Operator",
    registrationNumber: "",
    website: "",
    businessAddress: "",
    city: "",
    country: "",
    postalCode: "",

    // Step 2: Contact Details
    name: "",
    email: initialEmail || "",
    phoneDialCode: "+39",
    contactPhone: "",
    sameAddress: true,
    contactCity: "",
    contactCountry: "",

    // Step 3: Additional Information
    about: "",
    documentName: "",
    documentUrl: "",

    // Step 4: Account Setup
    username: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fileDragging, setFileDragging] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<RecaptchaCheckboxHandle>(null);
  const [autoFillBadge, setAutoFillBadge] = useState<string | null>(null);

  // City Search & Autocomplete State
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [cityResults, setCityResults] = useState<LocationResult[]>([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityInputRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  // Close city dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cityInputRef.current && !cityInputRef.current.contains(e.target as Node)) {
        setShowCityDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced City search lookup
  useEffect(() => {
    if (!citySearchQuery.trim() || citySearchQuery.trim().length < 2) {
      setCityResults([]);
      setIsSearchingCity(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingCity(true);
      try {
        const res = await fetch(`/api/location/lookup?q=${encodeURIComponent(citySearchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setCityResults(data.results || []);
          setShowCityDropdown(true);
        }
      } catch (err) {
        console.error("City lookup error:", err);
      } finally {
        setIsSearchingCity(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [citySearchQuery]);

  // When a user selects a city from the autocomplete dropdown
  const handleSelectCity = (loc: LocationResult) => {
    const selectedCity = loc.city || loc.title.split(",")[0];
    const matchedCountry = COUNTRIES.find(
      (c) => c.toLowerCase() === loc.country.toLowerCase()
    ) || (COUNTRIES.includes(loc.country) ? loc.country : "Other");

    setFormData((prev) => ({
      ...prev,
      city: selectedCity,
      country: matchedCountry,
      postalCode: loc.postalCode || prev.postalCode,
    }));

    setCitySearchQuery("");
    setShowCityDropdown(false);
    setAutoFillBadge(`Auto-filled country & postal code (${matchedCountry}, ${loc.postalCode || "N/A"})`);

    setTimeout(() => {
      setAutoFillBadge(null);
    }, 4000);
  };

  // Step 1 Next validation
  const handleStep1Next = () => {
    if (!formData.companyName.trim()) {
      setError("Please enter your business name.");
      return;
    }
    if (!formData.businessAddress.trim()) {
      setError("Please enter your business address.");
      return;
    }
    if (!formData.city.trim()) {
      setError("Please enter your city.");
      return;
    }
    if (!formData.postalCode.trim()) {
      setError("Please enter your postal code / PIN code.");
      return;
    }
    setError(null);
    setCurrentStep(2);
  };

  // Step 2 Next validation
  const handleStep2Next = () => {
    if (!formData.name.trim()) {
      setError("Please enter your contact person full name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!formData.contactPhone.trim()) {
      setError("Please enter your contact phone number.");
      return;
    }
    setError(null);
    setCurrentStep(3);
  };

  // Step 3 Next validation
  const handleStep3Next = () => {
    if (!formData.about.trim()) {
      setError("Please provide a short description about your business and experiences.");
      return;
    }
    if (!formData.documentUrl) {
      setError("Please upload a business document (license, ID, or certification) before continuing.");
      return;
    }
    setError(null);
    setCurrentStep(4);
  };

  // Step 4 Submit
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.password || formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!formData.agreeTerms) {
      setError("You must agree to the Terms & Conditions and Privacy Policy.");
      return;
    }
    if (!recaptchaToken) {
      setError("Please complete the reCAPTCHA verification.");
      return;
    }

    setIsSubmitting(true);

    const fullPhone = formData.contactPhone.startsWith("+")
      ? formData.contactPhone
      : `${formData.phoneDialCode} ${formData.contactPhone}`;

    // "Use same address" (Step 2) lets the applicant give a different
    // contact city/country than the business address entered in Step 1 —
    // when they do, that's the location that should actually be saved,
    // not silently discarded in favor of the business address.
    const effectiveCity = formData.sameAddress ? formData.city : formData.contactCity;
    const effectiveCountry = formData.sameAddress ? formData.country : formData.contactCountry;

    const res = await registerSupplierDirectAction({
      name: formData.name || formData.username || "Supplier Contact",
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      companyName: formData.companyName,
      businessType: formData.businessType,
      registrationNumber: formData.registrationNumber,
      businessAddress: formData.businessAddress,
      city: effectiveCity,
      postalCode: formData.postalCode,
      contactPhone: fullPhone,
      website: formData.website,
      country: effectiveCountry,
      about: formData.about,
      documentName: formData.documentName,
      documentUrl: formData.documentUrl,
      recaptchaToken,
    });

    if (!res.success) {
      setIsSubmitting(false);
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
      setError(res.error || "Could not complete registration. Please try again.");
      return;
    }

    const linkParam = res.verificationLink ? `&link=${encodeURIComponent(res.verificationLink)}` : "";
    router.push(`/supplier/pending?email=${encodeURIComponent(formData.email)}${linkParam}`);
  };

  // Uploads the selected file to blob storage and records the real URL —
  // the dropzone previously only read the file's name/size and discarded
  // the file itself, so nothing an applicant "uploaded" was ever actually
  // saved anywhere for admin to review.
  const uploadDocument = async (file: File) => {
    setError(null);
    setIsUploadingDocument(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/supplier/register-upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not upload that file. Please try again.");
        return;
      }
      updateField("documentName", `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      updateField("documentUrl", data.url as string);
    } catch (err) {
      console.error("Document upload error:", err);
      setError("Could not upload that file. Please check your connection and try again.");
    } finally {
      setIsUploadingDocument(false);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFileDragging(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFileDragging(false);
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFileDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void uploadDocument(e.dataTransfer.files[0]);
    }
  };
  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      void uploadDocument(e.target.files[0]);
    }
  };

  // Quick Hero Register submit handler (Screen 1)
  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      setError("Please enter your business name.");
      return;
    }
    if (!formData.name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Please enter your business email.");
      return;
    }
    setMode("wizard");
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-neutral-900 flex flex-col font-sans">
      {/* ========================================================================= */}
      {/* SCREEN 1: SPLIT HERO REGISTER VIEW (When mode === "hero") */}
      {/* ========================================================================= */}
      {mode === "hero" ? (
        <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row">
          {/* Left Column: Hero Cover */}
          <div className="relative w-full lg:w-1/2 min-h-[420px] lg:min-h-screen bg-[#1b3b36] overflow-hidden flex flex-col justify-between p-8 sm:p-12 lg:p-16 text-white select-none">
            <img
              src="/images/auth-florence-duomo.jpg"
              alt="Florence Cathedral and Renaissance cityscape"
              className="absolute inset-0 h-full w-full object-cover object-center opacity-40 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e211e] via-[#1b3b36]/80 to-[#1b3b36]/60" />

            <div className="relative z-10">
              <VacayLogo variant="light" />
            </div>

            <div className="relative z-10 max-w-lg my-auto py-12">
              <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
                Partner with us
              </h1>
              <p className="text-base sm:text-lg text-emerald-100/90 font-light leading-relaxed mb-8">
                Join our supplier network and showcase your experiences to travelers from around the world.
              </p>

              <div className="space-y-4 text-sm sm:text-base font-medium text-white/95">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-300">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span>Grow your business</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-300">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span>Reach global customers</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-300">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span>Easy booking management</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 text-xs text-emerald-200/60 flex items-center justify-between">
              <span>© VACAY in Florence Official Network</span>
              <button
                type="button"
                onClick={() => setMode("wizard")}
                className="underline hover:text-white transition-colors cursor-pointer"
              >
                Switch to full multi-step wizard &rarr;
              </button>
            </div>
          </div>

          {/* Right Column: Register Form */}
          <div className="w-full lg:w-1/2 flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 md:px-16 lg:px-20 bg-white">
            <div className="w-full max-w-md mx-auto">
              <div className="mb-8">
                <h2 className="font-serif text-3xl font-bold text-[#1b3b36] tracking-tight">
                  Create Supplier Account
                </h2>
                <p className="mt-1.5 text-sm text-neutral-500">
                  Complete your details to get started.
                </p>
              </div>

              {error && (
                <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900">
                  <span className="text-amber-600 font-bold shrink-0">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleHeroSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                    placeholder="Enter business name"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="Enter business email"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.phoneDialCode}
                      onChange={(e) => updateField("phoneDialCode", e.target.value)}
                      className="w-28 rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-800 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none cursor-pointer"
                    >
                      {COUNTRY_DIAL_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => updateField("contactPhone", e.target.value)}
                      placeholder="Enter phone number"
                      className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      placeholder="Create a password"
                      className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 pr-11 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#1b3b36] hover:bg-[#132c28] active:scale-[0.99] text-white py-3.5 text-sm font-semibold shadow-md transition-all cursor-pointer mt-2"
                >
                  Create Account
                </button>

                <p className="text-center text-xs text-neutral-500 pt-3">
                  Already have an account?{" "}
                  <Link
                    href="/supplier/login"
                    className="font-semibold text-[#1b3b36] hover:underline"
                  >
                    Login
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* SCREENS 2, 3, 4, 5: MULTI-STEP WIZARD (When mode === "wizard") */
        /* ========================================================================= */
        <div className="min-h-screen flex flex-col justify-between">
          {/* Top Header */}
          <header className="w-full border-b border-neutral-200/80 bg-white px-6 sm:px-12 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <VacayLogo variant="dark" />
              <div className="flex items-center gap-4">
                <Link
                  href="/supplier/login"
                  className="text-xs sm:text-sm font-medium text-neutral-600 hover:text-[#1b3b36] transition-colors"
                >
                  Already have an account?{" "}
                  <span className="font-semibold text-[#1b3b36] hover:underline">Login</span>
                </Link>
              </div>
            </div>
          </header>

          {/* Stepper Progress Bar */}
          <div className="w-full bg-white border-b border-neutral-100 py-6 sm:py-8 px-4">
            <div className="max-w-3xl mx-auto">
              <div className="relative flex items-center justify-between">
                {/* Connecting Horizontal Line */}
                <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[2px] bg-neutral-200 -z-0" />
                <div
                  className="absolute left-8 top-1/2 -translate-y-1/2 h-[2px] bg-[#1b3b36] transition-all duration-300 -z-0"
                  style={{
                    width: `${((currentStep - 1) / 3) * 100}%`,
                    maxWidth: "calc(100% - 4rem)",
                  }}
                />

                {/* Step 1 */}
                <div className="relative z-10 flex flex-col items-center group">
                  <div
                    className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all shadow-xs ${
                      currentStep >= 1
                        ? "bg-[#1b3b36] text-white ring-4 ring-emerald-50"
                        : "bg-white border-2 border-neutral-300 text-neutral-400"
                    }`}
                  >
                    1
                  </div>
                  <span
                    className={`mt-2 text-[11px] sm:text-xs font-semibold ${
                      currentStep >= 1 ? "text-[#1b3b36]" : "text-neutral-400"
                    }`}
                  >
                    Business Details
                  </span>
                </div>

                {/* Step 2 */}
                <div className="relative z-10 flex flex-col items-center group">
                  <div
                    className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all shadow-xs ${
                      currentStep >= 2
                        ? "bg-[#1b3b36] text-white ring-4 ring-emerald-50"
                        : "bg-white border-2 border-neutral-300 text-neutral-400"
                    }`}
                  >
                    2
                  </div>
                  <span
                    className={`mt-2 text-[11px] sm:text-xs font-semibold ${
                      currentStep >= 2 ? "text-[#1b3b36]" : "text-neutral-400"
                    }`}
                  >
                    Contact Details
                  </span>
                </div>

                {/* Step 3 */}
                <div className="relative z-10 flex flex-col items-center group">
                  <div
                    className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all shadow-xs ${
                      currentStep >= 3
                        ? "bg-[#1b3b36] text-white ring-4 ring-emerald-50"
                        : "bg-white border-2 border-neutral-300 text-neutral-400"
                    }`}
                  >
                    3
                  </div>
                  <span
                    className={`mt-2 text-[11px] sm:text-xs font-semibold ${
                      currentStep >= 3 ? "text-[#1b3b36]" : "text-neutral-400"
                    }`}
                  >
                    Additional Info
                  </span>
                </div>

                {/* Step 4 */}
                <div className="relative z-10 flex flex-col items-center group">
                  <div
                    className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all shadow-xs ${
                      currentStep === 4
                        ? "bg-[#1b3b36] text-white ring-4 ring-emerald-50"
                        : "bg-white border-2 border-neutral-300 text-neutral-400"
                    }`}
                  >
                    4
                  </div>
                  <span
                    className={`mt-2 text-[11px] sm:text-xs font-semibold ${
                      currentStep === 4 ? "text-[#1b3b36]" : "text-neutral-400"
                    }`}
                  >
                    Account Setup
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Container */}
          <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-8 py-10">
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-6 sm:p-10">
              {/* Global Error Banner */}
              {error && (
                <div className="mb-8 flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs sm:text-sm text-amber-900">
                  <span className="text-base leading-none">⚠️</span>
                  <div className="flex-1 font-medium">{error}</div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 1: BUSINESS INFORMATION */}
              {/* ========================================================================= */}
              {currentStep === 1 && (
                <div>
                  <div className="mb-8">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1b3b36]">
                      Business Information
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Tell us about your business or organization.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                          Business Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.companyName}
                          onChange={(e) => updateField("companyName", e.target.value)}
                          placeholder="Enter business name"
                          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                          Business Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.businessType}
                          onChange={(e) => updateField("businessType", e.target.value)}
                          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none cursor-pointer"
                        >
                          {BUSINESS_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                          Company Registration Number
                        </label>
                        <input
                          type="text"
                          value={formData.registrationNumber}
                          onChange={(e) => updateField("registrationNumber", e.target.value)}
                          placeholder="Enter registration number"
                          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                          Website (optional)
                        </label>
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => updateField("website", e.target.value)}
                          placeholder="https://yourwebsite.com"
                          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        Business Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.businessAddress}
                        onChange={(e) => updateField("businessAddress", e.target.value)}
                        placeholder="Enter full address"
                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none"
                      />
                    </div>

                    {/* City, Country, Postal Code Row (With Integrated Auto-Fill Search on City) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {/* CITY INPUT WITH INTEGRATED AUTO-COMPLETE SEARCH */}
                      <div className="relative" ref={cityInputRef}>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                          City <span className="text-red-500">*</span>
                        </label>

                        <div className="relative flex items-center">
                          <input
                            type="text"
                            required
                            value={formData.city}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!val.trim()) {
                                setFormData((prev) => ({
                                  ...prev,
                                  city: "",
                                  country: "",
                                  postalCode: "",
                                }));
                                setCitySearchQuery("");
                                setCityResults([]);
                                setShowCityDropdown(false);
                              } else {
                                updateField("city", val);
                                setCitySearchQuery(val);
                              }
                            }}
                            onFocus={() => {
                              setCitySearchQuery(formData.city);
                              if (cityResults.length > 0) setShowCityDropdown(true);
                            }}
                            placeholder="Enter city"
                            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 pr-8 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none"
                          />

                          {isSearchingCity ? (
                            <span className="absolute right-3 h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#1b3b36] border-t-transparent" />
                          ) : (
                            <span className="absolute right-3 text-xs text-neutral-400 pointer-events-none">
                              🔍
                            </span>
                          )}
                        </div>

                        {/* City Autocomplete Dropdown */}
                        {showCityDropdown && cityResults.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-56 overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-xl py-1.5 divide-y divide-neutral-100">
                            {cityResults.map((loc) => (
                              <button
                                key={loc.id}
                                type="button"
                                onClick={() => handleSelectCity(loc)}
                                className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50/70 transition-colors flex items-start gap-2.5 cursor-pointer group"
                              >
                                <span className="text-emerald-700 text-xs mt-0.5">📍</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-neutral-900 truncate">
                                    {loc.title}
                                  </p>
                                  <p className="text-[11px] text-neutral-500 truncate">
                                    {loc.subtitle}
                                  </p>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-800 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  Select &rarr;
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* COUNTRY (Read-only, automatically populated from City) */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                          Country <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          readOnly
                          tabIndex={-1}
                          value={formData.country}
                          placeholder="Select country"
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50/90 px-4 py-3 text-sm text-neutral-800 font-medium cursor-not-allowed select-none outline-none"
                        />
                      </div>

                      {/* POSTAL CODE INPUT */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                          Postal Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.postalCode}
                          onChange={(e) => updateField("postalCode", e.target.value)}
                          placeholder="Enter postal code"
                          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none"
                        />
                      </div>
                    </div>

                    {/* Subtle Auto-fill confirmation notification */}
                    {autoFillBadge && (
                      <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3.5 py-2 rounded-xl animate-fade-in">
                        <span>✓</span>
                        <span>{autoFillBadge}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-10 pt-6 border-t border-neutral-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setMode("hero")}
                      className="text-xs text-neutral-500 hover:text-neutral-800 transition-colors"
                    >
                      ← Quick view
                    </button>
                    <button
                      type="button"
                      onClick={handleStep1Next}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#1b3b36] hover:bg-[#132c28] text-white px-7 py-3 text-sm font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      <span>Next Step</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 2: CONTACT INFORMATION */}
              {/* ========================================================================= */}
              {currentStep === 2 && (
                <div>
                  <div className="mb-8">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1b3b36]">
                      Contact Information
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Provide your primary contact details.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        Contact Person Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="Enter contact person name"
                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="business@example.com"
                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={formData.phoneDialCode}
                          onChange={(e) => updateField("phoneDialCode", e.target.value)}
                          className="w-32 rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-800 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none cursor-pointer"
                        >
                          {COUNTRY_DIAL_CODES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          required
                          value={formData.contactPhone}
                          onChange={(e) => updateField("contactPhone", e.target.value)}
                          placeholder="Enter phone number"
                          className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none"
                        />
                      </div>
                    </div>

                    {/* Address matching options */}
                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-neutral-700 mb-2">
                        Business Address (same as above?)
                      </label>
                      <label className="flex items-start gap-3 p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100/60 transition-colors cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.sameAddress}
                          onChange={(e) => updateField("sameAddress", e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded text-[#1b3b36] focus:ring-[#1b3b36] accent-[#1b3b36]"
                        />
                        <div className="text-xs text-neutral-700">
                          <span className="font-semibold text-neutral-900">Use same address</span>
                          <p className="text-neutral-500 mt-0.5">
                            You can use the same address and/or enter a different location.
                          </p>
                        </div>
                      </label>
                    </div>

                    {!formData.sameAddress && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                        <div>
                          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.contactCity}
                            onChange={(e) => updateField("contactCity", e.target.value)}
                            placeholder="Enter city"
                            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                            Country <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            readOnly
                            tabIndex={-1}
                            value={formData.contactCountry || formData.country}
                            placeholder="Country"
                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/90 px-4 py-3 text-sm text-neutral-800 font-medium cursor-not-allowed select-none outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-10 pt-6 border-t border-neutral-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 hover:bg-neutral-50 px-6 py-2.5 text-sm font-semibold text-neutral-700 transition-all cursor-pointer"
                    >
                      <span>&larr;</span>
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleStep2Next}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#1b3b36] hover:bg-[#132c28] text-white px-7 py-3 text-sm font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      <span>Next Step</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 3: ADDITIONAL INFORMATION */}
              {/* ========================================================================= */}
              {currentStep === 3 && (
                <div>
                  <div className="mb-8">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1b3b36]">
                      Additional Information
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Help us learn more about your business.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        Business Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={formData.about}
                        onChange={(e) => updateField("about", e.target.value)}
                        placeholder="Tell us about your business, services and experience in Florence..."
                        className="w-full rounded-xl border border-neutral-300 bg-white p-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Upload Business Documents <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-neutral-500 mb-3">
                        Upload required documents (e.g. business license, ID, tour operator certification, etc.)
                      </p>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInputChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="hidden"
                      />

                      <div
                        onDragOver={isUploadingDocument ? undefined : handleDragOver}
                        onDragLeave={isUploadingDocument ? undefined : handleDragLeave}
                        onDrop={isUploadingDocument ? undefined : handleDrop}
                        onClick={() => !isUploadingDocument && fileInputRef.current?.click()}
                        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                          isUploadingDocument
                            ? "cursor-wait border-neutral-300 bg-neutral-50/50"
                            : "cursor-pointer"
                        } ${
                          isUploadingDocument
                            ? ""
                            : fileDragging
                            ? "border-[#1b3b36] bg-emerald-50/50"
                            : formData.documentName
                            ? "border-emerald-500 bg-emerald-50/30"
                            : "border-neutral-300 bg-neutral-50/50 hover:bg-neutral-50 hover:border-neutral-400"
                        }`}
                      >
                        <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 mb-3">
                          {isUploadingDocument ? (
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#1b3b36] border-t-transparent" />
                          ) : (
                            <svg className="w-6 h-6 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                              <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          )}
                        </div>

                        {isUploadingDocument ? (
                          <p className="text-sm font-semibold text-neutral-700">Uploading document…</p>
                        ) : formData.documentName ? (
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-emerald-800 flex items-center justify-center gap-2">
                              <span>✓</span> {formData.documentName}
                            </p>
                            <p className="text-xs text-neutral-500">
                              Click to change or replace file
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-neutral-700">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-neutral-400">
                              PDF, JPG, PNG, DOC (Max 10MB)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 pt-6 border-t border-neutral-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 hover:bg-neutral-50 px-6 py-2.5 text-sm font-semibold text-neutral-700 transition-all cursor-pointer"
                    >
                      <span>&larr;</span>
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      disabled={isUploadingDocument}
                      onClick={handleStep3Next}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#1b3b36] hover:bg-[#132c28] text-white px-7 py-3 text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                    >
                      <span>Next Step</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 4: ACCOUNT SETUP & COMPLETE */}
              {/* ========================================================================= */}
              {currentStep === 4 && (
                <form onSubmit={handleCompleteRegistration}>
                  <div className="mb-8">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1b3b36]">
                      Set Up Your Account
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Create your login credentials.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        Username / Login Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="business@example.com"
                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={formData.password}
                          onChange={(e) => updateField("password", e.target.value)}
                          placeholder="Create a password (min 8 characters)"
                          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 pr-11 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                        >
                          {showPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={formData.confirmPassword}
                          onChange={(e) => updateField("confirmPassword", e.target.value)}
                          placeholder="Confirm your password"
                          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 pr-11 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                        >
                          {showConfirmPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.agreeTerms}
                          onChange={(e) => updateField("agreeTerms", e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded text-[#1b3b36] focus:ring-[#1b3b36] accent-[#1b3b36]"
                        />
                        <span className="text-xs text-neutral-600">
                          I agree to the{" "}
                          <Link href="/terms" target="_blank" className="font-semibold text-[#1b3b36] hover:underline">
                            Terms &amp; Conditions
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" target="_blank" className="font-semibold text-[#1b3b36] hover:underline">
                            Privacy Policy
                          </Link>
                        </span>
                      </label>
                    </div>

                    <div className="pt-2">
                      <RecaptchaCheckbox ref={recaptchaRef} onChange={setRecaptchaToken} />
                    </div>
                  </div>

                  <div className="mt-10 pt-6 border-t border-neutral-100 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setCurrentStep(3)}
                      className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 hover:bg-neutral-50 px-6 py-2.5 text-sm font-semibold text-neutral-700 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <span>&larr;</span>
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !recaptchaToken}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#1b3b36] hover:bg-[#132c28] text-white px-8 py-3.5 text-sm font-semibold shadow-md transition-all cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          <span>Submitting Application...</span>
                        </>
                      ) : (
                        <span>Complete Registration</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </main>

          {/* Wizard Footer */}
          <footer className="w-full py-6 text-center text-xs text-neutral-400">
            🔒 VACAY in Florence Official Supplier Portal • 256-bit SSL Protected
          </footer>
        </div>
      )}
    </div>
  );
}
