from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json
from .chatgpt_helpers import prompt_chatgpt

json_terms = {
    "terms": [
                {"term": "", "definition": ""}, 
                {"term": "RNA", "definition": ""}
            ],
    "mode": "one"
}

json_methodologies = {
    "methodologies": [
                { "methodology": "surveys and questionnaires", 
                "definition" : "This study used quantitative PCR to amplify mRNA sequences."},
                { "methodology": "double bline placebo", 
                "definition" : "This study method is the golden standard used to test drugs. It takes two control groups of people and gives one group the drug and the other a sugar pill of some sort to see if the effects of the drug are truly due to the drug or due to our own mind playing tricks over us."},
            ],
    "mode": "one"
}

# normalized json structure 
json_combined_questions = {
            "terms": [
                {"term": "", 
                "definition": "",},
                {"term": "",
                "definition": "",}
                ],
            "methodologies": [
                {
                    "methodology": "", 
                    "definition" : "",
                },
                {"methodology": "", 
                "definition" : ""}
                ],
            "questions": [ {"placeholder": "", 
                            "question": "", 
                            "answer": ""}, 
                            {"placeholder": "", 
                             "question": "",
                             "answer": ""}
                ],
            "mode": "all"
        }

json_questions = {
            "questions": [
                {"placeholder": "MRNA", 
                 "question":["What is the purpose of MRNA in the process?", "How will mRNA affect this process?"], 
                 "answers": ["Carries genetic info from DNA.", "mRNA will affect this process by creating"]
                 },
                {"placeholder": "DNA", 
                 "question": ["What is the purpose of DNA in the process?", "If DNA wasnt part of this process what would happen?"], 
                 "answers": ["Gives the instructions to the body.", "The process would break down during stage two."]}
            ],
            "mode": "one"
        }


# Create your views here.
# Request All Button
class AnalyzeWithQuestions(APIView):
    def post(self, requet):
        abstract_text = requet.data.get("section", "")

        if not abstract_text:
            return Response({ "Error in AnalyzeLanguage View": "No text present"}, status=status.HTTP_400_BAD_REQUEST)

        prompt = f"Define all specialized language and methodology found in the text below. Create 2-4 active reading questions with respective answers based on the text below to promote reading comprehension. Return data in the canonical structure provided here, do not include markdown, extra white space, or new line syntax. data structure: {json_combined_questions} text: {abstract_text}"

        try:
            print("Calling prompt_chatgpt...")
            output = prompt_chatgpt(prompt)
            print("RAW MODEL OUTPUT: ")
            print(output)

            parsed_output = json.loads(output)
            return Response(parsed_output)
        except Exception as error:
            return Response({ "Error in AnalyzeWithQuestions": str(error) }, status=status.HTTP_400_BAD_REQUEST)

# Speacilized Language Button
class AnalyzeLanguage(APIView):
    def post(self, requet):
        abstract_text = requet.data.get("section", "")

        if not abstract_text:
            return Response({ "Error in AnalyzeLanguage View": "No abstract text found"}, status=status.HTTP_400_BAD_REQUEST)
        
        prompt = f"Define all specialized language found in the text below. Return data in the canonical structure provided here, do not include markdown, extra white space, or new line syntax. data structure: {json_terms} text: {abstract_text}"

        try:
            output = prompt_chatgpt(prompt)
            parsed_output = json.loads(output)
            return Response(parsed_output)
        except Exception as error:
            return Response({ "Error in AnalyzeLanguage": str(error) }, status=status.HTTP_400_BAD_REQUEST)

# Methodology Button
class AnalyzeMethodology(APIView):
    def post(self, requet):
        abstract_text = requet.data.get("section", "")

        if not abstract_text:
            return Response({ "Error in AnalyzeMethodology View": "No text present"}, status=status.HTTP_400_BAD_REQUEST)
        
        prompt = f"Define all methodologies found in the text below. Return data in the canonical structure provided here, do not include markdown, extra white space, or new line syntax. data structure: {json_methodologies} text: {abstract_text}"

        try:
            output = prompt_chatgpt(prompt)
            parsed_output = json.loads(output)
            return Response(parsed_output)
        except Exception as error:
            return Response({ "Error in AnalyzeMethodology": str(error) }, status=status.HTTP_400_BAD_REQUEST)

# Active Reading Questions
class ActiveReadingQuestions(APIView):
    def post(self, request):
        abstract_text = request.data.get("section", "")

        if not abstract_text:
            return Response({ "Error in ActiveReadingQuestions View": "No text present" }, status=status.HTTP_400_BAD_REQUEST)
        
        prompt = f"Conceptualize the text below and create active reading questions that will test my knowledge. Use a word from the text as a way to placehold where the question should be asked. Return data in the canonical structure provided here, do not include markdown, extra white space, or new line syntax. data structure: {json_questions} text: {abstract_text}"
        try:
            output = prompt_chatgpt(prompt)
            parsed_output = json.loads(output)
            return Response(parsed_output)
        except Exception as error:
            return Response({ "Error in ActiveReadingQuestion": str(error) }, status=status.HTTP_400_BAD_REQUEST)