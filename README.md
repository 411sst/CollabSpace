# grouPES

```
                            ____  ___________
   ____ __________  __  __/ __ \/ ____/ ___/
  / __ `/ ___/ __ \/ / / / /_/ / __/  \__ \
 / /_/ / /  / /_/ / /_/ / ____/ /___ ___/ /
 \__, /_/   \____/\__,_/_/   /_____//____/
/____/
```

**A no-nonsense project group maker for educational institutions.**

## Project Status

🚧 **This project is being completely reworked from scratch.**

The original codebase has been cleared and archived in the `backup-original-code` branch. The new implementation will feature a modern, clean architecture designed for deployment on **Vercel** or **Streamlit**.

## What's Kept from Original

- `DB_template.sql` - Original database schema (reference)
- `.env.example` - Environment configuration template
- `assets/` - Project images and mockups

## Tech Stack (New Implementation)

### Frontend
- **React** 18.3.1 - UI framework
- **Vite** 5.4.0 - Build tool and dev server
- **TailwindCSS** 3.4.14 - Utility-first CSS framework
- Ready for **Vercel** deployment

### Backend
- To be determined (options: Vercel Serverless Functions, Supabase, Firebase, or traditional Node.js API)

### Database
- Original MySQL schema available in `DB_template.sql`
- Can be migrated to PostgreSQL, Supabase, or other cloud database

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect repository to Vercel
3. Vercel will auto-detect Vite configuration
4. Deploy!

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Streamlit

If using Streamlit for the frontend:

```bash
pip install streamlit
streamlit run app.py
```

## Project Structure (To Be Created)

```
group-pesu/
├── src/                  # Source code
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Root component
│   └── main.jsx         # Entry point
├── public/              # Static assets
├── .env.example         # Environment template
├── index.html           # HTML entry point
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── package.json         # Dependencies
```

## Original Project Reference

The original implementation is preserved in:
- **Branch:** `backup-original-code`
- **Features:** Multi-dashboard system with Admin, Teacher, and Student roles
- **Database:** Full MySQL schema with Assignment, Student, Teacher tables

View original code:
```bash
git checkout backup-original-code
```

## Development Roadmap

- [ ] Set up basic React + Vite structure
- [ ] Implement authentication system
- [ ] Create role-based dashboards (Admin, Teacher, Student)
- [ ] Build group/team formation features
- [ ] Implement assignment management
- [ ] Set up backend API (Vercel serverless or separate service)
- [ ] Configure database (Supabase, PostgreSQL, or MySQL)
- [ ] Deploy to Vercel
- [ ] Add real-time features (WebSockets/Pusher)

## Contributing

This is a fresh start! Feel free to contribute with modern best practices:
- Clean, maintainable code
- Component-based architecture
- Proper state management
- TypeScript (optional)
- Testing (Jest, Vitest)

## License

[Add your license information here]

---

**Previous version archived. New implementation in progress.** 🚀
