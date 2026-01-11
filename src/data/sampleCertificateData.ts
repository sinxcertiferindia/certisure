// Sample Certificate Data for Certificate Button Options

// Sample data for single certificate creation
export const sampleSingleCertificate = {
  recipientName: "John Anderson",
  recipientEmail: "john.anderson@example.com",
  courseName: "Advanced Web Development",
  courseCode: "AWD-2024",
  issuerOrg: "TechCorp Academy",
  issueDate: "2024-12-25",
  expiryDate: null, // or "2025-12-25" for certificates with expiry
  grade: "A+",
  credits: "3.0",
  instructor: "Dr. Sarah Chen",
  certificateType: "completion", // completion, achievement, participation, professional
  template: "modern", // modern, classic, minimalist, premium
  description: "Successfully completed all course requirements with outstanding performance",
  skills: ["React", "TypeScript", "Node.js", "MongoDB"],
  verificationUrl: "https://verify.certisecure.com/CS-2024-78432",
};

// Sample data for bulk certificate creation (CSV format)
export const sampleBulkCertificates = [
  {
    recipientName: "Sarah Mitchell",
    recipientEmail: "sarah.mitchell@example.com",
    courseName: "Data Science Fundamentals",
    courseCode: "DSF-2024",
    issuerOrg: "DataLearn Institute",
    issueDate: "2024-12-20",
    expiryDate: "2025-12-20",
    grade: "A",
    credits: "4.0",
    instructor: "Prof. Michael Brown",
    certificateType: "completion",
    template: "classic",
  },
  {
    recipientName: "Emily Davis",
    recipientEmail: "emily.davis@example.com",
    courseName: "Machine Learning Basics",
    courseCode: "MLB-2024",
    issuerOrg: "AI Academy",
    issueDate: "2024-12-22",
    expiryDate: null,
    grade: "A+",
    credits: "3.5",
    instructor: "Dr. James Wilson",
    certificateType: "achievement",
    template: "premium",
  },
  {
    recipientName: "Michael Brown",
    recipientEmail: "michael.brown@example.com",
    courseName: "Cloud Architecture",
    courseCode: "CA-2024",
    issuerOrg: "CloudTech University",
    issueDate: "2024-12-23",
    expiryDate: "2026-12-23",
    grade: "B+",
    credits: "4.0",
    instructor: "Dr. Lisa Anderson",
    certificateType: "professional",
    template: "modern",
  },
  {
    recipientName: "James Wilson",
    recipientEmail: "james.wilson@example.com",
    courseName: "Cybersecurity Essentials",
    courseCode: "CSE-2024",
    issuerOrg: "SecureNet Academy",
    issueDate: "2024-12-21",
    expiryDate: "2025-12-21",
    grade: "A",
    credits: "3.0",
    instructor: "Prof. Robert Taylor",
    certificateType: "completion",
    template: "minimalist",
  },
  {
    recipientName: "Jessica Martinez",
    recipientEmail: "jessica.martinez@example.com",
    courseName: "Full Stack Development",
    courseCode: "FSD-2024",
    issuerOrg: "CodeMaster Institute",
    issueDate: "2024-12-24",
    expiryDate: null,
    grade: "A+",
    credits: "5.0",
    instructor: "Dr. David Lee",
    certificateType: "achievement",
    template: "premium",
  },
];

// Sample CSV content for bulk upload
export const sampleCSVContent = `recipientName,recipientEmail,courseName,courseCode,issuerOrg,issueDate,expiryDate,grade,credits,instructor,certificateType,template
Sarah Mitchell,sarah.mitchell@example.com,Data Science Fundamentals,DSF-2024,DataLearn Institute,2024-12-20,2025-12-20,A,4.0,Prof. Michael Brown,completion,classic
Emily Davis,emily.davis@example.com,Machine Learning Basics,MLB-2024,AI Academy,2024-12-22,,A+,3.5,Dr. James Wilson,achievement,premium
Michael Brown,michael.brown@example.com,Cloud Architecture,CA-2024,CloudTech University,2024-12-23,2026-12-23,B+,4.0,Dr. Lisa Anderson,professional,modern
James Wilson,james.wilson@example.com,Cybersecurity Essentials,CSE-2024,SecureNet Academy,2024-12-21,2025-12-21,A,3.0,Prof. Robert Taylor,completion,minimalist
Jessica Martinez,jessica.martinez@example.com,Full Stack Development,FSD-2024,CodeMaster Institute,2024-12-24,,A+,5.0,Dr. David Lee,achievement,premium`;

