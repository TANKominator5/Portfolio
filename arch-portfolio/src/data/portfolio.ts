export const profile = {
  name: 'Debajit Pal',
  location: 'Kolkata, West Bengal',
  email: 'debajitpal.380718@gmail.com',
  phone: '+91 70448 95962',
  phoneHref: 'tel:+917044895962',
  github: 'https://github.com/TANKominator5',
  linkedin: 'https://linkedin.com/in/debajit-pal-44b216328',
  resume: 'https://drive.google.com/file/d/1oTCkDNC5TIFyhQR9Pi-mm1En1zooXzqr/view?usp=sharing',
};

export const projects = [
  {
    name: 'School Management System',
    description: 'A Python-based console application with full MySQL database integration.',
    details: [
      'User authentication and role-based access control',
      'Student portal with academic resources, exam schedules, and fee management',
      'Admin CRUD operations for student record management',
      'Modular architecture using Python file imports and MySQL Connector',
    ],
  },
  {
    name: 'Swift Prep — Flutter WebView App',
    description: 'A Flutter hybrid app wrapping the swift-prep.xyz website for a native mobile experience.',
    details: [
      'JavaScript bridge via flutter_inappwebview to access native device features (sharing, haptics)',
      'Compliant Google OAuth flow using secure browser tabs to bypass WebView restrictions',
      'CI/CD pipeline with GitHub Actions for automated testing and multi-platform builds',
    ],
  },
  {
    name: 'Finseva — Tax Saving & Optimisation Platform',
    description: 'A web platform focused on tax planning and financial optimization.',
    details: [
      'Led ideation and created wireframe diagrams for the product',
      'Built multiple frontend pages using Next.js and Tailwind CSS',
      'Assisted in designing and optimizing the Supabase database schema',
    ],
  },
  {
    name: 'Tickease — Mobile-First Event Management',
    description: 'A cross-platform event management system with real-time capabilities.',
    details: [
      'Real-time event viewer using Supabase postgres_changes for live updates',
      'Cross-platform development with Next.js (web) and React Native (mobile)',
      'Analytics and user tracking to monitor event engagement and activity',
      'Supabase database design with real-time subscriptions and row-level security',
      'Reusable UI components for event listings, registration forms, and data visualization',
    ],
  },
];

export const education = [
  { title: 'Bachelor of Technology — Computer Science & Engineering', date: 'Ongoing', school: 'RCC Institute of Information Technology, Kolkata, West Bengal' },
  { title: 'AISSCE (Class XII)', date: '2024', school: 'Hariyana Vidya Mandir' },
  { title: 'ICSE (Class X)', date: '2022', school: "St. Joan's School" },
];

export const skills = [
  ['Languages', 'C, Java, Python, HTML5, CSS3, JavaScript, TypeScript, Dart'],
  ['Libraries & Frameworks', 'ReactJS, Next.js, Node.js, Tailwind CSS'],
  ['Databases', 'Supabase, MySQL'],
  ['Tools & Platforms', 'Flutter, Android Studio, VS Code, Git, GitHub, Vercel, Figma, Excalidraw, NumPy, Pandas'],
];

export const awards = [
  ['1st rank', 'Cypher Senior 2026 (CP event)'],
  ['3rd place', 'Pragyan CTF hosted by IIT Dharwad'],
  ['2nd Runner-Up', 'Showdownn Hackathon, NIT Durgapur'],
  ['1st Runner-Up', 'HackFest 2025, IIT (ISM) Dhanbad'],
  ['4th Place (Top 9)', 'Cypher 7.0, Competitive Programming Contest by RCCIIT — earned membership as a Subcore Member of RccTechZ (Coding Club of RCCIIT)'],
  ['Core Team Member', 'FOSS Club, IIIT Kalyani'],
  ['Game Dev Subcore Member', 'Ignitex Club, RCCIIT'],
];
