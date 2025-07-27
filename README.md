# Pack Assignment - File Upload System

A modern, full-featured file upload system built with SvelteKit, TypeScript, and PostgreSQL. This application provides a user-friendly interface for uploading, organizing, and managing various types of content files with advanced filtering, archiving, and tracking capabilities.

## 🚀 Features

### Core Functionality

- **File Upload with Modal Interface**: Clean, intuitive popup for uploading files
- **Comprehensive Metadata Collection**:
  - Title (max 200 characters)
  - Description (max 1000 characters)
  - Category selection (Leadership, Managing Complexity, etc.)
  - Language selection (English, Italian, Spanish, etc.)
  - Provider selection (Skilla, LinkedIn, Pack, etc.)
  - Multi-select roles (Mentor/Coach, Mentee/Coachee, etc.)
- **File Support**: PDF, TXT, Video files, PowerPoint, Excel, Word documents

### Advanced Features

- **Smart Content Filtering**:
  - Filter by content type (All, Videos, Documents, Lessons)
  - MIME type-based intelligent categorization
- **Archive Management**:
  - Archive/unarchive items with dedicated archive view
  - Clean separation between active and archived content
- **Interactive Table with Enhanced Features**:
  - **Sortable Columns**: Click any column header to sort (Title, Path, View Count, Provider, Type, Date)
  - **View Count Tracking**: Automatic increment when items are downloaded
  - **Actions Menu**: Right-click style menu for archive operations
- **One-Click Download**: Click any table row to download and track views
- **Modern Tab Interface**: Navigate between different content types and archive
- **Icon System**: Consistent, scalable icon library throughout the application
- **Responsive Design**: Works beautifully on desktop and mobile devices

## 🛠 Tech Stack

