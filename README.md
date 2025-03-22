# Campus Shuttle Management System

A modern, full-stack web application for managing university campus shuttle services. Built with React, TypeScript, Supabase, and Tailwind CSS.

![Campus Shuttle](https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80)

## Features

### 🚌 For Students
- **Real-time Booking System**
  - Book shuttle rides between campus locations
  - View available routes and stops
  - Track booking history
  - Points-based payment system

- **Interactive Campus Map**
  - Real-time location tracking
  - View all shuttle stops
  - Find nearest stops
  - View campus facilities

- **Smart Route Planning**
  - Optimal route suggestions
  - Transfer point recommendations
  - Wait time estimates
  - Peak hours information

### 👨‍💼 For Administrators
- **User Management**
  - Manage student accounts
  - Control point allocations
  - View user statistics

- **Route Management**
  - Create and modify routes
  - Set peak hours
  - Manage transfer points
  - Update stop locations

### 💳 Point System
- Initial 500 points for new users
- Recharge points through UPI payments
- Point deduction based on route distance
- Transaction history tracking

## Technology Stack

- **Frontend**
  - React 18
  - TypeScript
  - Tailwind CSS
  - Lucide React (icons)
  - React Router v6
  - Zustand (state management)
  - Leaflet (maps)

- **Backend**
  - Supabase
  - PostgreSQL
  - Row Level Security (RLS)
  - Real-time subscriptions

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Environment Setup
1. Clone the repository
```bash
git clone https://github.com/siddham05/campus-shuttle.git
cd campus-shuttle
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
npm run dev
```

### Database Setup

The project uses Supabase as the backend. The following tables are required:

- `users`: User accounts and points
- `routes`: Shuttle routes
- `stops`: Stop locations
- `route_stops`: Route-stop relationships
- `bookings`: Ride bookings
- `transactions`: Point transactions
- `transfer_points`: Route transfer locations

Migration files are available in the `supabase/migrations` directory.

## Security

- Row Level Security (RLS) policies for all tables
- Role-based access control (Student/Admin)
- Secure authentication flow
- Protected API endpoints

## Project Structure

```
campus-shuttle/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/         # Page components
│   ├── lib/           # Utilities and configurations
│   ├── store/         # State management
│   ├── types/         # TypeScript types
│   └── utils/         # Helper functions
├── public/            # Static assets
├── supabase/          # Database migrations
└── ...configuration files
```

## Key Features Implementation

### Authentication Flow
- Email/password authentication
- Session management
- Role-based access control
- Protected routes

### Booking System
- Real-time availability checking
- Point calculation
- Route optimization
- Transfer point handling

### Maps Integration
- Interactive campus map
- Real-time location tracking
- Stop visualization
- Distance calculations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Supabase](https://supabase.io/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for the styling system
- [Lucide](https://lucide.dev/) for the beautiful icons
- [Leaflet](https://leafletjs.com/) for the mapping functionality

## Contact

Siddham Jain - siddhamj5@gmail.com

Project Link: [https://github.com/siddham05/campus-shuttle](https://github.com/siddham05/campus-shuttle)