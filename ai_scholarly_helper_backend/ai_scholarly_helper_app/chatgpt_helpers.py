import openai
from openai import OpenAI
from django.conf import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def prompt_chatgpt(prompt):
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful tutor that defines specialized terminology and explains complex methodology that is specific to an academic field of study."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.4,
        max_tokens=500 # max for this model is 8,192 tokens
    )

    return response.choices[0].message.content


# Response Object JSON Structure:
# 
# {
#   "id": "chatcmpl-abc123",
#   "object": "chat.completion",
#   "choices": [
#     {
#       "index": 0,
#       "message": {
#         "role": "assistant",
#         "content": "PCR is a method used to amplify DNA sequences..."
#       },
#       "finish_reason": "stop"
#     }
#   ],
#   "usage": {
#     "prompt_tokens": 10,
#     "completion_tokens": 20,
#     "total_tokens": 30
#   }
# }


