import React from 'react';
import { Download, GraduationCap, Code, ExternalLink, Briefcase, Award, Github, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

const ResumeContent: React.FC = () => {
    return (
        <div className="h-full flex flex-col bg-[#1a1b22] text-[#e0e0e0] font-sans selection:bg-[#3d4251] selection:text-white relative">

            {/* Header Sticky Bar - Matte and subtle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-[#2d3139] shrink-0 bg-[#1a1b22]/95 backdrop-blur-sm z-10 sticky top-0 gap-4 sm:gap-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#e6e6e6]">Debajit Pal</h1>
                    <div className="flex flex-wrap items-center mt-2 gap-x-4 gap-y-2 text-sm text-[#9ca3af]">
                        <span className="flex items-center gap-1.5"><MapPin size={14} /> Kolkata, West Bengal</span>
                        <span className="flex items-center gap-1.5"><Mail size={14} /> debajitpal.380718@gmail.com</span>
                        <span className="flex items-center gap-1.5"><Phone size={14} /> +91 70448 95962</span>
                    </div>
                    <div className="flex flex-wrap items-center mt-1.5 gap-x-4 gap-y-2 text-sm text-[#9ca3af]">
                        <a href="https://linkedin.com/in/debajit-pal-44b216328" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-[#c4cbd8] transition-colors"><Linkedin size={14} /> linkedin.com/in/debajit-pal-44b216328</a>
                        <a href="https://github.com/TANKominator5" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-[#c4cbd8] transition-colors"><Github size={14} /> github.com/TANKominator5</a>
                    </div>
                </div>
                <a
                    href="https://drive.google.com/file/d/1oTCkDNC5TIFyhQR9Pi-mm1En1zooXzqr/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#2d3139] hover:bg-[#3d4251] text-[#e0e0e0] px-4 py-2 rounded-md text-sm font-medium transition-colors border border-[#3d4251]"
                >
                    <Download size={16} />
                    <span>Resume PDF</span>
                </a>
            </div>

            {/* Scrollable Body - Matte & Minimal styling */}
            <div className="custom-scroll flex-grow overflow-y-auto p-6 md:px-10 space-y-12">

                {/* Education Section */}
                <section className="space-y-4">
                    <h2 className="text-lg font-medium text-[#e6e6e6] flex items-center gap-2 border-b border-[#2d3139] pb-2 uppercase tracking-wide text-sm">
                        <GraduationCap className="text-[#8892b0]" size={18} />
                        Education
                    </h2>

                    <div className="space-y-4 pt-2">
                        <div>
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-medium text-[#c4cbd8]">Bachelor of Technology — Computer Science & Engineering</h3>
                                <span className="text-sm text-[#8892b0]">Ongoing</span>
                            </div>
                            <p className="text-sm text-[#9ca3af]">RCC Institute of Information Technology, Kolkata, West Bengal</p>
                        </div>

                        <div>
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-medium text-[#c4cbd8]">AISSCE (Class XII)</h3>
                                <span className="text-sm text-[#8892b0]">2024</span>
                            </div>
                            <p className="text-sm text-[#9ca3af]">Hariyana Vidya Mandir</p>
                        </div>

                        <div>
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-medium text-[#c4cbd8]">ICSE (Class X)</h3>
                                <span className="text-sm text-[#8892b0]">2022</span>
                            </div>
                            <p className="text-sm text-[#9ca3af]">St. Joan&apos;s School</p>
                        </div>
                    </div>
                </section>

                {/* Skills Section */}
                <section className="space-y-4">
                    <h2 className="text-lg font-medium text-[#e6e6e6] flex items-center gap-2 border-b border-[#2d3139] pb-2 uppercase tracking-wide text-sm">
                        <Code className="text-[#8892b0]" size={18} />
                        Skills
                    </h2>

                    <div className="space-y-3 pt-2 text-[#9ca3af] text-sm leading-relaxed">
                        <div className="flex flex-col sm:flex-row sm:gap-4">
                            <span className="font-medium text-[#c4cbd8] min-w-[150px]">Languages:</span>
                            <span>C, Java, Python, HTML5, CSS3, JavaScript, TypeScript, Dart</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:gap-4">
                            <span className="font-medium text-[#c4cbd8] min-w-[150px]">Libraries & Frameworks:</span>
                            <span>ReactJS, Next.js, Node.js, Tailwind CSS</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:gap-4">
                            <span className="font-medium text-[#c4cbd8] min-w-[150px]">Databases:</span>
                            <span>Supabase, MySQL</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:gap-4">
                            <span className="font-medium text-[#c4cbd8] min-w-[150px]">Tools & Platforms:</span>
                            <span>Flutter, Android Studio, VS Code, Git, GitHub, Vercel, Figma, Excalidraw, NumPy, Pandas</span>
                        </div>
                    </div>
                </section>

                {/* Projects Section */}
                <section className="space-y-4">
                    <h2 className="text-lg font-medium text-[#e6e6e6] flex items-center gap-2 border-b border-[#2d3139] pb-2 uppercase tracking-wide text-sm">
                        <Briefcase className="text-[#8892b0]" size={18} />
                        Projects
                    </h2>

                    <div className="space-y-8 pt-2">

                        {/* Project 1 */}
                        <div>
                            <div className="flex items-center gap-3 justify-between mb-2">
                                <h3 className="font-medium text-[#c4cbd8] text-base">1. School Management System</h3>
                                <a href="#" className="flex items-center gap-1.5 text-xs text-[#8892b0] hover:text-[#c4cbd8] border border-[#2d3139] px-2 py-1 rounded transition-colors"><Github size={12} /> GitHub</a>
                            </div>
                            <p className="text-sm text-[#9ca3af] mb-3">A Python-based console application with full MySQL database integration.</p>
                            <ul className="text-sm text-[#8892b0] space-y-1.5 list-disc list-outside ml-4">
                                <li>User authentication and role-based access control</li>
                                <li>Student portal with academic resources, exam schedules, and fee management</li>
                                <li>Admin CRUD operations for student record management</li>
                                <li>Modular architecture using Python file imports and MySQL Connector</li>
                            </ul>
                        </div>

                        {/* Project 2 */}
                        <div>
                            <div className="flex items-center gap-3 justify-between mb-2">
                                <h3 className="font-medium text-[#c4cbd8] text-base">2. Swift Prep — Flutter WebView App</h3>
                                <a href="#" className="flex items-center gap-1.5 text-xs text-[#8892b0] hover:text-[#c4cbd8] border border-[#2d3139] px-2 py-1 rounded transition-colors"><Github size={12} /> GitHub</a>
                            </div>
                            <p className="text-sm text-[#9ca3af] mb-3">A Flutter hybrid app wrapping the swift-prep.xyz website for a native mobile experience.</p>
                            <ul className="text-sm text-[#8892b0] space-y-1.5 list-disc list-outside ml-4">
                                <li>JavaScript bridge via flutter_inappwebview to access native device features (sharing, haptics)</li>
                                <li>Compliant Google OAuth flow using secure browser tabs to bypass WebView restrictions</li>
                                <li>CI/CD pipeline with GitHub Actions for automated testing and multi-platform builds</li>
                            </ul>
                        </div>

                        {/* Project 3 */}
                        <div>
                            <div className="flex items-center gap-3 justify-between mb-2">
                                <h3 className="font-medium text-[#c4cbd8] text-base">3. Finseva — Tax Saving & Optimisation Platform</h3>
                                <a href="#" className="flex items-center gap-1.5 text-xs text-[#8892b0] hover:text-[#c4cbd8] border border-[#2d3139] px-2 py-1 rounded transition-colors"><ExternalLink size={12} /> Live Site</a>
                            </div>
                            <p className="text-sm text-[#9ca3af] mb-3">A web platform focused on tax planning and financial optimization.</p>
                            <ul className="text-sm text-[#8892b0] space-y-1.5 list-disc list-outside ml-4">
                                <li>Led ideation and created wireframe diagrams for the product</li>
                                <li>Built multiple frontend pages using Next.js and Tailwind CSS</li>
                                <li>Assisted in designing and optimizing the Supabase database schema</li>
                            </ul>
                        </div>

                        {/* Project 4 */}
                        <div>
                            <div className="flex items-center gap-3 justify-between mb-2">
                                <h3 className="font-medium text-[#c4cbd8] text-base">4. Tickease — Mobile-First Event Management</h3>
                                <a href="#" className="flex items-center gap-1.5 text-xs text-[#8892b0] hover:text-[#c4cbd8] border border-[#2d3139] px-2 py-1 rounded transition-colors"><Github size={12} /> GitHub</a>
                            </div>
                            <p className="text-sm text-[#9ca3af] mb-3">A cross-platform event management system with real-time capabilities.</p>
                            <ul className="text-sm text-[#8892b0] space-y-1.5 list-disc list-outside ml-4">
                                <li>Real-time event viewer using Supabase postgres_changes for live updates</li>
                                <li>Cross-platform development with Next.js (web) and React Native (mobile)</li>
                                <li>Analytics and user tracking to monitor event engagement and activity</li>
                                <li>Supabase database design with real-time subscriptions and row-level security</li>
                                <li>Reusable UI components for event listings, registration forms, and data visualization</li>
                            </ul>
                        </div>

                    </div>
                </section>

                {/* Awards Section */}
                <section className="space-y-4">
                    <h2 className="text-lg font-medium text-[#e6e6e6] flex items-center gap-2 border-b border-[#2d3139] pb-2 uppercase tracking-wide text-sm">
                        <Award className="text-[#8892b0]" size={18} />
                        Awards & Achievements
                    </h2>

                    <ul className="text-sm text-[#9ca3af] space-y-3 pt-2">
                        <li className="flex gap-3 items-start">
                            <span className="text-[#8892b0] mt-0.5">•</span>
                            <span><strong className="font-medium text-[#c4cbd8] font-normal">1st rank</strong> — Cypher Senior 2026 (CP event)</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <span className="text-[#8892b0] mt-0.5">•</span>
                            <span><strong className="font-medium text-[#c4cbd8] font-normal">3rd place</strong> — Pragyan CTF hosted by IIT Dharwad</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <span className="text-[#8892b0] mt-0.5">•</span>
                            <span><strong className="font-medium text-[#c4cbd8] font-normal">2nd Runner-Up</strong> — Showdownn Hackathon, NIT Durgapur</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <span className="text-[#8892b0] mt-0.5">•</span>
                            <span><strong className="font-medium text-[#c4cbd8] font-normal">1st Runner-Up</strong> — HackFest 2025, IIT (ISM) Dhanbad</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <span className="text-[#8892b0] mt-0.5">•</span>
                            <span><strong className="font-medium text-[#c4cbd8] font-normal">4th Place (Top 9)</strong> — Cypher 7.0, Competitive Programming Contest by RCCIIT — earned membership as a Subcore Member of RccTechZ (Coding Club of RCCIIT)</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <span className="text-[#8892b0] mt-0.5">•</span>
                            <span><strong className="font-medium text-[#c4cbd8] font-normal">Core Team Member</strong> — FOSS Club, IIIT Kalyani</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <span className="text-[#8892b0] mt-0.5">•</span>
                            <span><strong className="font-medium text-[#c4cbd8] font-normal">Game Dev Subcore Member</strong> — Ignitex Club, RCCIIT</span>
                        </li>
                    </ul>
                </section>

                <div className="h-8" />
            </div>
        </div>
    );
};

export default ResumeContent;
