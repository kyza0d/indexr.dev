# Indexr: Data Exploration and Visualization Tool

## Overview

Indexr is a comprehensive web-based application designed for efficient exploration and visualization of JSON and CSV datasets. It provides users with powerful tools to upload, analyze, and interact with complex data structures through an intuitive interface.

## Features

- Dataset Upload: Support for JSON and CSV file formats
- Data Visualization: Tree view for hierarchical data and Grid view for tabular data
- Advanced Search: Efficient data querying with support for complex search patterns
- Data Exploration: Interactive navigation through large datasets
- User Authentication: Secure access control for datasets
- Public/Private Datasets: Ability to share datasets or keep them private
- Auto-tagging: Automatic categorization of datasets using AI
- Raw Data View: Access to original data format with syntax highlighting
- Responsive Design: Optimized for various screen sizes and devices

## Technologies Used

- Frontend:
  - React (Next.js framework)
  - TypeScript
  - Tailwind CSS for styling
  - Radix UI for accessible component primitives
  - React Hook Form for form handling
  - Zod for schema validation
- Backend:
  - Next.js API routes
  - Prisma as the ORM
  - PostgreSQL database
- Authentication:
  - NextAuth.js for authentication
- State Management:
  - React Context API
- Data Processing:
  - Custom utilities for data normalization and type inference
- Search:
  - Fuse.js for fuzzy searching
- Data Visualization:
  - react-virtuoso for virtual scrolling
  - react-resizable-panels for resizable layout
- AI Integration:
  - OpenAI API for auto-tagging feature
- File Handling:
  - @vercel/blob for file storage
- Deployment:
  - Vercel for hosting and serverless functions

## Use Cases

1. Data Analysis: Researchers and analysts can quickly explore large datasets, identifying patterns and anomalies.
2. API Response Inspection: Developers can use Indexr to visualize and navigate complex API responses.
3. Configuration Management: IT professionals can manage and explore configuration files in JSON format.
4. Data Cleaning: Data scientists can inspect and clean datasets before further processing.
5. Educational Tool: Students and educators can use Indexr to learn about data structures and JSON/CSV formats.
6. Business Intelligence: Managers can explore business data in a user-friendly interface without needing technical skills.
7. Open Data Exploration: Researchers and journalists can analyze and visualize public datasets.

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/kyza0d/indexr.dev
   cd indexr
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env.local` and fill in the required values.

4. Set up the database:
   ```
   npx prisma migrate dev
   ```

5. Run the development server:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

- Database: Configure your PostgreSQL connection string in the `.env.local` file.
- Authentication: Set up your OAuth providers (Google, GitHub) in the NextAuth configuration.
- File Storage: Configure your Vercel Blob storage settings.
- AI Integration: Add your OpenAI API key for the auto-tagging feature.

## Usage

1. Sign up or log in to your account.
2. Upload a JSON or CSV file using the upload feature.
3. Explore your data using the Tree or Grid view.
4. Use the search functionality to find specific data points.
5. Toggle between public and private visibility for your datasets.
6. Use the auto-tagging feature to automatically categorize your data.
7. Access the raw data view for a closer look at the original file format.

## Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments
- Special thanks to the open-source community for the amazing tools and libraries that make this project possible.
