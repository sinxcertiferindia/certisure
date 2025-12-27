# Dashboard Buttons Sample Data Guide

This guide explains all the sample data available for each button and feature in the Dashboard.

## 📊 Dashboard Buttons Overview

### 1. **"Issue Certificate" Button** (Header - Top Right)
- **Location**: Dashboard header, next to notifications bell
- **Sample Data**: `getSingleCertificateSample()`
- **Data Structure**:
```typescript
{
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
  description: "Successfully completed all course requirements...",
  skills: ["React", "TypeScript", "Node.js", "MongoDB"]
}
```

### 2. **"Create Certificate" Button** (Quick Actions - Issue Single Certificate Card)
- **Location**: Quick Actions section, first card
- **Sample Data**: `getSingleCertificateSample()`
- **Usage**: Same as "Issue Certificate" button
- **Action**: Opens single certificate creation form

### 3. **"Upload Batch" Button** (Quick Actions - Bulk Issuance Card)
- **Location**: Quick Actions section, second card
- **Sample Data**: `getBulkCertificateSample()` or `bulkCertificateCSV`
- **Data Structure**: Array of 5 certificate objects
- **CSV Format**: Available at `/public/sample-certificates.csv`
- **Usage**:
```typescript
import { getBulkCertificateSample, bulkCertificateCSV } from '@/data/dashboardSampleData';

// For form/array data
const bulkData = getBulkCertificateSample();

// For CSV file upload
const csvContent = bulkCertificateCSV;
```

### 4. **"Export Report" Button** (Quick Actions - Generate Report Card)
- **Location**: Quick Actions section, third card
- **Sample Data**: `getReportSample()`
- **Data Includes**:
  - Summary statistics
  - Certificates by course
  - Certificates by status
  - Monthly trends
  - Top recipients
  - Top organizations
- **Usage**:
```typescript
import { getReportSample } from '@/data/dashboardSampleData';

const reportData = getReportSample();
// Contains: summary, byCourse, byStatus, byMonth, topRecipients, topOrganizations
```

### 5. **"View All" Button** (Recent Certificates Table)
- **Location**: Recent Certificates card header
- **Sample Data**: `allCertificates` array
- **Extended List**: 9+ certificates with full details
- **Data Fields**: id, recipient, recipientEmail, course, courseCode, date, status, issuerOrg, grade

### 6. **"View" Button** (Certificate Table Row)
- **Location**: Each row in Recent Certificates table
- **Sample Data**: `getCertificateById(certificateId)`
- **Full Details**: Includes verification URL, QR code, download links, metadata
- **Usage**:
```typescript
import { getCertificateById } from '@/data/dashboardSampleData';

const certificate = getCertificateById("CS-2024-78432");
```

### 7. **Notifications Bell** (Header)
- **Location**: Dashboard header, next to search
- **Sample Data**: `notifications` array
- **Unread Count**: `getUnreadNotificationsCount()`
- **Notification Types**: success, warning, info
- **Data Structure**:
```typescript
{
  id: "notif-1",
  type: "success",
  title: "Certificate Issued",
  message: "Certificate CS-2024-78432 has been successfully issued...",
  timestamp: "2024-12-25T10:30:00Z",
  read: false,
  action: { type: "view_certificate", certificateId: "CS-2024-78432" }
}
```

### 8. **Search Input** (Header)
- **Location**: Dashboard header
- **Sample Data**: `searchResults` object
- **Search Function**: `searchCertificates(query)`
- **Returns**: Certificates, recipients, and courses matching the query

## 📁 Available Sample Data Files

### Main Data File
- **`src/data/dashboardSampleData.ts`** - Complete sample data for all dashboard features

### Related Files
- **`src/data/sampleCertificateData.ts`** - Additional certificate-specific sample data
- **`public/sample-certificates.csv`** - CSV file for bulk upload testing

## 🔧 Usage Examples

