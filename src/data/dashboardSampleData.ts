// Sample Data for All Dashboard Buttons and Features

// ============================================
// STATS DATA (for stats cards)
// ============================================
export const dashboardStats = [
  {
    label: "Total Certificates",
    value: "1,247",
    change: "+12%",
    icon: "Award",
    color: "text-accent",
    trend: "up",
  },
  {
    label: "Active Certificates",
    value: "1,089",
    change: "+8%",
    icon: "CheckCircle2",
    color: "text-success",
    trend: "up",
  },
  {
    label: "This Month",
    value: "156",
    change: "+24%",
    icon: "TrendingUp",
    color: "text-secondary",
    trend: "up",
  },
  {
    label: "Pending Review",
    value: "23",
    change: "-5%",
    icon: "Clock",
    color: "text-warning",
    trend: "down",
  },
];

// ============================================
// RECENT CERTIFICATES (for "View All" button)
// ============================================
export const recentCertificates = [
  {
    id: "CS-2024-78432",
    recipient: "John Anderson",
    recipientEmail: "john.anderson@example.com",
    course: "Advanced Web Development",
    courseCode: "AWD-2024",
    date: "Dec 25, 2024",
    status: "active",
    issuerOrg: "TechCorp Academy",
    grade: "A+",
  },
  {
    id: "CS-2024-78431",
    recipient: "Sarah Chen",
    recipientEmail: "sarah.chen@example.com",
    course: "Data Science Fundamentals",
    courseCode: "DSF-2024",
    date: "Dec 24, 2024",
    status: "active",
    issuerOrg: "DataLearn Institute",
    grade: "A",
  },
  {
    id: "CS-2024-78430",
    recipient: "Michael Brown",
    recipientEmail: "michael.brown@example.com",
    course: "Cloud Architecture",
    courseCode: "CA-2024",
    date: "Dec 23, 2024",
    status: "active",
    issuerOrg: "CloudTech University",
    grade: "B+",
  },
  {
    id: "CS-2024-78429",
    recipient: "Emily Davis",
    recipientEmail: "emily.davis@example.com",
    course: "Machine Learning Basics",
    courseCode: "MLB-2024",
    date: "Dec 22, 2024",
    status: "pending",
    issuerOrg: "AI Academy",
    grade: null,
  },
  {
    id: "CS-2024-78428",
    recipient: "James Wilson",
    recipientEmail: "james.wilson@example.com",
    course: "Cybersecurity Essentials",
    courseCode: "CSE-2024",
    date: "Dec 21, 2024",
    status: "active",
    issuerOrg: "SecureNet Academy",
    grade: "A",
  },
  {
    id: "CS-2024-78427",
    recipient: "Jessica Martinez",
    recipientEmail: "jessica.martinez@example.com",
    course: "Full Stack Development",
    courseCode: "FSD-2024",
    date: "Dec 20, 2024",
    status: "active",
    issuerOrg: "CodeMaster Institute",
    grade: "A+",
  },
  {
    id: "CS-2024-78426",
    recipient: "David Chen",
    recipientEmail: "david.chen@example.com",
    course: "Python Programming",
    courseCode: "PP-2024",
    date: "Dec 19, 2024",
    status: "revoked",
    issuerOrg: "CodeMaster Institute",
    grade: "B",
  },
];

// Extended list for "View All" page
export const allCertificates = [
  ...recentCertificates,
  {
    id: "CS-2024-78425",
    recipient: "Lisa Anderson",
    recipientEmail: "lisa.anderson@example.com",
    course: "DevOps Fundamentals",
    courseCode: "DOF-2024",
    date: "Dec 18, 2024",
    status: "active",
    issuerOrg: "CloudTech University",
    grade: "A",
  },
  {
    id: "CS-2024-78424",
    recipient: "Robert Taylor",
    recipientEmail: "robert.taylor@example.com",
    course: "Blockchain Basics",
    courseCode: "BB-2024",
    date: "Dec 17, 2024",
    status: "active",
    issuerOrg: "CryptoLearn Academy",
    grade: "A+",
  },
  {
    id: "CS-2024-78423",
    recipient: "Maria Garcia",
    recipientEmail: "maria.garcia@example.com",
    course: "UI/UX Design",
    courseCode: "UXD-2024",
    date: "Dec 16, 2024",
    status: "pending",
    issuerOrg: "Design Institute",
    grade: null,
  },
];

