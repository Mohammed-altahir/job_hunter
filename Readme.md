# Job Scraper

A Node.js API for scraping job listings and job details from LinkedIn using Puppeteer.

## Features

- Scrape LinkedIn job listings by keyword.
- Retrieve detailed information for a specific LinkedIn job posting.
- REST API built with Express.
- Uses Puppeteer for headless browser automation.

## Requirements

- Node.js (v14 or higher recommended)
- npm

## Installation

1. Clone the repository:

   ```sh
   git clone <your-repo-url>
   cd Job\ Scraper
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

## Usage

Start the API server:

```sh
npm run run
```

The server will start on port `3000` by default, or the port specified in the `PORT` environment variable.

## API Endpoints

### 1. Scrape Job Listings

**POST** `/scrape`

Scrapes LinkedIn for job listings matching the provided search term.

#### Request Body

```json
{
  "searchTerm": "software engineer"
}
```

#### Response

```json
{
  "Linkedin_Jobs": [
    {
      "title": "Software Engineer",
      "link": "/jobs/view/123456789",
      "company": "Example Corp",
      "location": "San Francisco, CA",
      "timePosted": "2 days ago"
    },
    ...
  ]
}
```

### 2. Get Job Details

**POST** `/details`

Retrieves detailed information for a specific LinkedIn job posting.

#### Request Body

```json
{
  "url": "https://www.linkedin.com/jobs/view/123456789"
}
```

#### Response

```json
{
  "Job_Details": {
    "numberOfApplicants": "23 applicants",
    "payRange": "$100,000 - $120,000/year",
    "details": "Full job description text...",
    "criteria": [
      {
        "criteria": "Seniority level",
        "prioity": "Entry level"
      },
      ...
    ]
  }
}
```

## Notes

- The scraper uses Puppeteer to automate a browser. LinkedIn may block or limit scraping activity.
- The `/scrape` endpoint returns relative job links. To get the full URL, prepend `https://www.linkedin.com` to the `link` field.
- The `/details` endpoint requires a full LinkedIn job URL.

## Development

- The main application logic is in [index.js](index.js).
- Modify selectors in the scraping functions if LinkedIn updates their HTML structure.

## License

ISC

## Author

Mohammed