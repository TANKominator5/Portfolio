import { Download, GraduationCap, Code, Briefcase, Award, Github, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { ProjectsContent } from './PortfolioContent';
import { profile, education, skills, awards } from '@/data/portfolio';

const headingClass = 'text-sm font-medium text-[#e6e6e6] flex items-center gap-2 border-b border-[#2d3139] pb-2 uppercase tracking-wide';

export default function ResumeContent() {
  return (
    <div tabIndex={0} role="region" aria-label="Résumé document" className="custom-scroll h-full overflow-y-auto bg-[#1a1b22] text-[#e0e0e0] font-sans selection:bg-[#3d4251] selection:text-white break-words">
      <header className="p-4 sm:p-6 border-b border-[#2d3139] space-y-4">
        <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">{profile.name}</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#aeb4bf]">
          <span className="flex items-center gap-1.5"><MapPin size={14} className="shrink-0" />{profile.location}</span>
          <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 min-w-0 hover:text-white"><Mail size={14} className="shrink-0" /><span className="min-w-0 break-all">{profile.email}</span></a>
          <a href={profile.phoneHref} className="flex items-center gap-1.5 hover:text-white"><Phone size={14} className="shrink-0" />{profile.phone}</a>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-[#aeb4bf]">
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white"><Linkedin size={14} />LinkedIn</a>
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white"><Github size={14} />GitHub</a>
        </div>
        <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#2d3139] hover:bg-[#3d4251] px-4 py-2 rounded-md text-sm font-medium border border-[#3d4251]">
          <Download size={16} />Resume PDF
        </a>
      </header>

      <div className="p-4 sm:p-6 space-y-10">
        <section className="space-y-4">
          <h3 className={headingClass}><GraduationCap size={18} />Education</h3>
          {education.map(({ title, date, school }) => (
            <div key={title}>
              <div className="flex flex-wrap justify-between items-baseline gap-x-4 gap-y-1 mb-1">
                <h4 className="font-medium text-[#c4cbd8]">{title}</h4>
                <span className="text-sm text-[#a3acc4]">{date}</span>
              </div>
              <p className="text-sm text-[#9ca3af]">{school}</p>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <h3 className={headingClass}><Code size={18} />Skills</h3>
          <dl className="space-y-3 text-sm leading-relaxed">
            {skills.map(([label, value]) => (
              <div key={label} className="flex flex-wrap gap-x-4">
                <dt className="font-medium text-[#c4cbd8] sm:w-40 shrink-0">{label}:</dt>
                <dd className="text-[#9ca3af] flex-1 basis-48">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="space-y-4">
          <h3 className={headingClass}><Briefcase size={18} />Projects</h3>
          <ProjectsContent />
        </section>

        <section className="space-y-4">
          <h3 className={headingClass}><Award size={18} />Awards &amp; Achievements</h3>
          <ul className="text-sm text-[#9ca3af] space-y-3 list-disc ml-4">
            {awards.map(([award, description]) => <li key={award + description}><strong className="font-medium text-[#c4cbd8]">{award}</strong> — {description}</li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}
