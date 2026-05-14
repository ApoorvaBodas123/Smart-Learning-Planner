# Roadmint Zenith - AI Mastery Planner 🛡️🚀

**Roadmint Zenith** is a high-performance, distraction-free SaaS platform designed for intensive skill mastery. It transforms broad learning goals into granular, actionable daily milestones using an intelligent scheduling algorithm and a premium, high-contrast design system.

## 🚀 Technical Highlights (Resume-Ready)
- **Granular Scheduling Algorithm**: Developed a custom logic to distribute AI-generated topics into daily tasks with a 4-hour cap, preventing task clumping and ensuring a sustainable learning pace.
- **Zenith Design System**: Built a theme-aware design system from scratch using CSS variables, ensuring perfect accessibility and visual consistency across Light and Dark modes.
- **Optimized Data Pipeline**: Implemented parallel API fetching (`Promise.all`) and optimized database queries to achieve sub-second dashboard initialization.
- **AI-Driven Personalization**: Integrated Groq (Llama-3.3) to generate hyper-personalized roadmaps based on user-defined goals, durations, and skill levels.

## 🛠️ Tech Stack
- **Backend**: FastAPI (Python), PostgreSQL (SQLAlchemy), Groq LLM.
- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion (Animations).
- **Architecture**: RESTful API, JWT-based Authentication, Chronological Task Distribution.

## 🌟 Core Features
- **AI Roadmap Generator**: Instantly convert complex goals (e.g., "Become a Full-Stack Developer") into structured learning paths.
- **Mastery Schedule**: A distraction-free daily view that prioritizes immediate, actionable tasks.
- **Visual Analytics**: Interactive insights into learning consistency, streaks, and progress tracking.
- **Unified Calendar**: A sleek monthly overview to visualize the entire mastery journey.

## 🔧 Installation & Setup

### Backend
1. `cd backend`
2. `python -m venv venv` && `source venv/bin/activate`
3. `pip install -r requirements.txt`
4. Create `.env` with `DATABASE_URL` and `GROQ_API_KEY`.
5. `uvicorn app.main:app --reload`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

---
*Built with focus on performance, accessibility, and high-contrast design.*
