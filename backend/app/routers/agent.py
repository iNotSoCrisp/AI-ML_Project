"""
Agent router — Milestone 2
Accepts a generic research topic, performs autonomous web search, extracts insights using an LLM,
and returns a structured Markdown report.
"""

from __future__ import annotations
from fastapi import APIRouter, Form
from app.services.agent_pipeline import run_agent

router = APIRouter()

@router.post("/agent/research")
async def agent_research(query: str = Form(...)):
    """
    Run an autonomous LangGraph agent to generate a comprehensive research report.
    This accepts an open-ended research query and uses web-search coupled with an LLM.
    """
    result = await run_agent(query=query)
    return result
