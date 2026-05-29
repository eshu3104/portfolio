export interface Education {
  id: string;
  school: string;
  degree: string;
  date: string;
  location: string;
  gpa?: string;
  coursework?: string[];
}

export interface Experience {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  location: string;
  type: "work" | "research" | "volunteer";
  technical: boolean;
  tags: string[];
  highlights: string[];
}

export interface Project {
  id: string;
  title: string;
  date: string;
  type: "hackathon" | "academic" | "personal";
  tags: string[];
  description: string;
  event?: string;
  award?: string;
  url?: string;
}

export interface Research {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  location: string;
  description: string;
}

export interface Volunteering {
  id: string;
  role: string;
  organization: string;
  date: string;
  location?: string;
  highlights: string[];
}

export interface Award {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface Certification {
  name: string;
  issuer: string;
  issued: string;
  expires?: string;
}

export interface ResumeData {
  education: Education[];
  experience: Experience[];
  projects: Project[];
  research: Research[];
  volunteering: Volunteering[];
  awards: Award[];
  certifications: Certification[];
  skills: {
    languages: string[];
    webAndFrameworks: string[];
    aiml: string[];
    databases: string[];
    tools: string[];
  };
}