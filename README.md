# Sarkari Spark - Government Exam Preparation Platform

![Sarkari Spark Logo](https://via.placeholder.com/200x80/2563eb/ffffff?text=Sarkari+Spark)

A comprehensive full-stack SaaS educational platform for government exam preparation, mock tests, analytics, and online learning with flexible subscription plans.

## Features

### Core Features
- **Online Mock Tests**: Practice with timed exams for SSC, Banking, Railway, State Exams
- **Detailed Analytics**: Track your progress with performance insights
- **Admit Card System**: Generate and download admit cards
- **Result System**: View and download results with roll number search
- **Leaderboard**: Compete with other users and see rankings

### Premium Features
- **Flexible Subscription Plans**: 3 pricing options with 3 duration choices
  - Single Exam: Access to 1 specific exam
  - Custom Selection: Select multiple exams (2-10 exams)
  - All Exams: Unlimited access to all premium exams
- **Multiple Durations**: Monthly, 6 Months, Yearly plans
- **Dynamic Pricing**: Admin-controlled pricing with discount support
- **Coupon System**: Apply discount codes with plan-specific applicability
- **Razorpay Integration**: Secure payment processing

### Admin Features
- **Admin Dashboard**: Full control system for exam management
- **Pricing Management**: Complete control over subscription pricing
- **Coupon Management**: Create, edit, and manage discount codes
- **User Management**: View and manage user accounts
- **Analytics Dashboard**: Track revenue, user growth, and engagement
- **Exam Management**: Create, edit, and organize exams by category

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Razorpay Payment Gateway
- Express Validator

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- React Query
- Zustand (State Management)
- Recharts (Analytics)
- Lucide React (Icons)

## Project Structure

```
sarkari-spark/
├── backend/                 # Node.js + Express API
│   ├── config/             # Database configuration
│   ├── controllers/        # API controllers
│   ├── middleware/         # Auth, error handling, upload
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── .env.example        # Environment variables template
│   ├── package.json
│   └── server.js           # Entry point
│
└── frontend/               # Next.js application
    ├── src/
    │   ├── app/            # Next.js app router
    │   ├── components/     # React components
    │   │   ├── admin/      # Admin dashboard components
    │   │   ├── auth/       # Authentication components
    │   │   ├── dashboard/  # User dashboard
    │   │   ├── exam/       # Exam-related components
    │   │   ├── layout/     # Layout components
    │   │   └── ui/         # Reusable UI components
    │   ├── context/        # React contexts
    │   ├── hooks/          # Custom hooks
    │   ├── lib/            # Utility functions & API
    │   └── utils/          # Helper functions
    ├── package.json
    ├── tailwind.config.ts
    └── next.config.js
```

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account or local MongoDB
- Razorpay account (for payments)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file:
```bash
cp .env.example .env
```

4. Update .env with your credentials:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
FRONTEND_URL=http://localhost:3000
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create .env.local file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Pages & Routes

### Public Pages
- `/` - Home page with hero section, featured exams, and statistics
- `/exams` - Browse all available exams with filters
- `/exam/[id]` - Exam details page with syllabus and instructions
- `/login` - User login page
- `/register` - User registration page
- `/forgot-password` - Password reset request
- `/reset-password/[token]` - Password reset form

### User Pages (Protected)
- `/dashboard` - User dashboard with recent activity and stats
- `/exam/[id]/start` - Start exam interface with timer
- `/exam/[id]/review` - Review submitted exam with answers
- `/results` - View all exam results
- `/result/[id]` - Detailed result analysis
- `/profile` - User profile management
- `/payment` - Subscription plans and payment page
- `/my-subscription` - Current subscription details

### Admin Pages (Protected)
- `/admin` - Admin dashboard overview
- `/admin/exams` - Exam management (CRUD)
- `/admin/exams/create` - Create new exam
- `/admin/exams/[id]/edit` - Edit existing exam
- `/admin/exams/[id]/questions` - Manage exam questions
- `/admin/users` - User management
- `/admin/analytics` - Analytics dashboard
- `/admin/pricing` - Pricing and coupon management
- `/admin/settings` - Site settings and configuration

## Pricing Plans

### Default Pricing Structure

#### Single Exam (Per Exam)
- **Monthly**: ₹99
- **6 Months**: ₹249
- **Yearly**: ₹399
- Access to 1 selected exam only

#### Custom Selection (Pay per selected exam)
- **Monthly**: ₹79 per exam (min 2, max 10 exams)
- **6 Months**: ₹199 per exam (min 2, max 10 exams)
- **Yearly**: ₹349 per exam (min 2, max 10 exams)
- Select multiple exams, pay per exam

#### All Exams Access
- **Monthly**: ₹299
- **6 Months**: ₹799
- **Yearly**: ₹1499
- Unlimited access to all premium exams

*Note: All pricing is configurable from admin panel*

## Coupon System

### Coupon Types
- **Percentage Discount**: X% off on total amount
- **Fixed Discount**: ₹X off on total amount

### Coupon Applicability
- **All Plans**: Works on all subscription types
- **Single Exam Only**: Works only on single exam plans
- **Custom Selection Only**: Works only on custom selection plans
- **All Exams Only**: Works only on all exams plans

### Coupon Features
- Usage limit (total uses)
- User limit (per user)
- Validity period (start/end date)
- Minimum purchase amount
- Maximum discount cap (for percentage coupons)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Update password

### Exams
- `GET /api/exams` - Get all exams
- `GET /api/exams/:id` - Get single exam
- `GET /api/exams/:id/questions` - Get exam questions (protected)
- `POST /api/exams` - Create exam (admin)
- `PUT /api/exams/:id` - Update exam (admin)
- `DELETE /api/exams/:id` - Delete exam (admin)

### Questions
- `GET /api/questions/exam/:examId` - Get exam questions
- `POST /api/questions` - Create question (admin)
- `POST /api/questions/bulk` - Bulk create questions (admin)
- `PUT /api/questions/:id` - Update question (admin)
- `DELETE /api/questions/:id` - Delete question (admin)

### Results
- `POST /api/results` - Submit exam result
- `GET /api/results` - Get user results
- `GET /api/results/analytics` - Get analytics
- `GET /api/results/search` - Search results by roll number
- `GET /api/results/leaderboard/:examId` - Get leaderboard

### Payments
- `POST /api/payments/order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments` - Get payment history
- `GET /api/payments/subscription-status` - Get subscription status
- `GET /api/payments/check-exam-access/:examId` - Check exam access

### Coupons
- `GET /api/coupons` - Get all coupons (admin)
- `POST /api/coupons` - Create coupon (admin)
- `PUT /api/coupons/:id` - Update coupon (admin)
- `DELETE /api/coupons/:id` - Delete coupon (admin)
- `POST /api/coupons/validate` - Validate coupon code

### Settings
- `GET /api/settings` - Get site settings
- `PUT /api/settings` - Update site settings (admin)

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/payments` - Get all payments
- `GET /api/admin/analytics` - Get analytics data

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
FRONTEND_URL=http://localhost:3000
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
```

## Deployment

### Backend Deployment Options

#### Option 1: Render (Recommended)
1. Push code to GitHub
2. Create account on [Render](https://render.com)
3. Connect repository
4. Add environment variables
5. Deploy as Web Service

#### Option 2: Railway
1. Push code to GitHub
2. Create account on [Railway](https://railway.app)
3. New Project → Deploy from GitHub
4. Add environment variables
5. Deploy

#### Option 3: VPS (DigitalOcean/Hostinger)
1. Create VPS instance
2. SSH into server
3. Install Node.js, MongoDB, Nginx
4. Clone repository
5. Install dependencies: `npm install`
6. Install PM2: `npm install -g pm2`
7. Start server: `pm2 start server.js`
8. Configure Nginx reverse proxy
9. Setup SSL with Let's Encrypt

### Frontend Deployment Options

#### Option 1: Vercel (Recommended)
1. Push code to GitHub
2. Create account on [Vercel](https://vercel.com)
3. Import project
4. Add environment variables
5. Deploy automatically

#### Option 2: Netlify
1. Push code to GitHub
2. Create account on [Netlify](https://netlify.com)
3. New site from Git
4. Add environment variables
5. Deploy

#### Option 3: Same VPS (with Backend)
1. Build frontend: `npm run build`
2. Serve with Nginx or PM2
3. Configure Nginx to serve static files

### MongoDB Atlas Setup
1. Create account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster (M0)
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for all)
5. Get connection string
6. Add to environment variables

### Razorpay Setup
1. Create account on [Razorpay](https://razorpay.com)
2. Go to Settings → API Keys
3. Generate Test Mode keys (for development)
4. Generate Production keys (for live)
5. Add to environment variables
6. Setup webhooks (optional)

### Domain Setup
1. Purchase domain from Hostinger, GoDaddy, or Namecheap
2. Point DNS to your hosting provider
3. Configure SSL certificate (Let's Encrypt free)
4. Update environment variables with domain URL

## User Roles & Permissions

### User
- View free exams
- Take free mock tests
- View results and analytics
- Manage profile
- Purchase subscriptions
- Apply coupon codes
- Access premium content based on subscription

### Admin
- All User permissions
- Create, edit, delete exams
- Manage exam questions
- View all users
- Manage pricing plans
- Create and manage coupons
- View analytics and reports
- Access admin dashboard

### Super Admin
- All Admin permissions
- Manage other admins
- System configuration
- Full system control

## Database Models

### User
- Personal information (name, email, phone)
- Authentication (password, JWT tokens)
- Subscription details
- Exam history
- Profile settings

### Exam
- Exam details (title, description, category)
- Pricing information
- Duration and questions count
- Syllabus and instructions
- Status (active/inactive)

### Question
- Question text and options
- Correct answer
- Explanation
- Difficulty level
- Associated exam

### Result
- User and exam reference
- Score and percentage
- Answers submitted
- Time taken
- Detailed analysis

### Payment
- User and plan details
- Amount and transaction ID
- Payment status
- Subscription details
- Coupon information

### Coupon
- Coupon code and description
- Discount type and value
- Applicability rules
- Usage limits
- Validity period

### Settings
- Site configuration
- Pricing plans
- Hero section content
- Contact information
- Social media links

## Troubleshooting

### Common Issues

**Backend not starting**
- Check MongoDB connection string
- Verify all environment variables are set
- Check if port 5000 is available
- Run `npm install` to ensure dependencies

**Frontend build errors**
- Clear cache: `rm -rf .next node_modules`
- Reinstall: `npm install`
- Check TypeScript errors
- Verify API URL in .env.local

**Payment not working**
- Verify Razorpay keys are correct
- Check API is accessible from frontend
- Ensure CORS is configured
- Test with Razorpay test mode first

**Database connection issues**
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions
- Check network connectivity

## Development Workflow

### Adding New Features
1. Create feature branch: `git checkout -b feature-name`
2. Make changes in respective files
3. Test locally
4. Commit changes: `git commit -m "description"`
5. Push to GitHub: `git push origin feature-name`
6. Create pull request
7. Review and merge

### Code Style
- Use TypeScript for frontend
- Follow ESLint rules
- Add comments for complex logic
- Use meaningful variable names
- Keep functions small and focused

### Testing
- Test all user flows
- Verify payment integration
- Check admin functionality
- Test on different browsers
- Verify mobile responsiveness

## Performance Optimization

### Backend
- Use database indexes
- Implement caching (Redis)
- Optimize database queries
- Use compression middleware
- Implement rate limiting

### Frontend
- Use Next.js Image optimization
- Implement lazy loading
- Use React Query for caching
- Optimize bundle size
- Use CDN for static assets

## Security Best Practices

- Never commit .env files
- Use strong JWT secrets
- Implement rate limiting
- Validate all inputs
- Use HTTPS in production
- Keep dependencies updated
- Implement CORS properly
- Sanitize user inputs
- Use helmet for security headers
- Implement proper error handling

## Support & Maintenance

### Regular Tasks
- Monitor server logs
- Check database performance
- Review analytics
- Update dependencies
- Backup database regularly
- Monitor payment transactions
- Handle user support requests

### Scaling
- Add Redis caching when traffic increases
- Implement load balancing
- Use CDN for static assets
- Optimize database queries
- Consider database sharding for large datasets

## License

MIT License - feel free to use for educational purposes.

## Credits

Built with ❤️ by the Sarkari Spark Team

### Technologies Used
- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Razorpay](https://razorpay.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

For support, email support@sarkarispark.com or join our community.
