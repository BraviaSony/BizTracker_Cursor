# BizFlow Tracker

A comprehensive full-stack web application for tracking business finances, built with Next.js and Supabase.

## Features

### Core Features
- **User Authentication**: Secure sign up, login, and logout with Supabase Auth
- **Dashboard**: Real-time overview of financial health with key metrics
- **Expenses Tracking**: Categorize and track business expenses with detailed filtering
- **Liabilities Management**: Monitor loans, credit cards, and outstanding payments
- **Salary Management**: Track employee salaries and payment status
- **Cashflow Analysis**: Monitor money flowing in and out of your business
- **Bank PDC Tracking**: Manage post-dated cheques and their status
- **Capital Injections**: Track equity, loans, investments, and grants

### UI/UX Features
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode**: Toggle between light and dark themes
- **Modern UI**: Clean, intuitive interface with reusable components
- **Advanced Filtering**: Search and filter data by date, category, status, and more
- **Real-time Updates**: Instant data synchronization across all modules

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Hook Form** - Form handling
- **Recharts** - Data visualization
- **React Hot Toast** - Notifications

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Authentication
  - API generation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Testing Library** - Component testing

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bizflow-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Run the database migrations (see Database Setup below)

4. **Environment Variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Setup

1. **Run the migration**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
   - Execute the migration

2. **Verify the setup**
   - Check that all tables are created
   - Verify Row Level Security policies are enabled
   - Test authentication flow

## Project Structure

```
bizflow-tracker/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard page
│   ├── expenses/          # Expenses module
│   ├── liabilities/       # Liabilities module
│   ├── salaries/          # Salaries module
│   ├── cashflow/          # Cashflow module
│   ├── pdc/              # Bank PDC module
│   ├── capital/          # Capital injections module
│   ├── settings/         # Settings page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page (auth)
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   └── auth/             # Authentication components
├── lib/                  # Utility functions
│   ├── supabase.ts       # Supabase client
│   ├── theme.ts          # Theme configuration
│   └── utils.ts          # Helper functions
├── types/                # TypeScript type definitions
├── supabase/             # Database migrations
└── public/               # Static assets
```

## Features Overview

### Dashboard
- Financial overview with key metrics
- Quick action buttons
- Real-time data updates
- Visual indicators for financial health

### Expenses Module
- Categorize expenses (office supplies, utilities, rent, etc.)
- Track amounts, dates, and notes
- Advanced filtering and search
- Monthly/yearly expense summaries

### Liabilities Module
- Track different types of liabilities (loans, credit cards, etc.)
- Monitor outstanding amounts and due dates
- Interest rate tracking
- Overdue alerts and notifications

### Salaries Module
- Employee management
- Monthly salary tracking
- Payment status (paid/unpaid/pending)
- Salary history and reports

### Cashflow Module
- Track money inflow and outflow
- Categorize transactions
- Net cashflow calculations
- Monthly trend analysis

### Bank PDC Module
- Post-dated cheque management
- Status tracking (pending/cleared/bounced/cancelled)
- Due date monitoring
- Overdue alerts

### Capital Injections Module
- Track different types of capital (equity, loans, investments)
- Source and description tracking
- Capital type breakdown
- Investment timeline

## API Routes

The application uses Supabase's auto-generated API with Row Level Security:

- **Authentication**: `supabase.auth.*`
- **Profiles**: `profiles` table
- **Expenses**: `expenses` table
- **Liabilities**: `liabilities` table
- **Employees**: `employees` table
- **Salaries**: `salaries` table
- **Cashflow**: `cashflow` table
- **Bank PDC**: `bank_pdc` table
- **Capital Injections**: `capital_injections` table

## Security

- **Row Level Security (RLS)**: All data is protected by user-specific policies
- **Authentication**: Secure user authentication with Supabase Auth
- **Data Validation**: Client and server-side validation
- **Type Safety**: Full TypeScript coverage

## Deployment

### Deploy to Render

1. **Connect your repository** to Render
2. **Set environment variables** in Render dashboard
3. **Deploy** - Render will automatically build and deploy

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_APP_URL=https://your-app.onrender.com
```

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

### Code Style

- **ESLint**: Configured with Next.js recommended rules
- **Prettier**: Automatic code formatting
- **TypeScript**: Strict mode enabled
- **Tailwind CSS**: Utility-first styling approach

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@bizflowtracker.com or create an issue in the repository.

## Roadmap

- [ ] Advanced reporting and analytics
- [ ] Data export functionality
- [ ] Mobile app (React Native)
- [ ] Multi-currency support
- [ ] Integration with accounting software
- [ ] Automated expense categorization
- [ ] Budget planning and forecasting
- [ ] Team collaboration features

---

Built with ❤️ using Next.js and Supabase
