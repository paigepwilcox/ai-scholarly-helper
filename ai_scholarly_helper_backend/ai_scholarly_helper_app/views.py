from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# Create your views here.
class Analyze(APIView):
    def post(self, request):
        abstract_text = request.data.get("section", "")

        if not abstract_text:
            return Response({"error": "No abstract text present"}, status=status.HTTP_400_BAD_REQUEST)
        
        # chatgpt placeholder
        return Response({
            "terms": [
                {"term": "mRNA", "definition": "Messenger RNA, carries genetic info from DNA."},
                {"term": "ELISA", "definition": "A lab technique to detect antigens or antibodies."}
            ],
            "methodology": "This study used quantitative PCR to amplify mRNA sequences."
        })