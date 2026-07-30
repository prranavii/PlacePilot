from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.application import Application
from app.models.application_event import ApplicationEvent
from app.models.topic_performance import TopicPerformance
from app.models.study_task import StudyTask
from app.models.weekly_report import WeeklyReport
from app.models.user import User

def seed_new_user(db: Session, user: User):
    # 1. Seed Topic Performance metrics
    topics = [
        TopicPerformance(
            user_id=user.id,
            category="DSA",
            topic_name="Graphs",
            attempts=12,
            success_rate=0.58,
            confidence_level=2,
            mock_performance_score=60.0,
            interview_performance_score=55.0,
            last_revised=datetime.now(timezone.utc).date() - timedelta(days=2),
            weakness_frequency=4,
            readiness_score=58.0
        ),
        TopicPerformance(
            user_id=user.id,
            category="DSA",
            topic_name="Dynamic Programming",
            attempts=15,
            success_rate=0.80,
            confidence_level=4,
            mock_performance_score=85.0,
            interview_performance_score=80.0,
            last_revised=datetime.now(timezone.utc).date() - timedelta(days=1),
            weakness_frequency=1,
            readiness_score=81.0
        ),
        TopicPerformance(
            user_id=user.id,
            category="DSA",
            topic_name="Trees",
            attempts=18,
            success_rate=0.72,
            confidence_level=3,
            mock_performance_score=75.0,
            interview_performance_score=70.0,
            last_revised=datetime.now(timezone.utc).date() - timedelta(days=3),
            weakness_frequency=2,
            readiness_score=72.0
        )
    ]
    db.add_all(topics)
    db.commit()

    # 2. Seed Job Applications
    meta = Application(
        user_id=user.id,
        company_name="Meta",
        role="Software Engineer (Backend)",
        job_description="Looking for high-caliber backend engineers. Core skills: Systems design, C++, Java or Python, Algorithms, OS, DBMS.",
        package_ctc="₹24,00,000",
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
    db.commit()
    db.refresh(meta)

    # Add Application Event for Meta
    meta_event = ApplicationEvent(
        application_id=meta.id,
        event_type="Technical Interview",
        status="Scheduled",
        event_date=datetime.now(timezone.utc) + timedelta(days=5),
        details="Upcoming technical loop grilling session."
    )
    db.add(meta_event)

    stripe = Application(
        user_id=user.id,
        company_name="Stripe",
        role="Software Engineer Intern",
        job_description="Join our core API platform team. Requirements: robust programming, concurrency, systems understanding, APIs design.",
        package_ctc="₹1,200 / hr",
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
    db.commit()

    # 3. Seed Study Tasks
    tasks = [
        StudyTask(
            user_id=user.id,
            title="Solve 2 Graph traversal cycle detection questions",
            duration="45m",
            priority="High",
            completed=False,
            created_at=datetime.now(timezone.utc)
        ),
        StudyTask(
            user_id=user.id,
            title="Revise B+ Tree index layouts",
            duration="30m",
            priority="Medium",
            completed=False,
            created_at=datetime.now(timezone.utc)
        ),
        StudyTask(
            user_id=user.id,
            title="Mock Interview practice (Meta backend focus)",
            duration="20m",
            priority="High",
            completed=False,
            created_at=datetime.now(timezone.utc)
        )
    ]
    db.add_all(tasks)
    db.commit()

    # 4. Seed Weekly Report
    rep = WeeklyReport(
        user_id=user.id,
        start_date=datetime.now(timezone.utc).date() - timedelta(days=7),
        end_date=datetime.now(timezone.utc).date(),
        applications_count=2,
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