// ============================================
// SINGLE CERTIFICATE DATA (for "Create Certificate" button)
// ============================================
export const singleCertificateFormData = {
  recipientName: "John Anderson",
  recipientEmail: "john.anderson@example.com",
  courseName: "Advanced Web Development",
  courseCode: "AWD-2024",
  issuerOrg: "TechCorp Academy",
  issueDate: "2024-12-25",
  expiryDate: null,
  grade: "A+",
  credits: "3.0",
  instructor: "Dr. Sarah Chen",
  certificateType: "completion",
  template: "modern",
  description: "Successfully completed all course requirements with outstanding performance",
  skills: ["React", "TypeScript", "Node.js", "MongoDB"],
};

// ============================================
// BULK CERTIFICATE DATA (for "Upload Batch" button)
// ============================================
export const bulkCertificateData = [
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

// CSV content for bulk upload
export const bulkCertificateCSV = `recipientName,recipientEmail,courseName,courseCode,issuerOrg,issueDate,expiryDate,grade,credits,instructor,certificateType,template
Sarah Mitchell,sarah.mitchell@example.com,Data Science Fundamentals,DSF-2024,DataLearn Institute,2024-12-20,2025-12-20,A,4.0,Prof. Michael Brown,completion,classic
Emily Davis,emily.davis@example.com,Machine Learning Basics,MLB-2024,AI Academy,2024-12-22,,A+,3.5,Dr. James Wilson,achievement,premium
Michael Brown,michael.brown@example.com,Cloud Architecture,CA-2024,CloudTech University,2024-12-23,2026-12-23,B+,4.0,Dr. Lisa Anderson,professional,modern
James Wilson,james.wilson@example.com,Cybersecurity Essentials,CSE-2024,SecureNet Academy,2024-12-21,2025-12-21,A,3.0,Prof. Robert Taylor,completion,minimalist
Jessica Martinez,jessica.martinez@example.com,Full Stack Development,FSD-2024,CodeMaster Institute,2024-12-24,,A+,5.0,Dr. David Lee,achievement,premium`;

// ============================================
// REPORT/ANALYTICS DATA (for "Export Report" button)
// ============================================
export const reportData = {
  period: "December 2024",
  generatedAt: new Date().toISOString(),
  summary: {
    totalCertificates: 1247,
    activeCertificates: 1089,
    expiredCertificates: 45,
    revokedCertificates: 13,
    pendingCertificates: 23,
    issuedThisMonth: 156,
    growthRate: 12.5,
  },
  byCourse: [
    { course: "Advanced Web Development", count: 245, percentage: 19.6 },
    { course: "Data Science Fundamentals", count: 189, percentage: 15.2 },
    { course: "Cloud Architecture", count: 167, percentage: 13.4 },
    { course: "Machine Learning Basics", count: 142, percentage: 11.4 },
    { course: "Cybersecurity Essentials", count: 128, percentage: 10.3 },
    { course: "Full Stack Development", count: 115, percentage: 9.2 },
    { course: "Other Courses", count: 261, percentage: 20.9 },
  ],
  byStatus: [
    { status: "active", count: 1089, percentage: 87.3 },
    { status: "pending", count: 23, percentage: 1.8 },
    { status: "expired", count: 45, percentage: 3.6 },
    { status: "revoked", count: 13, percentage: 1.0 },
  ],
  byMonth: [
    { month: "Jul 2024", count: 98 },
    { month: "Aug 2024", count: 112 },
    { month: "Sep 2024", count: 134 },
    { month: "Oct 2024", count: 145 },
    { month: "Nov 2024", count: 156 },
    { month: "Dec 2024", count: 156 },
  ],
  topRecipients: [
    { name: "John Anderson", certificates: 3 },
    { name: "Sarah Chen", certificates: 2 },
    { name: "Michael Brown", certificates: 2 },
    { name: "Emily Davis", certificates: 2 },
    { name: "James Wilson", certificates: 1 },
  ],
  topOrganizations: [
    { name: "TechCorp Academy", certificates: 245 },
    { name: "DataLearn Institute", certificates: 189 },
    { name: "CloudTech University", certificates: 167 },
    { name: "AI Academy", certificates: 142 },
    { name: "SecureNet Academy", certificates: 128 },
  ],
};

// ============================================
// NOTIFICATIONS DATA (for Bell button)
// ============================================
export const notifications = [
  {
    id: "notif-1",
    type: "success",
    title: "Certificate Issued",
    message: "Certificate CS-2024-78432 has been successfully issued to John Anderson",
    timestamp: "2024-12-25T10:30:00Z",
    read: false,
    action: {
      type: "view_certificate",
      certificateId: "CS-2024-78432",
    },
  },
  {
    id: "notif-2",
    type: "warning",
    title: "Bulk Upload Completed",
    message: "5 certificates have been processed. 1 failed validation.",
    timestamp: "2024-12-25T09:15:00Z",
    read: false,
    action: {
      type: "view_batch",
      batchId: "batch-2024-12-25-001",
    },
  },
  {
    id: "notif-3",
    type: "info",
    title: "Report Generated",
    message: "Monthly analytics report for December 2024 is ready for download",
    timestamp: "2024-12-25T08:00:00Z",
    read: true,
    action: {
      type: "download_report",
      reportId: "report-dec-2024",
    },
  },
  {
    id: "notif-4",
    type: "warning",
    title: "Certificate Expiring Soon",
    message: "23 certificates will expire in the next 30 days",
    timestamp: "2024-12-24T16:45:00Z",
    read: false,
    action: {
      type: "view_expiring",
    },
  },
  {
    id: "notif-5",
    type: "info",
    title: "New Recipient Added",
    message: "Sarah Mitchell has been added to the recipient list",
    timestamp: "2024-12-24T14:20:00Z",
    read: true,
    action: {
      type: "view_recipient",
      recipientId: "rec-2",
    },
  },
];

// ============================================
// SEARCH RESULTS DATA (for Search input)
// ============================================
export const searchResults = {
  certificates: [
    {
      id: "CS-2024-78432",
      recipient: "John Anderson",
      course: "Advanced Web Development",
      date: "Dec 25, 2024",
      status: "active",
    },
    {
      id: "CS-2024-78431",
      recipient: "Sarah Chen",
      course: "Data Science Fundamentals",
      date: "Dec 24, 2024",
      status: "active",
    },
  ],
  recipients: [
    {
      id: "rec-1",
      name: "John Anderson",
      email: "john.anderson@example.com",
      certificatesCount: 3,
    },
    {
      id: "rec-2",
      name: "Sarah Chen",
      email: "sarah.chen@example.com",
      certificatesCount: 2,
    },
  ],
  courses: [
    {
      id: "course-1",
      name: "Advanced Web Development",
      code: "AWD-2024",
      certificatesCount: 245,
    },
    {
      id: "course-2",
      name: "Data Science Fundamentals",
      code: "DSF-2024",
      certificatesCount: 189,
    },
  ],
};

// ============================================
// CERTIFICATE DETAIL DATA (for "View" button)
// ============================================
export const certificateDetailData = {
  id: "CS-2024-78432",
  recipientName: "John Anderson",
  recipientEmail: "john.anderson@example.com",
  courseName: "Advanced Web Development",
  courseCode: "AWD-2024",
  issuerOrg: "TechCorp Academy",
  issueDate: "2024-12-25",
  expiryDate: null,
  status: "active",
  grade: "A+",
  credits: "3.0",
  instructor: "Dr. Sarah Chen",
  certificateType: "completion",
  template: "modern",
  description: "Successfully completed all course requirements with outstanding performance",
  skills: ["React", "TypeScript", "Node.js", "MongoDB"],
  verificationUrl: "https://verify.certisecure.com/CS-2024-78432",
  qrCode: "CS-2024-78432",
  downloadUrl: "/certificates/CS-2024-78432.pdf",
  shareUrl: "https://certisecure.com/certificate/CS-2024-78432",
  metadata: {
    createdAt: "2024-12-25T10:30:00Z",
    updatedAt: "2024-12-25T10:30:00Z",
    issuedBy: "John Doe",
    verified: true,
    verificationCount: 12,
  },
};

// ============================================
// ANALYTICS DATA (for Analytics page)
// ============================================
export const analyticsData = {
  overview: {
    totalIssued: 1247,
    activeCertificates: 1089,
    expiredCertificates: 45,
    revokedCertificates: 13,
    pendingCertificates: 23,
    averageIssueTime: "2.5 hours",
    verificationRate: 87.3,
  },
  trends: {
    dailyIssuance: [
      { date: "2024-12-19", count: 12 },
      { date: "2024-12-20", count: 15 },
      { date: "2024-12-21", count: 18 },
      { date: "2024-12-22", count: 14 },
      { date: "2024-12-23", count: 16 },
      { date: "2024-12-24", count: 20 },
      { date: "2024-12-25", count: 22 },
    ],
    monthlyGrowth: [
      { month: "Jul 2024", count: 98, growth: 0 },
      { month: "Aug 2024", count: 112, growth: 14.3 },
      { month: "Sep 2024", count: 134, growth: 19.6 },
      { month: "Oct 2024", count: 145, growth: 8.2 },
      { month: "Nov 2024", count: 156, growth: 7.6 },
      { month: "Dec 2024", count: 156, growth: 0 },
    ],
  },
  distribution: {
    byCourse: reportData.byCourse,
    byStatus: reportData.byStatus,
    byOrganization: reportData.topOrganizations,
    byTemplate: [
      { template: "modern", count: 456, percentage: 36.6 },
      { template: "classic", count: 389, percentage: 31.2 },
      { template: "premium", count: 245, percentage: 19.6 },
      { template: "minimalist", count: 157, percentage: 12.6 },
    ],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get sample data for single certificate creation
export const getSingleCertificateSample = () => singleCertificateFormData;

// Get sample data for bulk certificate upload
export const getBulkCertificateSample = () => bulkCertificateData;

// Get sample report data
export const getReportSample = () => reportData;

// Get unread notifications count
export const getUnreadNotificationsCount = () => {
  return notifications.filter((n) => !n.read).length;
};

// Get sample certificate by ID
export const getCertificateById = (id: string) => {
  return allCertificates.find((cert) => cert.id === id) || certificateDetailData;
};

// Search certificates
export const searchCertificates = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return allCertificates.filter(
    (cert) =>
      cert.id.toLowerCase().includes(lowerQuery) ||
      cert.recipient.toLowerCase().includes(lowerQuery) ||
      cert.course.toLowerCase().includes(lowerQuery)
  );
};

// ============================================
// RECIPIENTS DATA (for Recipients page)
// ============================================
export const recipientsData = [
  {
    id: "rec-1",
    name: "John Anderson",
    email: "john.anderson@example.com",
    organization: "TechCorp Inc.",
    phone: "+1 (555) 123-4567",
    certificatesCount: 3,
    lastCertificateDate: "2024-12-25",
    status: "active",
    joinDate: "2024-01-15",
    totalCredits: 9.0,
  },
  {
    id: "rec-2",
    name: "Sarah Mitchell",
    email: "sarah.mitchell@example.com",
    organization: "DataCorp Ltd.",
    phone: "+1 (555) 234-5678",
    certificatesCount: 2,
    lastCertificateDate: "2024-12-20",
    status: "active",
    joinDate: "2024-02-20",
    totalCredits: 7.0,
  },
  {
    id: "rec-3",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    organization: "AI Solutions",
    phone: "+1 (555) 345-6789",
    certificatesCount: 2,
    lastCertificateDate: "2024-12-22",
    status: "active",
    joinDate: "2024-03-10",
    totalCredits: 6.5,
  },
  {
    id: "rec-4",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    organization: "CloudTech Systems",
    phone: "+1 (555) 456-7890",
    certificatesCount: 2,
    lastCertificateDate: "2024-12-23",
    status: "active",
    joinDate: "2024-04-05",
    totalCredits: 8.0,
  },
  {
    id: "rec-5",
    name: "James Wilson",
    email: "james.wilson@example.com",
    organization: "SecureNet Corp.",
    phone: "+1 (555) 567-8901",
    certificatesCount: 1,
    lastCertificateDate: "2024-12-21",
    status: "active",
    joinDate: "2024-05-12",
    totalCredits: 3.0,
  },
  {
    id: "rec-6",
    name: "Jessica Martinez",
    email: "jessica.martinez@example.com",
    organization: "CodeMaster Institute",
    phone: "+1 (555) 678-9012",
    certificatesCount: 1,
    lastCertificateDate: "2024-12-24",
    status: "active",
    joinDate: "2024-06-18",
    totalCredits: 5.0,
  },
  {
    id: "rec-7",
    name: "David Chen",
    email: "david.chen@example.com",
    organization: "CodeMaster Institute",
    phone: "+1 (555) 789-0123",
    certificatesCount: 1,
    lastCertificateDate: "2024-12-19",
    status: "inactive",
    joinDate: "2024-07-22",
    totalCredits: 3.0,
  },
  {
    id: "rec-8",
    name: "Lisa Anderson",
    email: "lisa.anderson@example.com",
    organization: "CloudTech University",
    phone: "+1 (555) 890-1234",
    certificatesCount: 1,
    lastCertificateDate: "2024-12-18",
    status: "active",
    joinDate: "2024-08-30",
    totalCredits: 3.5,
  },
  {
    id: "rec-9",
    name: "Robert Taylor",
    email: "robert.taylor@example.com",
    organization: "CryptoLearn Academy",
    phone: "+1 (555) 901-2345",
    certificatesCount: 1,
    lastCertificateDate: "2024-12-17",
    status: "active",
    joinDate: "2024-09-15",
    totalCredits: 4.0,
  },
  {
    id: "rec-10",
    name: "Maria Garcia",
    email: "maria.garcia@example.com",
    organization: "Design Institute",
    phone: "+1 (555) 012-3456",
    certificatesCount: 1,
    lastCertificateDate: "2024-12-16",
    status: "pending",
    joinDate: "2024-10-08",
    totalCredits: 3.0,
  },
];

// ============================================
// ORGANIZATIONS DATA (for Organizations page)
// ============================================
export const organizationsData = [
  {
    id: "org-1",
    name: "TechCorp Academy",
    domain: "techcorp.edu",
    logo: "/placeholder.svg",
    email: "contact@techcorp.edu",
    phone: "+1 (555) 100-0001",
    address: "123 Tech Street, San Francisco, CA 94105",
    status: "active",
    joinDate: "2023-01-15",
    certificatesIssued: 245,
    recipientsCount: 189,
    coursesCount: 12,
    plan: "Enterprise",
    contactPerson: "Dr. Sarah Chen",
    website: "https://techcorp.edu",
  },
  {
    id: "org-2",
    name: "DataLearn Institute",
    domain: "datalearn.edu",
    logo: "/placeholder.svg",
    email: "info@datalearn.edu",
    phone: "+1 (555) 200-0002",
    address: "456 Data Avenue, Boston, MA 02101",
    status: "active",
    joinDate: "2023-03-20",
    certificatesIssued: 189,
    recipientsCount: 156,
    coursesCount: 8,
    plan: "Professional",
    contactPerson: "Prof. Michael Brown",
    website: "https://datalearn.edu",
  },
  {
    id: "org-3",
    name: "AI Academy",
    domain: "aiacademy.edu",
    logo: "/placeholder.svg",
    email: "hello@aiacademy.edu",
    phone: "+1 (555) 300-0003",
    address: "789 AI Boulevard, Seattle, WA 98101",
    status: "active",
    joinDate: "2023-05-10",
    certificatesIssued: 142,
    recipientsCount: 128,
    coursesCount: 6,
    plan: "Professional",
    contactPerson: "Dr. James Wilson",
    website: "https://aiacademy.edu",
  },
  {
    id: "org-4",
    name: "CloudTech University",
    domain: "cloudtech.edu",
    logo: "/placeholder.svg",
    email: "support@cloudtech.edu",
    phone: "+1 (555) 400-0004",
    address: "321 Cloud Drive, Austin, TX 78701",
    status: "active",
    joinDate: "2023-07-05",
    certificatesIssued: 167,
    recipientsCount: 145,
    coursesCount: 10,
    plan: "Enterprise",
    contactPerson: "Dr. Lisa Anderson",
    website: "https://cloudtech.edu",
  },
  {
    id: "org-5",
    name: "SecureNet Academy",
    domain: "securenet.edu",
    logo: "/placeholder.svg",
    email: "contact@securenet.edu",
    phone: "+1 (555) 500-0005",
    address: "654 Security Lane, Washington, DC 20001",
    status: "active",
    joinDate: "2023-09-12",
    certificatesIssued: 128,
    recipientsCount: 112,
    coursesCount: 7,
    plan: "Professional",
    contactPerson: "Prof. Robert Taylor",
    website: "https://securenet.edu",
  },
  {
    id: "org-6",
    name: "CodeMaster Institute",
    domain: "codemaster.edu",
    logo: "/placeholder.svg",
    email: "info@codemaster.edu",
    phone: "+1 (555) 600-0006",
    address: "987 Code Street, New York, NY 10001",
    status: "active",
    joinDate: "2023-11-18",
    certificatesIssued: 115,
    recipientsCount: 98,
    coursesCount: 9,
    plan: "Starter",
    contactPerson: "Dr. David Lee",
    website: "https://codemaster.edu",
  },
  {
    id: "org-7",
    name: "CryptoLearn Academy",
    domain: "cryptolearn.edu",
    logo: "/placeholder.svg",
    email: "hello@cryptolearn.edu",
    phone: "+1 (555) 700-0007",
    address: "147 Blockchain Road, Miami, FL 33101",
    status: "pending",
    joinDate: "2024-01-15",
    certificatesIssued: 45,
    recipientsCount: 38,
    coursesCount: 3,
    plan: "Starter",
    contactPerson: "Dr. Alex Johnson",
    website: "https://cryptolearn.edu",
  },
  {
    id: "org-8",
    name: "Design Institute",
    domain: "designinstitute.edu",
    logo: "/placeholder.svg",
    email: "contact@designinstitute.edu",
    phone: "+1 (555) 800-0008",
    address: "258 Design Way, Los Angeles, CA 90001",
    status: "active",
    joinDate: "2024-02-20",
    certificatesIssued: 89,
    recipientsCount: 76,
    coursesCount: 5,
    plan: "Professional",
    contactPerson: "Prof. Sarah Williams",
    website: "https://designinstitute.edu",
  },
];

