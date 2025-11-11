from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json
from .chatgpt_helpers import prompt_chatgpt

json_combined = {
            "terms": [
                {"term": "mRNA", "definition": "Messenger RNA, carries genetic info from DNA."},
            ],
            "methodologies": [
                { "methodology": "surveys and questionnaires", 
                "definition" : "This study used quantitative PCR to amplify mRNA sequences."},
            ]
        }

json_combined_questions = {
            "terms": [
                {"term": "mRNA", 
                "definition": "Messenger RNA, carries genetic info from DNA.",
                "questions": [
                    "What is the role of mRNA in protein synthesis?",
                    "How does mRNA differ from tRNA?"]
                },
                {"term": "ELISA",
                "definition": "Stands for Enzyme-Linked Immunosorbent Assay. A lab technique to detect antigens or antibodies.",
                "questions": [
                    "What does this technique used for?",
                    "What does ELISA stand for?"]
                }
            ],
            "methodologies": [
                {
                    "methodology": "cohort study", 
                    "definition" : "An observational study that follows a group (cohort) of individuals over time to assess outcomes based on exposures or characteristics.",
                    "questions": ["What criteria were used to define the cohort in this study?", "What confounding variables might affect the outcome?"]
                },
                {"methodology": "randomized controlled trial", 
                "definition" : "A study design where participants are randomly assigned to either the treatment or control group to reduce bias and establish causality.",
                "questions": ["What are the benefits of randomization in this study's context?", "How was blinding handled, and why is it important?"]}
            ]
        }

json_questions = {
            "questions": [
                {"question": "What is the purpose of MRNA in the process?", "answer": "Carries genetic info from DNA."},
                {"question": "What is the purpose of DNA in the process?", "answer": "Gives the instructions to the body."}
            ]
        }

# Create your views here.
class Analyze(APIView):
    def post(self, request):
        abstract_text = request.data.get("section", "")

        if not abstract_text:
            return Response({"error": "No abstract text present"}, status=status.HTTP_400_BAD_REQUEST)
        
        prompt = f"Define all specialized language and methodology found in the text below and return valid JSON only, do not include markdown do not include extra white space or new line syntax. json format: {json_combined} text: {abstract_text}"

        try: 
            output = prompt_chatgpt(prompt)
            parsed_output = json.loads(output)
            return Response(parsed_output)
        except Exception as e:
            return Response({ "Error in Analyze": str(e) }, status=status.HTTP_400_BAD_REQUEST)
    

# Speacilized Language / Terminology / Verbage 
class AnalyzeLanguage(APIView):
    def post(self, requet):
        abstract_text = requet.data.get("section", "")

        if not abstract_text:
            return Response({ "Error in AnalyzeLanguage View": "No text present"}, status=status.HTTP_400_BAD_REQUEST)
        
        prompt = f"Define all specialized language found in the text below and return valid JSON only, do not include markdown do not include extra white space or new line syntax. json format: {json_combined} text: {abstract_text}"

        try:
            output = prompt_chatgpt(prompt)
            parsed_output = json.loads(output)
            return Response(parsed_output)
        except Exception as error:
            return Response({ "Error in AnalyzeLanguage": str(error) }, status=status.HTTP_400_BAD_REQUEST)


class AnalyzeMethodology(APIView):
    def post(self, requet):
        abstract_text = requet.data.get("section", "")

        if not abstract_text:
            return Response({ "Error in AnalyzeLanguage View": "No text present"}, status=status.HTTP_400_BAD_REQUEST)
        
        prompt = f"Define all methodologies found in the text below and return valid JSON only, do not include markdown do not include extra white space or new line syntax. json format: {json_combined} text: {abstract_text}"

        try:
            output = prompt_chatgpt(prompt)
            parsed_output = json.loads(output)
            return Response(parsed_output)
        except Exception as error:
            return Response({ "Error in AnalyzeMethodology": str(error) }, status=status.HTTP_400_BAD_REQUEST)


class AnalyzeWithQuestions(APIView):
    def post(self, requet):
        abstract_text = requet.data.get("section", "")

        if not abstract_text:
            return Response({ "Error in AnalyzeLanguage View": "No text present"}, status=status.HTTP_400_BAD_REQUEST)

        prompt = f"Define all specialized language and methodology found in the text below, for each term found create two active reading questions that will test my knowledge. Return valid JSON only, do not include markdown do not include extra white space or new line syntax. json format: {json_combined_questions} text: {abstract_text}"

class ActiveReadingQuestions(APIView):
    def post(self, request):
        abstract_text = request.data.get("section", "")

        if not abstract_text:
            return Response({ "Error in ActiveReadingQuestions View": "No text present" }, status=status.HTTP_400_BAD_REQUEST)
        
        prompt = f"Conceptualize the text below and create active reading questions that will test my knowledge. Return valid JSON only, do not include markdown do not include extra white space or new line syntax. json format: {json_combined_questions} text: {abstract_text}"
        