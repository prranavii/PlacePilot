import uuid
from datetime import datetime, timedelta, date, timezone
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings

from app.database.session import SessionLocal, engine
from app.core.security import get_password_hash
from app.models import Base
from app.models.user import User
from app.models.application import Application
from app.models.application_event import ApplicationEvent
from app.models.interview import Interview
from app.models.assessment import Assessment
from app.models.question import Question
from app.models.topic_performance import TopicPerformance
from app.models.study_task import StudyTask
from app.models.placement_memory import PlacementMemory
from app.models.weekly_report import WeeklyReport

def seed_db():
    db: Session = SessionLocal()
    try:
        # Create extension and tables
        print("Ensuring pgvector is enabled and creating tables...")
        if not settings.DATABASE_URL.startswith("sqlite"):
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                conn.commit()
        Base.metadata.create_all(bind=engine)


        # Clear existing data
        print("Cleaning existing database...")
        db.query(WeeklyReport).delete()
        db.query(PlacementMemory).delete()
        db.query(StudyTask).delete()
        db.query(TopicPerformance).delete()
        db.query(Question).delete()
        db.query(Assessment).delete()
        db.query(Interview).delete()
        db.query(ApplicationEvent).delete()
        db.query(Application).delete()
        db.query(User).delete()
        db.commit()

        print("Seeding new data...")

        # 1. Create Student User
        student = User(
            email="student@placepilot.ai",
            hashed_password=get_password_hash("password123"),
            full_name="Pranav Kumar"
        )
        db.add(student)
        db.commit()
        db.refresh(student)
        print(f"Created student user: {student.email}")

        # 2. Add Topic Performance
        print("Seeding topic performance...")
        topics_to_seed = [
            ("DSA", "Graphs", 12, 0.58, 2, 60.0, 55.0, 4, 58.0),
            ("DSA", "Dynamic Programming", 15, 0.80, 4, 85.0, 80.0, 1, 81.0),
            ("DSA", "Arrays", 25, 0.92, 5, 95.0, 90.0, 0, 93.0),
            ("DSA", "Trees", 18, 0.72, 3, 75.0, 70.0, 2, 72.0),
            ("DSA", "LinkedLists", 14, 0.85, 4, 88.0, 85.0, 0, 86.0),
            ("Java", "OOP", 10, 0.90, 5, 90.0, 92.0, 0, 91.0),
            ("Java", "HashMap", 8, 0.75, 3, 80.0, 78.0, 1, 78.0),
            ("Java", "Multithreading", 9, 0.55, 2, 65.0, 60.0, 3, 61.0),
            ("CS Fundamentals", "DBMS Indexing", 11, 0.64, 3, 70.0, 65.0, 2, 67.0),
            ("CS Fundamentals", "DBMS Transactions", 7, 0.85, 4, 85.0, 82.0, 0, 84.0),
            ("CS Fundamentals", "OS Deadlocks", 8, 0.75, 3, 78.0, 75.0, 1, 76.0),
            ("CS Fundamentals", "Computer Networks TCP/UDP", 10, 0.70, 3, 72.0, 70.0, 2, 71.0)
        ]
        for cat, name, att, succ, conf, m_score, i_score, weak_f, read_s in topics_to_seed:
            tp = TopicPerformance(
                user_id=student.id,
                category=cat,
                topic_name=name,
                attempts=att,
                success_rate=succ,
                confidence_level=conf,
                mock_performance_score=m_score,
                interview_performance_score=i_score,
                last_revised=datetime.now(timezone.utc).date() - timedelta(days=2),
                weakness_frequency=weak_f,
                readiness_score=read_s
            )
            db.add(tp)
        db.commit()

        # 3. Add Applications
        print("Seeding job applications...")
        
        # Meta - Technical Interview stage
        meta = Application(
            user_id=student.id,
            company_name="Meta",
            role="Software Engineer (Backend)",
            job_description="Looking for high-caliber backend engineers. Core skills: Systems design, C++, Java or Python, Algorithms, OS, DBMS.",
            package_ctc="$180,000",
            location="Menlo Park, CA (Hybrid)",
            job_type="Full-time",
            application_source="Referral",
            application_url="https://meta.com/careers",
            date_applied=datetime.now(timezone.utc).date() - timedelta(days=20),
            deadline=datetime.now(timezone.utc).date() + timedelta(days=10),
            current_stage="Technical Interview",
            notes="Referred by senior software engineer. Need to focus heavily on System Design and Graph algorithms.",
            priority="High",
            resume_version="v2_backend",
            skills_required=["Python", "C++", "Graphs", "DBMS", "System Design"],
            personal_readiness=70
        )
        db.add(meta)
        
        # Stripe - Offer stage
        stripe = Application(
            user_id=student.id,
            company_name="Stripe",
            role="Software Engineer Intern",
            job_description="Join our core API platform team. Requirements: robust programming, concurrency, systems understanding, APIs design.",
            package_ctc="$45 / hr",
            location="Seattle, WA",
            job_type="Internship",
            application_source="LinkedIn",
            application_url="https://stripe.com/jobs",
            date_applied=datetime.now(timezone.utc).date() - timedelta(days=35),
            deadline=datetime.now(timezone.utc).date() - timedelta(days=5),
            current_stage="Offer",
            notes="Received verbal offer! Written letter pending.",
            priority="High",
            resume_version="v2_backend",
            skills_required=["APIs", "Python", "Concurrency", "DBMS Transactions"],
            personal_readiness=90
        )
        db.add(stripe)

        # Google - Online Assessment stage
        google = Application(
            user_id=student.id,
            company_name="Google",
            role="Associate Software Engineer",
            job_description="Seeking graduates with strong foundation in DSA, Trees, Graphs, Complexity Analysis, OS, Networking concepts.",
            package_ctc="$140,000",
            location="New York, NY",
            job_type="Full-time",
            application_source="On-campus",
            date_applied=datetime.now(timezone.utc).date() - timedelta(days=10),
            deadline=datetime.now(timezone.utc).date() + timedelta(days=15),
            current_stage="Online Assessment",
            notes="Google Online Challenge (OA) coming up next week. 2 DSA questions in 90 mins.",
            priority="High",
            resume_version="v1_general",
            skills_required=["Dynamic Programming", "Graphs", "Trees", "Complexity Analysis"],
            personal_readiness=60
        )
        db.add(google)

        # Amazon - Wishlist
        amazon = Application(
            user_id=student.id,
            company_name="Amazon",
            role="Software Development Engineer (SDE-1)",
            job_description="Build distributed storage systems. Java, OOP, Multithreading, SQL, Linux administration details.",
            package_ctc="$130,000",
            location="Austin, TX",
            job_type="Full-time",
            application_source="Direct Portal",
            current_stage="Wishlist",
            notes="Preparing resume to apply by next week.",
            priority="Medium",
            skills_required=["Java", "Multithreading", "OOP", "SQL"],
            personal_readiness=75
        )
        db.add(amazon)
        db.commit()

        # 4. Add events, assessments, and interviews
        print("Seeding events & performance logs...")
        
        # Meta Events & Interviews
        meta_event1 = ApplicationEvent(
            application_id=meta.id,
            event_type="Application Created",
            event_date=datetime.now(timezone.utc) - timedelta(days=20),
            status="Completed",
            details="Applied through referral."
        )
        meta_event2 = ApplicationEvent(
            application_id=meta.id,
            event_type="OA Scheduled",
            event_date=datetime.now(timezone.utc) - timedelta(days=15),
            status="Completed",
            details="Invited to Meta OA."
        )
        meta_oa = Assessment(
            application_id=meta.id,
            test_date=datetime.now(timezone.utc) - timedelta(days=12),
            platform="Codesignal",
            duration_mins=70,
            topic="DSA (Graphs & HashMaps)",
            score=85.0,
            status="Passed",
            questions_encountered=[
                {"question": "Reconstruct itinerary (Graph flight traversal)", "solved": True, "topic": "Graphs"},
                {"question": "Subarray sum equals K (HashMap optimization)", "solved": True, "topic": "HashMap"},
                {"question": "Evaluate expression string", "solved": False, "topic": "Strings"}
            ],
            weaknesses_identified=["String parsing under pressure", "BFS/DFS reconstruction"],
            notes="Passed with decent score. Got interview call."
        )
        meta_event3 = ApplicationEvent(
            application_id=meta.id,
            event_type="Technical Interview Scheduled",
            event_date=datetime.now(timezone.utc) + timedelta(days=5),
            status="Scheduled",
            details="First round backend interview with engineering team."
        )
        db.add_all([meta_event1, meta_event2, meta_oa, meta_event3])

        # Stripe Events & Completed Interviews (Seed history)
        stripe_event1 = ApplicationEvent(
            application_id=stripe.id,
            event_type="Application Created",
            event_date=datetime.now(timezone.utc) - timedelta(days=35),
            status="Completed"
        )
        stripe_oa = Assessment(
            application_id=stripe.id,
            test_date=datetime.now(timezone.utc) - timedelta(days=25),
            platform="Stripe Custom",
            duration_mins=90,
            topic="APIs & Rate Limiting",
            score=95.0,
            status="Passed",
            questions_encountered=[
                {"question": "Build HTTP rate limiter middleware", "solved": True, "topic": "APIs"}
            ],
            notes="Highly practical API design question. Solved completely."
        )
        stripe_interview1 = Interview(
            application_id=stripe.id,
            user_id=student.id,
            round_number=1,
            round_type="Technical",
            date=datetime.now(timezone.utc) - timedelta(days=15),
            status="Completed",
            notes="API Design & concurrency interview.",
            feedback="Candidate showed excellent depth in concurrent programming, resolved deadlocks correctly, and designed clean REST API structures.",
            technical_score=9.0,
            communication_score=8.5,
            conceptual_depth=9.0,
            problem_solving_score=9.5,
            strengths=["Concurrency", "REST design", "Code organization"],
            weaknesses=["Explain indexing details deeply (stumbled briefly on DB index page layout)"],
            recommendations="Move to final round.",
            is_mock=False
        )
        stripe_interview2 = Interview(
            application_id=stripe.id,
            user_id=student.id,
            round_number=2,
            round_type="HR",
            date=datetime.now(timezone.utc) - timedelta(days=8),
            status="Completed",
            notes="Value alignment, past projects discussion.",
            feedback="Clear communicator, fits stripe values. High curiosity and ownership.",
            technical_score=8.0,
            communication_score=9.5,
            conceptual_depth=8.0,
            problem_solving_score=8.0,
            strengths=["Leadership principles", "Curiosity", "Communication"],
            recommendations="Offer job.",
            is_mock=False
        )
        stripe_event2 = ApplicationEvent(
            application_id=stripe.id,
            event_type="Offer Received",
            event_date=datetime.now(timezone.utc) - timedelta(days=3),
            status="Completed",
            details="Received written offer for Seattle office!"
        )
        db.add_all([stripe_event1, stripe_oa, stripe_interview1, stripe_interview2, stripe_event2])

        # Google Events & OA
        google_event1 = ApplicationEvent(
            application_id=google.id,
            event_type="Application Created",
            event_date=datetime.now(timezone.utc) - timedelta(days=10),
            status="Completed"
        )
        google_event2 = ApplicationEvent(
            application_id=google.id,
            event_type="Online Assessment Scheduled",
            event_date=datetime.now(timezone.utc) + timedelta(days=3),
            status="Scheduled",
            details="Google Online Challenge. 2 DSA questions."
        )
        db.add_all([google_event1, google_event2])
        db.commit()

        # 5. Seed Mock Interview History
        print("Seeding AI Mock Interviews...")
        mock_int1 = Interview(
            application_id=meta.id,
            user_id=student.id,
            round_number=1,
            round_type="DSA",
            date=datetime.now(timezone.utc) - timedelta(days=2),
            status="Completed",
            notes="AI-guided practice session on graphs.",
            feedback="Student solved topological sort conceptual details, but struggled to implement graph DFS quickly under 20-min pressure. Missed cycle checking logic initially.",
            technical_score=6.5,
            communication_score=7.0,
            conceptual_depth=7.5,
            problem_solving_score=6.0,
            strengths=["Graph conceptual knowledge", "Complexity estimation"],
            weaknesses=["Dijkstra implementation", "Cycle detection in directed graph under time constraints"],
            missed_concepts=["Topological sort cycle validation"],
            recommendations="Focus on timed Graph coding practices. Solve at least 3 cycle detection problems.",
            is_mock=True
        )
        db.add(mock_int1)
        db.commit()

        # 6. Seed Personal Question Bank
        print("Seeding personal question bank...")
        q1 = Question(
            user_id=student.id,
            company_name="Meta",
            role="Backend Engineer",
            round_type="OA",
            topic="Graphs",
            subtopic="Traversal",
            difficulty="Medium",
            question_text="Reconstruct itinerary (Dijkstra/Eulerian path variation). Given flight tickets, reconstruct itinerary in order.",
            source="real_interview",
            date_encountered=datetime.now(timezone.utc).date() - timedelta(days=12),
            solved=True,
            confidence_level=4,
            user_notes="Solved using DFS backtracking and sorting destinations alphabetically.",
            ai_explanation="Eulerian path algorithm (Hierholzer's algorithm) resolves this in O(E log(E/V)) where E is the number of tickets."
        )
        q2 = Question(
            user_id=student.id,
            company_name="Stripe",
            role="Intern",
            round_type="Technical",
            topic="APIs",
            subtopic="Rate Limiting",
            difficulty="Hard",
            question_text="Build token bucket rate limiter middleware in Python with thread-safety.",
            source="real_interview",
            date_encountered=datetime.now(timezone.utc).date() - timedelta(days=15),
            solved=True,
            confidence_level=5,
            user_notes="Used Python threading.Lock and calculated token replenishment based on elapsed time.",
            ai_explanation="Token bucket algorithm calculates replenishment rate: current_tokens = min(max_capacity, current_tokens + rate * elapsed_time)."
        )
        db.add_all([q1, q2])
        db.commit()

        # 7. Seed Placement Memories
        print("Seeding memories for RAG...")
        mem1 = PlacementMemory(
            user_id=student.id,
            application_id=meta.id,
            content_type="interview_feedback",
            content="Failed to explain Dijkstra complexity during graph mock. Need to revise Dijkstra heap-based time complexity derivation: O((V + E) log V).",
            embedding=[0.0] * 384, # Seeding dummy embedding
            metadata_info={"company": "Meta", "topic": "Graphs"}
        )
        mem2 = PlacementMemory(
            user_id=student.id,
            application_id=stripe.id,
            content_type="interview_feedback",
            content="Interviewer praised the concurrent rate limiter design. Concurrency locking using mutex/lock was robust.",
            embedding=[0.0] * 384,
            metadata_info={"company": "Stripe", "topic": "Concurrency"}
        )
        db.add_all([mem1, mem2])
        db.commit()

        # 8. Seed Study Tasks
        print("Seeding study tasks...")
        task1 = StudyTask(
            user_id=student.id,
            application_id=meta.id,
            title="Implement Dijkstra's Algorithm under time pressure",
            topic="Graphs",
            company_name="Meta",
            priority="High",
            estimated_duration_mins=45,
            deadline=datetime.now(timezone.utc).date() + timedelta(days=2),
            status="Todo",
            source_reason="Based on Meta mock interview failure in graph cycle detection.",
            ai_generated=True
        )
        task2 = StudyTask(
            user_id=student.id,
            application_id=meta.id,
            title="Revise DBMS Indexing (B+ Trees internals)",
            topic="DBMS Indexing",
            company_name="Meta",
            priority="Medium",
            estimated_duration_mins=30,
            deadline=datetime.now(timezone.utc).date() + timedelta(days=4),
            status="Todo",
            source_reason="Stumbled on DB index question during Stripe final rounds.",
            ai_generated=True
        )
        db.add_all([task1, task2])
        db.commit()

        # 9. Seed Weekly Reports
        print("Seeding weekly reports...")
        rep = WeeklyReport(
            user_id=student.id,
            start_date=datetime.now(timezone.utc).date() - timedelta(days=7),
            end_date=datetime.now(timezone.utc).date(),
            applications_count=4,
            oa_success_rate=85.0,
            readiness_score=72.0,
            biggest_improvement="Dynamic Programming (attempts success rate rose to 80%)",
            needs_attention="Graphs (attempts success rate at 58% is a major bottleneck)",
            recurring_issues=["Graph cycle detection implementation under time pressure", "Stumbling on B+ Tree page layouts"],
            recommended_focus=["Graph cycle detection (DFS/BFS)", "DBMS B+ Tree indexing layout details", "Timed coding practice"],
            report_text="Overall readiness rose to 72% this week thanks to Stripe offer and high DP scores. However, Meta interview in 5 days is bottlenecked by Graph algorithms and DBMS Indexing knowledge."
        )
        db.add(rep)
        db.commit()

        print("Database seeded successfully with premium demo data!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
