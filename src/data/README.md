# Sample Certificate Data

This directory contains sample data for certificate button options in the CertiFlow Pro application.

## Files

- `sampleCertificateData.ts` - TypeScript file containing all sample data structures and helper functions

## Usage

### Single Certificate Creation

```typescript
import { sampleSingleCertificate, generateSampleCertificate } from '@/data/sampleCertificateData';

// Use pre-defined sample data
const certificate = sampleSingleCertificate;

// Or generate with custom overrides
const customCertificate = generateSampleCertificate({
  recipientName: "Jane Doe",
  courseName: "React Advanced",
  template: "premium"
});
```

### Bulk Certificate Creation

```typescript
import { sampleBulkCertificates, sampleCSVContent } from '@/data/sampleCertificateData';

// Use array of sample certificates
const bulkData = sampleBulkCertificates;

// Or use CSV content string
const csvData = sampleCSVContent;
```

### Certificate Templates

```typescript
import { certificateTemplates } from '@/data/sampleCertificateData';

// Available templates: modern, classic, minimalist, premium
const templates = certificateTemplates;
```

### Certificate Types

```typescript
import { certificateTypes } from '@/data/sampleCertificateData';

// Available types: completion, achievement, participation, professional
const types = certificateTypes;
```

## CSV File for Bulk Upload

A sample CSV file is available at `/public/sample-certificates.csv` that can be downloaded and used for bulk certificate uploads.

## Data Structure

Each certificate includes:
- `recipientName` - Full name of the certificate recipient
- `recipientEmail` - Email address of the recipient
- `courseName` - Name of the course/program
- `courseCode` - Course code/identifier
- `issuerOrg` - Organization issuing the certificate
- `issueDate` - Date when certificate is issued (YYYY-MM-DD)
- `expiryDate` - Optional expiry date (YYYY-MM-DD or null)
- `grade` - Grade or score (optional)
- `credits` - Credit hours (optional)
- `instructor` - Instructor name (optional)
- `certificateType` - Type of certificate
- `template` - Visual template to use
- `description` - Additional description (optional)
- `skills` - Array of skills learned (optional)

## Example: Using in Forms

```typescript
import { generateSampleCertificate } from '@/data/sampleCertificateData';

// In your certificate creation form
const handleLoadSample = () => {
  const sample = generateSampleCertificate();
  setFormData(sample);
};
```

