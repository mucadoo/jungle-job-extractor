/**
 * REPRESENTATIVE TEST CASES DISTILLED FROM SNAPSHOTS
 * These fixtures represent real-world variations observed in Welcome to the Jungle job pages.
 */

// 1. JSON-LD with @graph (Modern WTTJ structure)
export const mockJsonLdWithGraph = `
<!DOCTYPE html>
<html>
<head>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "JobPosting",
          "title": "Software Engineer",
          "hiringOrganization": { "@type": "Organization", "name": "Tech Co" },
          "jobLocation": { "@type": "Place", "address": { "@type": "PostalAddress", "addressLocality": "Paris" } },
          "datePosted": "2024-03-20",
          "employmentType": "FULL_TIME",
          "description": "Develop great software.",
          "url": "https://www.welcometothejungle.com/fr/companies/tech-co/jobs/software-engineer"
        }
      ]
    }
    </script>
</head>
<body></body>
</html>
`;

// 2. Standard Metadata Badges (Fallback)
export const mockMetadataHTML = `
<!DOCTYPE html>
<html>
<body>
    <h1>Senior Product Designer</h1>
    <div data-testid="job-header-info">
        <ul>
            <li><i name="location"></i>Paris, France</li>
            <li><i name="contract"></i>CDI</li>
            <li><i name="salary"></i>55k - 70k €</li>
            <li><i name="remote"></i>Télétravail ponctuel</li>
            <li><i name="suitcase"></i>Expérience : > 5 ans</li>
            <li><i name="education_level"></i>Bac +5 / Master</li>
        </ul>
    </div>
    <meta property="og:title" content="Senior Product Designer - Creative Studio">
    <meta property="og:url" content="https://www.welcometothejungle.com/fr/companies/creative-studio/jobs/designer">
    
    <div data-testid="job-section-description">
        <h4>Job Description</h4>
        <p>Join our creative team.</p>
    </div>
    <div data-testid="job-section-profile">
        <h4>Profile</h4>
        <p>You have 5 years of experience.</p>
    </div>
</body>
</html>
`;

// 3. Minimal Case
export const mockMinimalHTML = `
<!DOCTYPE html>
<html>
<body>
    <h1>Candidature Spontanée</h1>
    <meta property="og:title" content="Candidature Spontanée - Bodyguard">
</body>
</html>
`;