// Sample certificate templates/options
export const certificateTemplates = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and contemporary design with gradient accents",
    preview: "/placeholder.svg",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional elegant design with formal styling",
    preview: "/placeholder.svg",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Simple and clean design focusing on content",
    preview: "/placeholder.svg",
  },
  {
    id: "premium",
    name: "Premium",
    description: "Luxury design with premium styling and effects",
    preview: "/placeholder.svg",
  },
];

// Sample certificate types
export const certificateTypes = [
  {
    id: "completion",
    name: "Course Completion",
    description: "Awarded upon successful completion of a course",
  },
  {
    id: "achievement",
    name: "Achievement",
    description: "Awarded for outstanding performance or achievement",
  },
  {
    id: "participation",
    name: "Participation",
    description: "Awarded for participation in an event or program",
  },
  {
    id: "professional",
    name: "Professional Certification",
    description: "Professional certification or credential",
  },
];

// Sample organizations
export const sampleOrganizations = [
  {
    id: "org-1",
    name: "TechCorp Academy",
    domain: "techcorp.edu",
    logo: "/placeholder.svg",
  },
  {
    id: "org-2",
    name: "DataLearn Institute",
    domain: "datalearn.edu",
    logo: "/placeholder.svg",
  },
  {
    id: "org-3",
    name: "AI Academy",
    domain: "aiacademy.edu",
    logo: "/placeholder.svg",
  },
  {
    id: "org-4",
    name: "CloudTech University",
    domain: "cloudtech.edu",
    logo: "/placeholder.svg",
  },
];

// Sample courses
export const sampleCourses = [
  {
    id: "course-1",
    name: "Advanced Web Development",
    code: "AWD-2024",
    duration: "12 weeks",
    credits: "3.0",
  },
  {
    id: "course-2",
    name: "Data Science Fundamentals",
    code: "DSF-2024",
    duration: "16 weeks",
    credits: "4.0",
  },
  {
    id: "course-3",
    name: "Machine Learning Basics",
    code: "MLB-2024",
    duration: "10 weeks",
    credits: "3.5",
  },
  {
    id: "course-4",
    name: "Cloud Architecture",
    code: "CA-2024",
    duration: "14 weeks",
    credits: "4.0",
  },
  {
    id: "course-5",
    name: "Cybersecurity Essentials",
    code: "CSE-2024",
    duration: "8 weeks",
    credits: "3.0",
  },
];

// Sample recipients for quick selection
export const sampleRecipients = [
  {
    id: "rec-1",
    name: "John Anderson",
    email: "john.anderson@example.com",
    organization: "TechCorp Inc.",
  },
  {
    id: "rec-2",
    name: "Sarah Mitchell",
    email: "sarah.mitchell@example.com",
    organization: "DataCorp Ltd.",
  },
  {
    id: "rec-3",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    organization: "AI Solutions",
  },
  {
    id: "rec-4",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    organization: "CloudTech Systems",
  },
  {
    id: "rec-5",
    name: "James Wilson",
    email: "james.wilson@example.com",
    organization: "SecureNet Corp.",
  },
];

// Sample certificate data structure for API/form submission
export interface CertificateFormData {
  recipientName: string;
  recipientEmail: string;
  courseName: string;
  courseCode?: string;
  issuerOrg: string;
  issueDate: string;
  expiryDate?: string | null;
  grade?: string;
  credits?: string;
  instructor?: string;
  certificateType: "completion" | "achievement" | "participation" | "professional";
  template: "modern" | "classic" | "minimalist" | "premium";
  description?: string;
  skills?: string[];
  customFields?: Record<string, any>;
}

// Helper function to generate sample certificate data
export const generateSampleCertificate = (overrides?: Partial<CertificateFormData>): CertificateFormData => {
  return {
    recipientName: "John Anderson",
    recipientEmail: "john.anderson@example.com",
    courseName: "Advanced Web Development",
    courseCode: "AWD-2024",
    issuerOrg: "TechCorp Academy",
    issueDate: new Date().toISOString().split("T")[0],
    expiryDate: null,
    grade: "A+",
    credits: "3.0",
    instructor: "Dr. Sarah Chen",
    certificateType: "completion",
    template: "modern",
    description: "Successfully completed all course requirements with outstanding performance",
    skills: ["React", "TypeScript", "Node.js", "MongoDB"],
    ...overrides,
  };
};

