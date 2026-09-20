import { Github, Linkedin, Mail, Phone } from 'lucide-react';
import { profile, projects } from '@/data/portfolio';

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