### Example 1: Handle Single Certificate Creation
```typescript
import { getSingleCertificateSample } from '@/data/dashboardSampleData';

const handleCreateCertificate = () => {
  const sampleData = getSingleCertificateSample();
  // Pre-fill form with sample data
  setFormData(sampleData);
  // Open certificate creation modal
  setModalOpen(true);
};
```

### Example 2: Handle Bulk Upload
```typescript
import { getBulkCertificateSample, bulkCertificateCSV } from '@/data/dashboardSampleData';

const handleBulkUpload = () => {
  // Option 1: Use array data
  const bulkData = getBulkCertificateSample();
  
  // Option 2: Use CSV string
  const csvBlob = new Blob([bulkCertificateCSV], { type: 'text/csv' });
  const csvFile = new File([csvBlob], 'sample-certificates.csv', { type: 'text/csv' });
  
  // Process bulk upload
  processBulkUpload(bulkData);
};
```

### Example 3: Generate Report
```typescript
import { getReportSample } from '@/data/dashboardSampleData';

const handleExportReport = () => {
  const reportData = getReportSample();
  
  // Generate PDF/CSV from report data
  generatePDFReport(reportData);
  // or
  generateCSVReport(reportData);
};
```

### Example 4: Display Notifications
```typescript
import { notifications, getUnreadNotificationsCount } from '@/data/dashboardSampleData';

const NotificationBell = () => {
  const unreadCount = getUnreadNotificationsCount();
  const unreadNotifications = notifications.filter(n => !n.read);
  
  return (
    <Button>
      <Bell />
      {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
    </Button>
  );
};
```

### Example 5: Search Functionality
```typescript
import { searchCertificates } from '@/data/dashboardSampleData';

const handleSearch = (query: string) => {
  const results = searchCertificates(query);
  setSearchResults(results);
};
```

## 📋 Data Structures Reference

### Certificate Object
```typescript
{
  id: string;
  recipient: string;
  recipientEmail: string;
  course: string;
  courseCode: string;
  date: string;
  status: "active" | "pending" | "expired" | "revoked";
  issuerOrg: string;
  grade?: string;
}
```

### Report Data Structure
```typescript
{
  period: string;
  generatedAt: string;
  summary: {
    totalCertificates: number;
    activeCertificates: number;
    expiredCertificates: number;
    revokedCertificates: number;
    pendingCertificates: number;
    issuedThisMonth: number;
    growthRate: number;
  };
  byCourse: Array<{ course: string; count: number; percentage: number }>;
  byStatus: Array<{ status: string; count: number; percentage: number }>;
  byMonth: Array<{ month: string; count: number }>;
  topRecipients: Array<{ name: string; certificates: number }>;
  topOrganizations: Array<{ name: string; certificates: number }>;
}
```

## 🎯 Quick Reference

| Button | Import | Function | Returns |
|--------|--------|----------|---------|
| Issue Certificate | `getSingleCertificateSample` | Single cert object | CertificateFormData |
| Create Certificate | `getSingleCertificateSample` | Single cert object | CertificateFormData |
| Upload Batch | `getBulkCertificateSample` | Array of certs | CertificateFormData[] |
| Export Report | `getReportSample` | Report object | ReportData |
| View Certificate | `getCertificateById` | Single cert details | CertificateDetail |
| Notifications | `getUnreadNotificationsCount` | Unread count | number |
| Search | `searchCertificates` | Filtered results | Certificate[] |

## 💡 Tips

1. **All sample data is ready to use** - No need to modify, just import and use
2. **CSV file available** - Download `/public/sample-certificates.csv` for testing bulk uploads
3. **Helper functions included** - Use `getCertificateById`, `searchCertificates`, etc.
4. **TypeScript types** - All data is properly typed for better IDE support
5. **Console logging** - Current implementation logs sample data to console for testing

## 🔄 Next Steps

1. Replace `console.log` statements with actual form/modal implementations
2. Connect buttons to respective pages/components
3. Implement file upload for bulk certificate CSV
4. Add PDF/CSV export functionality for reports
5. Create notification dropdown/modal component
6. Implement search results display