- **Frontend**: SvelteKit with TypeScript
- **Backend**: SvelteKit API routes
- **Database**: PostgreSQL with Drizzle ORM
- **Containerization**: Docker & Docker Compose
- **Styling**: Custom CSS with modern design principles
- **Icons**: Centralized icon component system

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Git](https://git-scm.com/)

## 🚀 Quick Start

The project is designed to be set up with just **1-2 commands**:

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd pack-assignment

# Run the automated setup command
npm run setup
```

This single command will:

1. Install all dependencies
2. Start the PostgreSQL database with Docker
3. Run database migrations
4. Set up the upload directory

### Option 2: Manual Setup

If you prefer to run each step manually:

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file and configure if needed
cp .env.example .env

# 3. Start the database
npm run docker:up

# 4. Wait a few seconds for the database to be ready, then run migrations
npm run db:migrate

# 5. Start the development server
npm run dev
```

## 🔧 Environment Configuration

The application uses the following environment variables (already configured in `.env.example`):

```env
DATABASE_URL=postgresql://packuser:packpass@localhost:5432/packdb
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

- `DATABASE_URL`: PostgreSQL connection string
- `UPLOAD_DIR`: Directory where uploaded files are stored
- `MAX_FILE_SIZE`: Maximum file size in bytes (default: 10MB)

## 📖 Usage

### Starting the Application

After setup, start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Navigation and Filtering

The top navigation bar provides several ways to view your content:

1. **All**: Shows all non-archived content
2. **Videos**: Filters to show only video files (mp4, avi, mov, etc.)
3. **Documents**: Filters to show documents (PDF, Word, Text, etc.)
4. **Lessons**: Filters to show presentation files (PowerPoint, slides, etc.)
5. **Archive**: Shows all archived items (separate from active content)

### Uploading Files

1. Click the **"Upload"** button (available in all tabs except Archive)
2. Fill in all required fields:
   - **Title**: Descriptive title (max 200 chars)
   - **Description**: Detailed description (max 1000 chars)
   - **Category**: Select from predefined categories
   - **Language**: Choose the content language
   - **Provider**: Select content provider
   - **Roles**: Multi-select relevant roles using the dropdown
   - **File**: Click "Select file" to choose your file
3. Click **"Upload"** to save

### Viewing and Managing Files

#### Table Features

- **Sorting**: Click any column header to sort by that field
  - Click again to reverse sort order
  - Visual indicators show current sort column and direction
- **View Tracking**: Each click on a row increments the view count
- **Download**: Click any row to download the file and track the view

#### Archive Management

- Click the **three dots** (⋮) in the Actions column for each item
- Select **"Archive"** to move items to the archive
- Switch to the **Archive** tab to view archived items
- Click **"Unarchive"** to restore items to active content

## 🗄️ Database Schema

The application uses a single `uploads` table with the following structure:

```sql
CREATE TABLE uploads (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  language VARCHAR(10) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  roles JSON NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  view_count INTEGER DEFAULT 0 NOT NULL,
  archived BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### Key Fields

- `view_count`: Tracks how many times an item has been downloaded
- `archived`: Boolean flag for archive status
- `mime_type`: Used for intelligent content type filtering

## 🚀 Available Scripts

```bash
npm run dev          # Start development server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Database scripts
npm run db:generate  # Generate database migrations
npm run db:migrate   # Run database migrations

# Docker scripts
npm run docker:up    # Start PostgreSQL with Docker
npm run docker:down  # Stop Docker containers

# Quick setup
npm run setup        # Complete setup in one command
```

## 🏗️ Project Structure

```
pack-assignment/
├── src/
│   ├── lib/
│   │   ├── components/          # Svelte components
│   │   │   ├── FileUploadModal.svelte
│   │   │   ├── UploadsTable.svelte
│   │   │   └── Icon.svelte      # Centralized icon system
│   │   ├── db/                  # Database configuration
│   │   │   ├── index.ts
│   │   │   ├── schema.ts
│   │   │   └── migrate.ts
│   │   ├── constants.ts         # Application constants
│   │   └── utils.ts            # Utility functions
│   ├── routes/
│   │   ├── api/uploads/        # API endpoints
│   │   │   ├── +server.ts      # Upload & fetch with filtering
│   │   │   └── [id]/
│   │   │       ├── download/+server.ts  # File download
│   │   │       ├── view/+server.ts      # View count increment
│   │   │       └── archive/+server.ts   # Archive operations
│   │   ├── +layout.svelte      # Main layout
│   │   └── +page.svelte        # Home page with tabs
│   ├── app.css                 # Global styles
│   ├── app.d.ts               # TypeScript declarations
│   └── app.html               # HTML template
├── static/                     # Static assets
├── uploads/                    # Uploaded files (auto-created)
├── docker-compose.yml         # PostgreSQL setup
├── drizzle.config.ts          # Database configuration
└── package.json               # Dependencies and scripts
```

## 🎯 API Endpoints

### Core Endpoints

- `GET /api/uploads` - Fetch uploads with filtering support
  - Query params: `archived=true/false`, `filter=videos/documents/lessons`
- `POST /api/uploads` - Upload new file

### File Operations

- `GET /api/uploads/[id]/download` - Download file and increment view count
- `POST /api/uploads/[id]/view` - Increment view count
- `POST /api/uploads/[id]/archive` - Archive/unarchive item

## 🎨 UI Components

### Icon System

The application includes a centralized icon component (`Icon.svelte`) with:

- Consistent sizing and styling
- Support for various UI, status, and content icons
- Easy-to-use props: `name`, `size`, `class_`

### Responsive Features

- Mobile-optimized table layout
- Collapsible navigation on smaller screens
- Touch-friendly interaction elements

## 🔒 Security Features

- **File Type Validation**: Only allows specific file types
- **File Size Limits**: Configurable maximum file size (10MB default)
- **Input Validation**: Server-side validation for all form fields
- **Unique Filenames**: Prevents file conflicts with timestamp and random strings
- **SQL Injection Protection**: Uses parameterized queries with Drizzle ORM
- **Archive Protection**: Archived items are logically separated from active content

## 🐛 Troubleshooting

### Database Connection Issues

If you encounter database connection problems:

```bash
# Check if PostgreSQL container is running
docker ps

# Restart the database
npm run docker:down
npm run docker:up

# Wait a few seconds, then retry migrations
npm run db:migrate
```

### Migration Issues

If you need to reset the database:

```bash
# Stop the database
npm run docker:down

# Remove the volume (this will delete all data)
docker volume rm pack-assignment_postgres_data

# Restart and migrate
npm run docker:up
npm run db:migrate
```

### Port Conflicts

If port 5173 (frontend) or 5432 (database) is already in use:

- **Frontend**: SvelteKit will automatically try the next available port
- **Database**: Modify the port in `docker-compose.yml` and update `DATABASE_URL`

### Upload Directory Permissions

If file uploads fail:

```bash
# Ensure upload directory exists and has proper permissions
mkdir -p uploads
chmod 755 uploads
```

**Happy coding! 🎉**
