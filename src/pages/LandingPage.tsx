import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Cpu, 
  ShieldCheck, 
  Terminal, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Play, 
  RotateCcw, 
  Copy, 
  Check, 
  Share2, 
  Server, 
  Radio, 
  HelpCircle, 
  ChevronDown, 
  ExternalLink,
  Sliders,
  Flame,
  GraduationCap,
  Building2,
  Boxes,
  Lock,
  ChevronRight,
  Gauge
} from 'lucide-react';

interface SimulatedLog {
  text: string;
  type: 'info' | 'success' | 'warn' | 'dim' | 'accent';
}

export const LandingPage: React.FC = () => {
  // --- Web Serial API Support Check ---
  const [hasWebSerial] = useState<boolean>(() => 
    typeof navigator !== 'undefined' && 'serial' in navigator
  );

  // --- Interactive Terminal Simulation State ---
  const [simChip, setSimChip] = useState<'ESP32-S3' | 'ESP32' | 'ESP32-C3' | 'ESP8266'>('ESP32-S3');
  const [simBaud, setSimBaud] = useState<number>(921600);
  const [simFirmware, setSimFirmware] = useState<string>('WLED-SoundReactive-v0.14.bin');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [simLogs, setSimLogs] = useState<SimulatedLog[]>([
    { text: 'Ready to connect via Web Serial API.', type: 'dim' },
    { text: 'Select chip, baud rate, and press "Run Live Flash Simulation".', type: 'info' }
  ]);
  const simTerminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (simTerminalRef.current) {
      simTerminalRef.current.scrollTop = simTerminalRef.current.scrollHeight;
    }
  }, [simLogs, simProgress]);

  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimProgress(0);
    setSimLogs([
      { text: 'Connecting to serial port at 115200 baud...', type: 'info' }
    ]);

    const steps: { delay: number; log: SimulatedLog; progress?: number }[] = [
      { delay: 400, log: { text: `[UART] Requesting port access from browser... Granted (USB VID:0x303A PID:0x1001)`, type: 'accent' }, progress: 5 },
      { delay: 900, log: { text: `Connecting... Chip detected: ${simChip} (revision v0.2)`, type: 'success' }, progress: 15 },
      { delay: 1400, log: { text: `[MAC] 84:F7:03:A2:91:BC | Features: Wi-Fi, BLE 5.0, Dual-Core 240MHz`, type: 'info' }, progress: 25 },
      { delay: 1900, log: { text: `[Sync] Negotiating baudrate upgrade: 115200 -> ${simBaud} baud... OK!`, type: 'accent' }, progress: 35 },
      { delay: 2400, log: { text: `[Storage] Fetching binary "${simFirmware}" (1,482,880 bytes)...`, type: 'info' }, progress: 45 },
      { delay: 3000, log: { text: `[Flash] Erasing target sectors at offset 0x10000...`, type: 'warn' }, progress: 55 },
      { delay: 3600, log: { text: `Writing at 0x00010000... (50%) [████████░░░░░░░░] ${simBaud}bps`, type: 'info' }, progress: 75 },
      { delay: 4300, log: { text: `Writing at 0x00010000... (100%) [████████████████] MD5 verified!`, type: 'info' }, progress: 95 },
      { delay: 4900, log: { text: `[Reset] Hard resetting via RTS pin... Firmware booted successfully!`, type: 'success' }, progress: 100 },
      { delay: 5300, log: { text: `✨ Done! Microcontroller flashed in 3.42s with zero command line tools.`, type: 'accent' }, progress: 100 }
    ];

    steps.forEach(({ delay, log, progress }) => {
      setTimeout(() => {
        setSimLogs(prev => [...prev, log]);
        if (progress !== undefined) setSimProgress(progress);
        if (progress === 100 && delay === 5300) {
          setIsSimulating(false);
        }
      }, delay);
    });
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setSimProgress(0);
    setSimLogs([
      { text: 'Ready to connect via Web Serial API.', type: 'dim' },
      { text: 'Select chip, baud rate, and press "Run Live Flash Simulation".', type: 'info' }
    ]);
  };

  // --- Active Tab for Use Cases ---
  const [activeUsecaseTab, setActiveUsecaseTab] = useState<number>(0);

  // --- LinkedIn Post Generator / Copy State ---
  const [copiedPostIndex, setCopiedPostIndex] = useState<number | null>(null);

  const linkedinPosts = [
    {
      title: "🚀 Announcement & Product Showcase (High Engagement)",
      badge: "Founder & Creator",
      content: `⚡ I built an entirely browser-based ESP32 & ESP8266 Firmware Flasher!

No Python setups. No 'pip install esptool'. No broken COM port drivers. No terminal commands.

Just plug your microcontroller via USB-C, open the browser, and flash firmware in seconds. 🚀

🛠️ Why I built this:
Flashing firmware has always been a friction point for non-engineers, students, and customers. I wanted a zero-install, 1-click cloud-connected experience that runs securely inside any Chromium browser.

✨ Key Highlights:
• 🔌 Native Web Serial API & esptool-js integration
• 🚀 Blazing 921,600 baud flashing speeds
• 🎯 Multi-chip support: ESP32, S2, S3, C3, C6, H2, & ESP8266
• ☁️ Cloud Firmware distribution catalog with release tags & offsets
• 🛡️ Granular Admin Portal + Real-time terminal diagnostic console
• 🔒 100% Client-side execution — private binaries never leak

Built with React 19, TypeScript, Tailwind CSS v4, and Firebase.

Try it live and let me know your thoughts! 👇

#IoT #ESP32 #WebSerial #EmbeddedSystems #ReactJS #OpenSource #TypeScript #Maker #Hardware #WebDevelopment`
    },
    {
      title: "🛠️ Technical Architecture & Deep Dive",
      badge: "Tech Breakdown",
      content: `💡 How does in-browser hardware flashing work without local native binaries?

Here is the architectural breakdown of how my new web-flasher connects directly to silicon chips from Google Chrome:

1️⃣ Web Serial API Handshake:
Using navigator.serial, the web app requests low-level USB-UART communication permission, binding to the CP2102/CH340/native USB bridge at 115200 baud.

2️⃣ ROM Bootloader Synchronization:
We send synchronization slip packets to toggle the RTS & DTR lines, pulling the ESP32 into download bootloader mode.

3️⃣ High-Speed Baudrate Elevation:
Once synced, the flasher commands the ESP ROM to switch communication clocks up to 921,600 baud, slashing flash times for 4MB+ binaries down to under 5 seconds.

4️⃣ In-Memory Multi-Bin Flashing:
Cloud binaries (Bootloader, Partition Table, Application) are parsed as ArrayBuffers and streamed directly to flash offsets (0x1000, 0x8000, 0x10000) with SHA256/MD5 validation.

Tech Stack: React 19, TypeScript, esptool-js, Firebase RTDB & Storage, Tailwind v4.

What embedded workflows would you like to see brought to the browser next?

#WebSerial #EmbeddedRust #Microcontrollers #ESP32 #HardwareEngineering #SoftwareArchitecture #Frontend`
    },
    {
      title: "💡 The Problem-Solver Story (Zero-Friction Hardware)",
      badge: "Story & Impact",
      content: `If you've ever taught an IoT workshop or shipped smart hardware to customers, you know this nightmare:

"Install Python 3.11... Wait, it's not in your PATH? Let's fix your environment variables. Now run pip install esptool... Error: Microsoft Visual C++ 14.0 is required? Now install CP210x VCP drivers. Why is COM4 not showing up?"

2 hours later, you haven't written a single line of code.

I decided to eliminate this entirely. 

Introducing ESP Web Flasher:
✅ Open URL in Chrome/Edge
✅ Plug board into USB
✅ Pick firmware & Click Flash
✅ Real-time terminal logs & 100% verified flash

Who is this for?
🏭 Hardware manufacturers simplifying RMA & customer updates
👨‍💻 Open-source maintainers (WLED, ESPHome, Tasmota)
🏫 STEM classrooms & hackathons onboarding hundreds of students in 60 seconds

Feedback is welcome! Check out the live version below.

#EdTech #MakerMovement #SmartHome #IoTCommunity #DeveloperTools #TechInnovation`
    }
  ];

  const handleCopyPost = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedPostIndex(index);
    setTimeout(() => setCopiedPostIndex(null), 2500);
  };

  // --- FAQ Accordion State ---
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "Which browsers support direct Web Serial flashing?",
      a: "Google Chrome, Microsoft Edge, Brave, Opera, and any Chromium-based desktop browser (version 89+) support the W3C Web Serial API natively. Note that Safari and Firefox currently do not support Web Serial."
    },
    {
      q: "Do I need to install Python, esptool.py, or any CLI tools?",
      a: "No! The entire flashing process is executed client-side inside the browser using esptool-js and Web Serial. You only need a supported browser and a standard USB-to-UART data cable."
    },
    {
      q: "Is it secure? Does my firmware upload to third-party servers?",
      a: "All flashing happens locally between your browser and the USB device. When you select a local .bin file, it is processed directly in browser memory. Cloud firmware files stored on Firebase are downloaded securely over HTTPS."
    },
    {
      q: "Can I flash multi-bin layouts (Bootloader + Partitions + App)?",
      a: "Yes! The platform supports single monolithic binaries as well as multi-binary flash tables with custom hexadecimal offsets (e.g. 0x1000 for bootloader, 0x8000 for partition tables, and 0x10000 for application code)."
    },
    {
      q: "What baud rates are supported?",
      a: "You can select standard speeds like 115200 baud up to ultra-fast speeds like 460800 and 921600 baud for rapid firmware deployment."
    }
  ];

  // --- Hardware Chips List ---
  const chips = [
    {
      name: "ESP32",
      arch: "Xtensa® Dual-Core LX6 @ 240MHz",
      wireless: "Wi-Fi 802.11 b/g/n + Bluetooth 4.2 / BLE",
      baudMax: "921,600 baud",
      tag: "Classic Workhorse",
      color: "from-cyan-500 to-blue-500"
    },
    {
      name: "ESP32-S3",
      arch: "Xtensa® Dual-Core LX7 with Vector Instructions",
      wireless: "Wi-Fi 802.11 b/g/n + Bluetooth 5 (LE) + Mesh",
      baudMax: "921,600 baud",
      tag: "AI & Audio / Camera",
      color: "from-indigo-500 to-purple-500"
    },
    {
      name: "ESP32-C3",
      arch: "32-bit RISC-V Single-Core @ 160MHz",
      wireless: "Wi-Fi 802.11 b/g/n + Bluetooth 5 (LE)",
      baudMax: "921,600 baud",
      tag: "Ultra-Low Power RISC-V",
      color: "from-emerald-500 to-teal-500"
    },
    {
      name: "ESP32-C6",
      arch: "32-bit RISC-V @ 160MHz + LP-Core",
      wireless: "Wi-Fi 6 (802.11ax) + Zigbee 3.0 / Thread / BLE 5",
      baudMax: "921,600 baud",
      tag: "Matter & Zigbee Ready",
      color: "from-amber-500 to-orange-500"
    },
    {
      name: "ESP32-S2",
      arch: "Xtensa® Single-Core LX7 @ 240MHz + Native USB",
      wireless: "Wi-Fi 802.11 b/g/n",
      baudMax: "460,800 baud",
      tag: "Native USB OTG",
      color: "from-sky-500 to-cyan-500"
    },
    {
      name: "ESP32-H2",
      arch: "32-bit RISC-V @ 96MHz",
      wireless: "IEEE 802.15.4 (Thread/Zigbee) + Bluetooth 5.2",
      baudMax: "460,800 baud",
      tag: "Smart Home & Matter",
      color: "from-pink-500 to-rose-500"
    },
    {
      name: "ESP8266",
      arch: "Tensilica L106 32-bit @ 80/160MHz",
      wireless: "Wi-Fi 802.11 b/g/n",
      baudMax: "115,200 - 460,800 baud",
      tag: "Legacy IoT Standard",
      color: "from-slate-500 to-slate-400"
    },
    {
      name: "ESP32-P4",
      arch: "Dual-Core RISC-V @ 400MHz + H.264 Encoder",
      wireless: "High-Performance Edge Processing",
      baudMax: "921,600 baud",
      tag: "Next-Gen High Performance",
      color: "from-violet-500 to-fuchsia-500"
    }
  ];

  // --- Use Cases Data ---
  const usecases = [
    {
      id: "manufacturers",
      icon: <Building2 className="w-6 h-6 text-cyan-400" />,
      title: "Commercial IoT Vendors & Hardware Manufacturers",
      subtitle: "Frictionless RMA, Field Updates & Customer Support",
      description: "Allow non-technical end customers or field support technicians to update IoT devices, diagnose firmware issues, and re-flash damaged partitions directly from your web portal without installing command-line tools.",
      points: [
        "Eliminate customer support friction by replacing Python scripts with a 1-click web interface",
        "Enable locked-down factory-floor flashing stations on low-cost Chromebooks",
        "Securely distribute signed official releases directly from cloud storage",
        "Capture live serial diagnostics logs for remote telemetry analysis"
      ],
      quote: "Reduced RMA support tickets by 70% by letting users fix corrupted flash partitions right in their browser."
    },
    {
      id: "opensource",
      icon: <Flame className="w-6 h-6 text-orange-400" />,
      title: "Open-Source Embedded Projects (WLED, ESPHome, Tasmota)",
      subtitle: "1-Click Web Installers on Documentation Sites",
      description: "Supercharge your maker project adoption. Embed a direct browser flashing button on your GitHub README or project documentation page so new hobbyists can flash their ESP board within 30 seconds of landing.",
      points: [
        "Zero setup barrier for beginner makers and hobbyists",
        "Host multiple release channels: Stable, Beta, and Nightly builds",
        "Auto-configure Wi-Fi parameters and flash offset tables",
        "Direct linkable installation URLs for specific board variations"
      ],
      quote: "Makers went from struggling with driver errors to building interactive smart LED setups in under 3 minutes."
    },
    {
      id: "education",
      icon: <GraduationCap className="w-6 h-6 text-emerald-400" />,
      title: "STEM Labs, Universities & Hackathons",
      subtitle: "Instant Student Onboarding Across Mac, Windows & Linux",
      description: "Save the first 2 hours of lab time that is usually wasted installing Python environments, configuring PATH variables, and debugging OS-specific serial driver errors on 50 different student laptops.",
      points: [
        "Zero student laptop configuration: works instantly across Windows, macOS, and Linux",
        "Interactive serial monitor to teach UART telemetry, baud rates, and registers",
        "Standardized lab coursework firmware distribution via central admin portal",
        "No root / admin privileges required on school-managed computer lab machines"
      ],
      quote: "Our robotics hackathon launched without a single student needing serial driver troubleshooting."
    },
    {
      id: "fleet",
      icon: <Boxes className="w-6 h-6 text-purple-400" />,
      title: "Fleet Management & Assembly Line Workstations",
      subtitle: "Scalable Production Programming for Edge Devices",
      description: "Empower assembly line operators and field maintenance crews with an intuitive, audited flashing terminal. Monitor deployment counts, track device IDs, and enforce standardized release versions.",
      points: [
        "Audit trail tracking who flashed what firmware version, with timestamps and MAC addresses",
        "High-throughput 921,600 baud flashing to maximize factory line unit output",
        "Role-based access control (RBAC) ensuring only authorized engineers upload firmware binaries",
        "Cross-platform compatibility for production kiosks and ruggedized tablets"
      ],
      quote: "Standardized our factory assembly line testing stations using web browsers with zero software maintenance overhead."
    },
    {
      id: "testing",
      icon: <Sliders className="w-6 h-6 text-sky-400" />,
      title: "Hardware QA & Rapid Prototyping",
      subtitle: "Continuous Deployment Test Benches for Hardware Engineers",
      description: "Accelerate firmware iteration cycles. Switch between development branches, test staging binaries, inspect boot logs, and verify memory layout offsets without leaving your web browser.",
      points: [
        "Rapid switching between production, staging, and custom developer binaries",
        "Direct offset tweaking for bootloader, partitions, app0, app1, and SPIFFS/LittleFS",
        "Real-time console logging with color-coded chip boot messages and crash dumps",
        "Zero context switching between web dashboard and terminal windows"
      ],
      quote: "Engineers can test pull-request firmware builds on real hardware in seconds with direct cloud bin links."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Dynamic Background Atmosphere */}
      <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial-gradient pointer-events-none z-0" />
      <div className="fixed -top-40 -left-40 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none z-0 animate-pulse-glow" />
      <div className="fixed -bottom-40 -right-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Sticky Header Navigation */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-all duration-300">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-white bg-clip-text text-transparent">
                  ESP Web Flasher
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Web Serial v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">Browser-Based ESP32 & ESP8266 Firmware Workstation</p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#usecases" className="hover:text-cyan-400 transition-colors">Use Cases</a>
            <a href="#hardware" className="hover:text-cyan-400 transition-colors">Hardware Matrix</a>
            <a href="#simulator" className="hover:text-cyan-400 transition-colors">Live Simulator</a>
            <a href="#architecture" className="hover:text-cyan-400 transition-colors">Architecture</a>
            <a href="#linkedin-kit" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded-full border border-cyan-800/60">
              <Share2 className="w-3.5 h-3.5" />
              LinkedIn Kit
            </a>
            <a href="#faq" className="hover:text-cyan-400 transition-colors">FAQ</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800/60 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Cpu className="w-4 h-4" />
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </header>

      {/* Main Content Sections */}
      <main className="relative z-10">

        {/* ============================================================ */}
        {/* HERO SECTION */}
        {/* ============================================================ */}
        <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-medium mb-8 shadow-inner shadow-cyan-900/20 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Zero Drivers • Zero Python • Native Web Serial API Flashing</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.15]">
            Flash & Manage <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">Microcontrollers</span> Directly in Your Browser.
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Eliminate terminal headaches, driver setup errors, and complex toolchains. Connect ESP32, ESP8266, S2, S3, C3, C6, and H2 over USB-C, choose cloud-stored builds or custom binaries, and flash silicon at up to <strong>921,600 baud</strong> in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>Launch Flasher Workstation</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <a
              href="#simulator"
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl glass-card text-slate-200 hover:text-cyan-300 font-semibold text-sm border border-slate-700/80 hover:border-cyan-500/40 transition-all hover:bg-slate-800/60"
            >
              <Play className="w-4 h-4 text-cyan-400" />
              <span>Try Interactive Simulator</span>
            </a>

            <a
              href="#linkedin-kit"
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900/90 text-slate-300 hover:text-white font-semibold text-sm border border-slate-800 hover:border-slate-700 transition-all"
            >
              <Share2 className="w-4 h-4 text-sky-400" />
              <span>LinkedIn Post Kit</span>
            </a>
          </div>

          {/* Live Browser Compatibility Pill */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs">
            {hasWebSerial === null ? (
              <span className="text-slate-400">Detecting browser hardware capabilities...</span>
            ) : hasWebSerial ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Your browser supports direct Web Serial hardware flashing (Chrome/Edge/Opera)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                <HelpCircle className="w-3.5 h-3.5" />
                Please open in Chrome, Edge, Brave, or Opera on desktop for live USB serial access
              </span>
            )}
          </div>

          {/* ============================================================ */}
          {/* INTERACTIVE LIVE SIMULATOR / HERO DEMO */}
          {/* ============================================================ */}
          <div id="simulator" className="mt-14 max-w-5xl mx-auto text-left scroll-mt-24">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-2xl relative overflow-hidden">
              
              {/* Header inside simulator */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      Live Web Serial Flashing Simulator
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        Interactive Demo
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">Test the exact client-side flashing protocol in real time</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={runSimulation}
                    disabled={isSimulating}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isSimulating ? 'Flashing in progress...' : 'Run Live Flash Simulation'}</span>
                  </button>
                  <button
                    onClick={resetSimulation}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                    title="Reset Simulator"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Simulator Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-5 border-b border-slate-800 text-xs">
                {/* Chip Target */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                    Target Silicon Chip
                  </label>
                  <select
                    value={simChip}
                    onChange={(e) => setSimChip(e.target.value as any)}
                    disabled={isSimulating}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="ESP32-S3">ESP32-S3 (Dual-Core AI & Vector)</option>
                    <option value="ESP32">ESP32 (Original LX6 Dual-Core)</option>
                    <option value="ESP32-C3">ESP32-C3 (RISC-V 160MHz)</option>
                    <option value="ESP8266">ESP8266 (Classic Wi-Fi SoC)</option>
                  </select>
                </div>

                {/* Baud Rate */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                    Baud Rate Speed
                  </label>
                  <select
                    value={simBaud}
                    onChange={(e) => setSimBaud(Number(e.target.value))}
                    disabled={isSimulating}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value={921600}>921,600 baud (Ultra Fast ~3s)</option>
                    <option value={460800}>460,800 baud (High Speed)</option>
                    <option value={115200}>115,200 baud (Safe Default)</option>
                  </select>
                </div>

                {/* Cloud Firmware Sample */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                    Firmware Release Binary
                  </label>
                  <select
                    value={simFirmware}
                    onChange={(e) => setSimFirmware(e.target.value)}
                    disabled={isSimulating}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="WLED-SoundReactive-v0.14.bin">WLED-SoundReactive-v0.14.bin (1.4MB)</option>
                    <option value="ESPHome-Climate-Sensor-v2.1.bin">ESPHome-Climate-Sensor-v2.1.bin (980KB)</option>
                    <option value="Smart-Industrial-Node-v3.0.bin">Smart-Industrial-Node-v3.0.bin (2.1MB)</option>
                  </select>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="pt-4 pb-2">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-medium">Flash Pipeline Progress:</span>
                  <span className="font-mono font-bold text-cyan-400">{simProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 transition-all duration-300 rounded-full"
                    style={{ width: `${simProgress}%` }}
                  />
                </div>
              </div>

              {/* Terminal Logs Output */}
              <div 
                ref={simTerminalRef}
                className="mt-4 bg-slate-950/95 border border-slate-800/90 rounded-2xl p-4 font-mono text-xs text-slate-300 h-52 overflow-y-auto space-y-1.5 shadow-inner"
              >
                <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2 text-[11px] text-slate-500">
                  <span>Terminal Console (UART0 / esptool-js)</span>
                  <span className="text-cyan-400/80">Ready</span>
                </div>
                {simLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed flex items-start gap-2">
                    <span className="text-slate-600 select-none">&gt;</span>
                    <span className={
                      log.type === 'success' ? 'text-emerald-400 font-semibold' :
                      log.type === 'warn' ? 'text-amber-400' :
                      log.type === 'accent' ? 'text-cyan-400 font-medium' :
                      log.type === 'dim' ? 'text-slate-500' : 'text-slate-300'
                    }>
                      {log.text}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </section>

        {/* ============================================================ */}
        {/* STATS & VALUE HIGHLIGHTS STRIP */}
        {/* ============================================================ */}
        <section className="border-y border-slate-800/80 bg-slate-900/40 backdrop-blur-md py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300 font-mono">
                0s
              </div>
              <div className="text-xs font-semibold text-slate-200">Local Setup Time</div>
              <p className="text-[11px] text-slate-400">Zero Python, pip, or drivers required</p>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-mono">
                921.6k
              </div>
              <div className="text-xs font-semibold text-slate-200">Max Baud Rate</div>
              <p className="text-[11px] text-slate-400">Flash 4MB binaries in ~4 seconds</p>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 font-mono">
                8+
              </div>
              <div className="text-xs font-semibold text-slate-200">Silicon Architectures</div>
              <p className="text-[11px] text-slate-400">ESP32, S2, S3, C3, C6, H2, ESP8266</p>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-mono">
                100%
              </div>
              <div className="text-xs font-semibold text-slate-200">Client-Side Hardware Security</div>
              <p className="text-[11px] text-slate-400">Direct browser-to-silicon UART pipe</p>
            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* THE PROBLEM VS THE SOLUTION (FRICTION VS FREEDOM) */}
        {/* ============================================================ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-wider text-cyan-400 mb-2">
              Why Web-Based Flashing?
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
              The Old Way vs. The ESP Web Flasher Way
            </h3>
            <p className="mt-3 text-sm text-slate-400">
              See why hardware engineers, teachers, and makers are abandoning command-line setups for browser-based flashing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* The Old Way */}
            <div className="glass-card p-8 rounded-3xl border border-rose-500/20 bg-gradient-to-b from-rose-950/10 to-slate-950/60 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-100">The Traditional Toolchain Hell</h4>
                  <p className="text-xs text-rose-400/80">High barrier to entry & continuous support tickets</p>
                </div>
              </div>

              <ul className="space-y-4 text-xs text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="p-1 rounded-md bg-rose-500/10 text-rose-400 mt-0.5 shrink-0">✕</span>
                  <span><strong>Driver Incompatibility:</strong> Endless hunt for CP210x, CH340, FTDI drivers across Windows, Mac, and Linux.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="p-1 rounded-md bg-rose-500/10 text-rose-400 mt-0.5 shrink-0">✕</span>
                  <span><strong>Python Virtualenv Headaches:</strong> Broken pip dependencies, Visual C++ build tool errors, Python 2 vs 3 conflicts.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="p-1 rounded-md bg-rose-500/10 text-rose-400 mt-0.5 shrink-0">✕</span>
                  <span><strong>Complex CLI Arguments:</strong> Memorizing obscure flags (`esptool.py --chip esp32 -p /dev/ttyUSB0 -b 921600 write_flash 0x1000 bootloader.bin 0x8000 partitions.bin 0x10000 app.bin`).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="p-1 rounded-md bg-rose-500/10 text-rose-400 mt-0.5 shrink-0">✕</span>
                  <span><strong>Frustrated End Customers & Students:</strong> 1-2 hours wasted in labs or support calls just trying to get a device recognized.</span>
                </li>
              </ul>
            </div>

            {/* The ESP Web Flasher Way */}
            <div className="glass-card p-8 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 to-slate-950/60 relative overflow-hidden shadow-xl shadow-cyan-950/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-100">The Modern ESP Web Flasher</h4>
                  <p className="text-xs text-cyan-400">Zero install, 1-click execution inside your browser</p>
                </div>
              </div>

              <ul className="space-y-4 text-xs text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="p-1 rounded-md bg-cyan-500/15 text-cyan-400 mt-0.5 shrink-0">✓</span>
                  <span><strong>Native Web Serial Hardware Pipe:</strong> Connects to USB-UART directly via standard Chromium browser APIs without drivers.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="p-1 rounded-md bg-cyan-500/15 text-cyan-400 mt-0.5 shrink-0">✓</span>
                  <span><strong>Cloud Firmware Catalog:</strong> Direct 1-click selection of pre-compiled official binaries with automated memory offset mapping.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="p-1 rounded-md bg-cyan-500/15 text-cyan-400 mt-0.5 shrink-0">✓</span>
                  <span><strong>Real-time Terminal & Diagnostics:</strong> View auto-detected chip ID, MAC address, crystal clock, erase progress, and UART logs live.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="p-1 rounded-md bg-cyan-500/15 text-cyan-400 mt-0.5 shrink-0">✓</span>
                  <span><strong>60-Second Onboarding:</strong> Anyone with a browser can flash modern microcontrollers in seconds.</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* COMPREHENSIVE USE CASES SECTION */}
        {/* ============================================================ */}
        <section id="usecases" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-wider text-cyan-400 mb-2">
              Transforming Embedded Workflows
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
              Real-World Use Cases & Applications
            </h3>
            <p className="mt-3 text-sm text-slate-400">
              Explore how different industries, open-source communities, and educational institutions leverage web flashing.
            </p>
          </div>

          {/* Use Case Tabs / Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {usecases.map((uc, index) => (
              <button
                key={uc.id}
                onClick={() => setActiveUsecaseTab(index)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeUsecaseTab === index
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/30 scale-105'
                    : 'glass-card text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {uc.icon}
                <span>{uc.title.split('&')[0]}</span>
              </button>
            ))}
          </div>

          {/* Active Tab Card Showcase */}
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-700/80 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30">
                    {usecases[activeUsecaseTab].icon}
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-bold text-cyan-400 tracking-wider">
                      {usecases[activeUsecaseTab].subtitle}
                    </span>
                    <h4 className="text-xl sm:text-2xl font-bold text-slate-100">
                      {usecases[activeUsecaseTab].title}
                    </h4>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {usecases[activeUsecaseTab].description}
                </p>

                <div className="space-y-3 pt-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Benefits:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {usecases[activeUsecaseTab].points.map((point, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 italic flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>"{usecases[activeUsecaseTab].quote}"</span>
                </div>
              </div>

              {/* Visual Card / Action Graphic */}
              <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-inner">
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-slate-400 font-semibold">Workflow Status</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px]">
                      Ready to Deploy
                    </span>
                  </div>

                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                      <span className="text-slate-400">1. USB Port Authorization</span>
                      <span className="text-cyan-400">Web Serial API</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                      <span className="text-slate-400">2. Firmware Source</span>
                      <span className="text-cyan-400">Firebase Cloud / Local .bin</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                      <span className="text-slate-400">3. Flash Baud Rate</span>
                      <span className="text-cyan-400">921600 bps</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                      <span className="text-slate-400">4. Device Handshake</span>
                      <span className="text-emerald-400">ROM Bootloader Sync</span>
                    </div>
                  </div>

                  <Link
                    to="/dashboard"
                    className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-cyan-950/40"
                  >
                    <span>Test This Workflow</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Grid of All 5 Use Cases */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {usecases.map((uc, index) => (
              <div
                key={uc.id}
                onClick={() => setActiveUsecaseTab(index)}
                className={`glass-card glass-card-hover p-4 rounded-2xl cursor-pointer border transition-all ${
                  activeUsecaseTab === index
                    ? 'border-cyan-500/50 bg-slate-800/60'
                    : 'border-slate-800'
                }`}
              >
                <div className="p-2 rounded-xl bg-slate-900 w-fit mb-3">
                  {uc.icon}
                </div>
                <h5 className="font-bold text-xs text-slate-100 mb-1">{uc.title.split('&')[0]}</h5>
                <p className="text-[11px] text-slate-400 line-clamp-2">{uc.subtitle}</p>
              </div>
            ))}
          </div>

        </section>

        {/* ============================================================ */}
        {/* HARDWARE COMPATIBILITY MATRIX */}
        {/* ============================================================ */}
        <section id="hardware" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-wider text-cyan-400 mb-2">
              Broad Silicon Support
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
              Supported Espressif Hardware Matrix
            </h3>
            <p className="mt-3 text-sm text-slate-400">
              Flash any generation of Espressif silicon directly from your browser with dedicated stub flasher routines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {chips.map((chip, idx) => (
              <div 
                key={idx} 
                className="glass-card glass-card-hover p-6 rounded-3xl border border-slate-800 flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-cyan-400">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {chip.tag}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                    {chip.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    {chip.arch}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Radio className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="text-[11px] truncate">{chip.wireless}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Gauge className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-[11px] font-mono">Up to {chip.baudMax}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-cyan-400 font-semibold">
                  <span>Web Serial Ready</span>
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* ARCHITECTURE & UNDER-THE-HOOD FLOW */}
        {/* ============================================================ */}
        <section id="architecture" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-wider text-cyan-400 mb-2">
              Engineering Architecture
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
              How Web Serial Flashing Operates
            </h3>
            <p className="mt-3 text-sm text-slate-400">
              A high-performance pipeline spanning browser Web APIs, in-memory binary processing, and cloud firmware repositories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 relative">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-base mb-4 font-mono">
                01
              </div>
              <h4 className="text-base font-bold text-slate-100 mb-2">Hardware Pairing</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Browser invokes <code className="text-cyan-300">navigator.serial.requestPort()</code> to gain secure, user-approved access to USB-to-UART bridges (CP2102, CH340, native USB).
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 relative">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-base mb-4 font-mono">
                02
              </div>
              <h4 className="text-base font-bold text-slate-100 mb-2">ROM Bootloader Sync</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sends SLIP handshake packets, toggles DTR/RTS to reset the SoC into bootloader mode, queries MAC/Crystal clock, and elevates baud rate to 921600 bps.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 relative">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-base mb-4 font-mono">
                03
              </div>
              <h4 className="text-base font-bold text-slate-100 mb-2">In-Memory Stream</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Firmware binaries from Firebase Storage or local upload are converted into ArrayBuffers, compressed with deflate, and written directly to flash sectors.
              </p>
            </div>

            {/* Step 4 */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 relative">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-base mb-4 font-mono">
                04
              </div>
              <h4 className="text-base font-bold text-slate-100 mb-2">Verification & Reboot</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Computes MD5 hash checksums for each segment, updates audit history database, hard-resets the board, and attaches the live UART serial monitor.
              </p>
            </div>

          </div>

          {/* Key Architectural Pillars */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-slate-100">Air-Gapped Client Security</h5>
                <p className="text-xs text-slate-400 mt-1">Local binaries never leave your browser. Flashing happens completely client-side via hardware USB streams.</p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-slate-100">Cloud Binary Distribution</h5>
                <p className="text-xs text-slate-400 mt-1">Centralized Firebase Realtime DB and Storage for release catalogs, version control, and multi-file offset configs.</p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-slate-100">Role-Based Access (RBAC)</h5>
                <p className="text-xs text-slate-400 mt-1">Administrators can manage users, upload official binaries, disable compromised accounts, and audit all live activity.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* LINKEDIN POST KIT & SOCIAL SHOWCASE */}
        {/* ============================================================ */}
        <section id="linkedin-kit" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 via-slate-900/60 to-slate-950 shadow-2xl relative overflow-hidden">
            
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4">
                <Share2 className="w-3.5 h-3.5" />
                <span>LinkedIn & Social Launch Kit</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
                Ready-to-Post LinkedIn Captions & Pitch Kit
              </h3>
              <p className="mt-3 text-sm text-slate-300">
                Need to share this project on LinkedIn? Choose from 3 crafted post templates below, click <strong>"Copy to Clipboard"</strong>, and publish directly to your network!
              </p>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {linkedinPosts.map((post, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between relative hover:border-cyan-500/40 transition-all shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
                      <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                        {post.badge}
                      </span>
                      <span className="text-[10px] text-slate-500">Post Option {idx + 1}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 mb-3">{post.title}</h4>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 font-sans whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto select-all">
                      {post.content}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80">
                    <button
                      onClick={() => handleCopyPost(post.content, idx)}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                        copiedPostIndex === idx
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/30'
                      }`}
                    >
                      {copiedPostIndex === idx ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy LinkedIn Post #{idx + 1}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Hashtags / Cheat Sheet */}
            <div className="mt-8 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span><strong>Recommended Hashtags:</strong> #IoT #ESP32 #WebSerial #EmbeddedSystems #ReactJS #OpenSource #TypeScript #Maker #Hardware</span>
              </div>
              <a
                href="https://www.linkedin.com/feed/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                <span>Open LinkedIn</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* FAQ ACCORDION SECTION */}
        {/* ============================================================ */}
        <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto scroll-mt-20">
          <div className="text-center mb-16">
            <h2 className="text-xs uppercase font-bold tracking-wider text-cyan-400 mb-2">
              Common Inquiries
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
              Frequently Asked Questions
            </h3>
            <p className="mt-3 text-sm text-slate-400">
              Everything you need to know about browser-based microcontroller flashing.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="glass-card rounded-2xl border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-bold text-slate-200 hover:text-cyan-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${openFaq === idx ? 'rotate-180 text-cyan-400' : 'text-slate-500'}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* FINAL CALL TO ACTION */}
        {/* ============================================================ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="glass-panel p-10 sm:p-16 rounded-3xl border border-cyan-500/30 bg-gradient-to-tr from-cyan-950/40 via-slate-900 to-blue-950/40 text-center relative overflow-hidden shadow-2xl">
            
            <div className="inline-flex p-4 rounded-3xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-2xl shadow-cyan-500/30 mb-6 animate-pulse-glow">
              <Zap className="w-10 h-10 fill-current" />
            </div>

            <h3 className="text-3xl sm:text-5xl font-extrabold text-slate-100 max-w-3xl mx-auto leading-tight">
              Ready to Flash Your Silicon in Seconds?
            </h3>

            <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
              Open the web workstation, connect your ESP32 or ESP8266 via USB, and start flashing with zero installation barrier.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95"
              >
                <Cpu className="w-5 h-5 text-slate-950" />
                <span>Open Web Flasher Now</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </Link>

              <Link
                to="/register"
                className="flex items-center gap-2 px-6 py-4 rounded-2xl glass-card text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 hover:border-slate-600 transition-all"
              >
                <span>Create Free Account</span>
              </Link>
            </div>

          </div>
        </section>

      </main>

      {/* ============================================================ */}
      {/* FOOTER */}
      {/* ============================================================ */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 text-slate-400 text-xs py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-600 text-white shadow-md shadow-cyan-500/20">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-200">ESP Web Flasher</span>
              <p className="text-[11px] text-slate-500">Built with React 19, TypeScript, esptool-js & Firebase</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px]">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#usecases" className="hover:text-cyan-400 transition-colors">Use Cases</a>
            <a href="#hardware" className="hover:text-cyan-400 transition-colors">Hardware</a>
            <a href="#linkedin-kit" className="hover:text-cyan-400 transition-colors">LinkedIn Kit</a>
            <Link to="/login" className="hover:text-cyan-400 transition-colors">Login</Link>
            <Link to="/register" className="hover:text-cyan-400 transition-colors">Register</Link>
          </div>

          <div className="text-[11px] text-slate-500">
            Released under MIT License • Client-side Web Serial API
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
