import { Github, Linkedin, Mail, Phone } from 'lucide-react';

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

const projects = [
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

export function ProjectsContent() {
  return (
    <div className="space-y-8 break-words">
      {projects.map((project) => (
        <article key={project.name} className="space-y-3">
          <h3 className="font-medium text-[#c4cbd8] text-base">{project.name}</h3>
          <p className="text-sm text-[#9ca3af]">{project.description}</p>
          <ul className="text-sm text-[#a3acc4] space-y-1.5 list-disc ml-4">
            {project.details.map((detail) => <li key={detail}>{detail}</li>)}
          </ul>
        </article>
      ))}
      <a href={profile.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-300 underline underline-offset-4">
        <Github size={16} /> Browse my GitHub profile
      </a>
    </div>
  );
}

export function AboutContent() {
  return (
    <div className="space-y-5 leading-relaxed text-gray-300">
      <h3 className="text-2xl font-semibold text-white">Hi, I’m {profile.name}.</h3>
      <p>I’m a Computer Science &amp; Engineering student at RCC Institute of Information Technology in {profile.location}.</p>
      <p>I build web and mobile applications with React, Next.js, Flutter, and Supabase. My projects range from school management software to tax planning and real-time event platforms.</p>
      <p>Beyond building applications, I take part in competitive programming, CTFs, and hackathons, and contribute to technical clubs and the FOSS community.</p>
      <p className="text-sm text-gray-400">Explore my résumé and projects using the desktop icons. Open apps stay in the taskbar when minimized.</p>
    </div>
  );
}

export function ContactContent() {
  const links = [
    { label: profile.email, href: `mailto:${profile.email}`, icon: Mail },
    { label: profile.phone, href: profile.phoneHref, icon: Phone },
    { label: 'GitHub — TANKominator5', href: profile.github, icon: Github },
    { label: 'LinkedIn — Debajit Pal', href: profile.linkedin, icon: Linkedin },
  ];
  return (
    <div className="space-y-5">
      <p className="text-gray-300">Get in touch about projects, collaboration, or opportunities.</p>
      <ul className="space-y-3">
        {links.map(({ label, href, icon: Icon }) => (
          <li key={href}>
            <a href={href} target={href.startsWith('https:') ? '_blank' : undefined} rel={href.startsWith('https:') ? 'noopener noreferrer' : undefined}
              className="flex items-center gap-3 rounded-md p-2 text-blue-300 hover:bg-white/10">
              <Icon size={18} className="shrink-0" /><span className="min-w-0 break-words">{label}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="text-sm text-gray-400">Based in {profile.location}.</p>
    </div>
  );
}
