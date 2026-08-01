import json
import logging
from typing import Type, TypeVar, Optional, List
from pydantic import BaseModel
from groq import Groq

from app.core.config import settings

logger = logging.getLogger(__name__)
T = TypeVar('T', bound=BaseModel)

class GroqService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.enabled = bool(self.api_key and not self.api_key.startswith("your_") and not self.api_key.startswith("mock_"))
        
        if self.enabled:
            try:
                self.client = Groq(api_key=self.api_key)
                logger.info("Groq API client initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {e}")
                self.enabled = False
        else:
            logger.warning("Groq API key is mock or missing. Dynamic AI fallback mode active.")

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        if not self.enabled:
            logger.warning("Groq API disabled. Returning fallback textual generation.")
            return "Groq AI generation fallback: Please configure a valid GROQ_API_KEY."

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        try:
            response = self.client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=messages,
                temperature=settings.GROQ_TEMPERATURE,
                max_tokens=2048
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq generation failed: {e}. Falling back to default warning.")
            return f"Error executing Groq inference: {e}"

    def structured_generate(
        self, 
        prompt: str, 
        response_model: Type[T], 
        system_prompt: Optional[str] = None,
        max_retries: int = 2
    ) -> T:
        """
        Executes a completion query in JSON mode and validates the output against a Pydantic schema model.
        Falls back to a default instance of the model if the API call fails or fails to validate.
        """
        # Inject JSON schema instructions into the prompt
        schema_json = json.dumps(response_model.model_json_schema(), indent=2)
        full_system_prompt = (
            f"You are a helpful AI assistant. You must respond ONLY with a JSON object. "
            f"Your output JSON must strictly comply with this JSON Schema:\n{schema_json}"
        )
        if system_prompt:
            full_system_prompt = f"{system_prompt}\n\n{full_system_prompt}"

        if not self.enabled:
            logger.warning(f"Groq API disabled. Generating mock fallback for {response_model.__name__}.")
            return self._generate_fallback(response_model)

        for attempt in range(max_retries):
            try:
                response = self.client.chat.completions.create(
                    model=settings.GROQ_MODEL,
                    messages=[
                        {"role": "system", "content": full_system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=settings.GROQ_TEMPERATURE,
                    max_tokens=2048,
                    timeout=15.0
                )
                
                content = response.choices[0].message.content
                logger.debug(f"Received JSON response on attempt {attempt + 1}: {content}")
                
                parsed_json = json.loads(content)
                return response_model.model_validate(parsed_json)
                
            except json.JSONDecodeError as jde:
                logger.error(f"JSON decode failed on attempt {attempt + 1}: {jde}")
            except Exception as e:
                logger.error(f"Groq API structured call failed on attempt {attempt + 1}: {e}")

        logger.error(f"Failed to retrieve valid structured response after {max_retries} attempts. Returning fallback.")
        return self._generate_fallback(response_model)

    def _generate_fallback(self, model: Type[T]) -> T:
        """
        Generates sensible mock/default instances of validation models.
        """
        model_name = model.__name__
        
        # 1. Fallback for Journal Scorecard Parser
        if "ParsedFeedbackOut" in model_name:
            return model(
                round_type="Technical",
                technical_score=7.0,
                communication_score=7.5,
                strengths=["Core Syntax Proficiency", "Analytical Thinker"],
                weaknesses=["Timed Implementation speed", "Optimal complexity derivation"],
                recommendations="Focus on mock interview time constraints and optimize space complexity."
            )

        # 1.5 Fallback for Mock Interview Evaluation
        if "MockEvaluationOut" in model_name:
            return model(
                technical_score=8.0,
                communication_score=8.5,
                strengths=["Structured problem decomposition", "Good usage of technical terms"],
                weaknesses=["Did not mention edge case scenarios in LRU cache size limits"],
                recommendations="Practice scaling concurrency design locks and review cache invalidation details."
            )

        # 1.6 Fallback for Weekly Report Payload
        if "AIWeeklyReportPayload" in model_name:
            return model(
                biggest_improvement="Graph cycle traversal coding speed",
                needs_attention="B+ Tree index file page layouts",
                recurring_issues=["Forgetting DFS cycle checks", "Stumbling on database page formats"],
                recommended_focus=["Implement BFS cycle detection under time limits", "Revise B+ Tree disk page structures"],
                report_text="# Recruiter Progress Review Summary\n\nCandidate has shown significant improvement in **Graph cycle traversal** during mock interviews. However, they need to pay attention to **B+ Tree Indexing disk layouts**."
            )
            
        # 2. Fallback for Resume JD match


        if "ResumeJDMatchOut" in model_name:
            return model(
                match_percentage=75.0,
                matched_skills=["Python", "SQL", "Git", "REST APIs"],
                missing_skills=["Kubernetes", "System Design", "NoSQL"],
                keyword_gaps=["Docker", "Microservices"],
                likely_interview_areas=["Database query optimization", "Concurrent request structures"],
                explanation="Your resume demonstrates strong backend foundations with Python and APIs, but lacks containerization and cloud experience required for the role."
            )

        # 3. Fallback for Prepare Me Study Plan
        if "PrepareMeStrategyOut" in model_name or "FinalStrategyPlanOut" in model_name:
            from app.rag.agent_graph import StudyPhase
            return model(
                estimated_days_remaining=5,
                overall_readiness=72.0,
                topic_readiness={
                    "Graphs": 58.0,
                    "DBMS": 67.0,
                    "Java": 82.0,
                    "Computer Networks": 70.0
                },
                high_priority_topics=["Graph Cycle Detection", "B+ Tree Indexing", "TCP vs UDP"],
                study_plan=[
                    StudyPhase(
                        phase_name="Phase 1: Foundation & Conceptual Core",
                        duration_days=2,
                        focus_areas=["Graph Algorithms", "DBMS Storage Engine Design"],
                        concrete_tasks=[
                            "Implement BFS/DFS cycle detection algorithms under 30 minutes",
                            "Review B+ Tree disk indexing structure and node page layout details",
                            "Review TCP 3-way handshake and UDP differences"
                        ]
                    ),
                    StudyPhase(
                        phase_name="Phase 2: Mock Scenarios & Time Boxing",
                        duration_days=2,
                        focus_areas=["Networking Protocols", "Graph Path Finding"],
                        concrete_tasks=[
                            "Conduct a 20-minute simulated networking mock interview",
                            "Solve 3 Dijkstra's algorithm traversal optimization tasks"
                        ]
                    ),
                    StudyPhase(
                        phase_name="Phase 3: Final Checks & Verification",
                        duration_days=1,
                        focus_areas=["System Design", "Behavioral Alignment"],
                        concrete_tasks=[
                            "Design a high-volume chat server RAG index strategy",
                            "Run a mock behavioral simulation for the target role"
                        ]
                    )
                ],
                ai_insight="Your past mock interviews show a strong understanding of database indexing concepts, but you struggle to implement graphs under time constraints. Prioritize graphs."
            )

        # 4. Fallback for Node 1: Weakness Analyzer
        if "WeaknessAnalysisOut" in model_name:
            return model(
                weaknesses=["Graph Cycle Detection DFS", "B+ Tree Disk Indexing Internals", "Dijkstra Traversal Optimization"],
                reasoning="Extrapolated from topic histories indicating graph traversal speed issues and B+ Tree indexing conceptual gaps."
            )

        # 5. Fallback for Node 2: Strategy Planner
        if "DraftStrategyOut" in model_name:
            from app.rag.agent_graph import StudyPhase
            return model(
                estimated_days_remaining=5,
                study_plan=[
                    StudyPhase(
                        phase_name="Phase 1: Foundation & Conceptual Core",
                        duration_days=2,
                        focus_areas=["Graph Algorithms", "DBMS Storage Engine Design"],
                        concrete_tasks=[
                            "Implement BFS/DFS cycle detection algorithms under 30 minutes",
                            "Review B+ Tree disk indexing structure and node page layout details",
                            "Review TCP 3-way handshake and UDP differences"
                        ]
                    ),
                    StudyPhase(
                        phase_name="Phase 2: Mock Scenarios & Time Boxing",
                        duration_days=2,
                        focus_areas=["Networking Protocols", "Graph Path Finding"],
                        concrete_tasks=[
                            "Conduct a 20-minute simulated networking mock interview",
                            "Solve 3 Dijkstra's algorithm traversal optimization tasks"
                        ]
                    ),
                    StudyPhase(
                        phase_name="Phase 3: Final Checks & Verification",
                        duration_days=1,
                        focus_areas=["System Design", "Behavioral Alignment"],
                        concrete_tasks=[
                            "Design a high-volume chat server RAG index strategy",
                            "Run a mock behavioral simulation for the target role"
                        ]
                    )
                ],
                readiness_estimation=68.0
            )

        # Catch-all empty validation fallback
        try:
            return model()
        except Exception:
            # If model requires arguments, we instantiate it via empty dict or return None (handled by caller)
            return None

groq_service = GroqService()
