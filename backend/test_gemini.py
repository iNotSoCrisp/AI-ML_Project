import os
import requests
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

os.environ["GOOGLE_API_KEY"] = "AIzaSyAiCeDyt-3DgsFwUq6jfchic99hHFsVbTI"

models = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-pro-latest", "aqa"]
for m in models:
    try:
        print(f"Testing {m}...")
        llm = ChatGoogleGenerativeAI(model=m)
        resp = llm.invoke([HumanMessage(content="Hello")])
        print("SUCCESS:", m)
        break
    except Exception as e:
        print("ERROR", m, str(e).split('\n')[0])
