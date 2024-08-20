import json
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import TestResult
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import logging
from django.conf import settings
import google.generativeai as genai
from django.core.paginator import Paginator

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')
logger = logging.getLogger(__name__)


@csrf_exempt
def test_results(request):
    """
    View to return a paginated list of test results
    """
    try:
        # Get offset and limit from query parameters
        offset = int(request.GET.get('offset', 0))
        limit = int(request.GET.get('limit', 10))

        # Ensure offset and limit are non-negative
        if offset < 0 or limit <= 0:
            return JsonResponse({'error': 'Invalid offset or limit'}, status=400)

        # Fetch the test results
        test_results = TestResult.objects.all().values(
            'id', 'input_under_test', 'llm_output', 'criteria', 'auto_eval', 'auto_feedback', 'human_eval', 'human_feedback'
        )

        # Apply pagination
        paginator = Paginator(test_results, limit)
        page_number = (offset // limit) + 1
        page = paginator.page(page_number)

        return JsonResponse({
            'results': list(page.object_list),
            'total_count': paginator.count,
        }, safe=False)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def add_feedback(request):
    """
    View to add or modify human feedback for a specific test result
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            test_result_id = data.get('id')
            human_eval = data.get('human_eval')
            human_feedback = data.get('human_feedback')

            test_result = TestResult.objects.get(id=test_result_id)
            test_result.human_eval = human_eval
            test_result.human_feedback = human_feedback
            test_result.save()

            return JsonResponse({'status': 'success'})
        except TestResult.DoesNotExist:
            return JsonResponse({'error': 'TestResult not found'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def summarize(request):
    """
    Endpoint to provide a summary of the most common human feedback cases
    """
    try:
        # Fetch human feedback data from database
        human_feedbacks = TestResult.objects.values_list('human_feedback', flat=True)

        # Filter out "N/A" values
        valid_feedbacks = [feedback for feedback in human_feedbacks if feedback and feedback.strip().lower() != "n/a"]
        if not valid_feedbacks:
            return JsonResponse({'summary': 'No valid human feedbacks found'}, status=200)

        # Preprocess and vectorize the data
        vectorizer = TfidfVectorizer(stop_words='english')
        X = vectorizer.fit_transform(valid_feedbacks)

        # Determine the number of clusters dynamically
        num_clusters = min(3, len(valid_feedbacks))
        kmeans = KMeans(n_clusters=num_clusters)
        kmeans.fit(X)
        clusters = kmeans.predict(X)

        # Summarize using Gemini
        summaries = []
        for cluster in range(num_clusters):
            cluster_feedbacks = [valid_feedbacks[i] for i in range(len(clusters)) if clusters[i] == cluster]

            # Ensuring cluster_feedbacks is not empty
            if not cluster_feedbacks:
                continue

            # Constructing the prompt for LLM
            prompt = (
                "Summarize the following human feedbacks into 2-3 sentences:\n\n" +
                "\n".join(cluster_feedbacks) +
                "\n\nProvide a concise summary of the feedbacks above, focusing on the key points and common themes."
            )

            # Query the Gemini API
            response = model.generate_content(prompt)

            summaries.append(response.text.strip())

        # Returning the combined summary
        return JsonResponse({"summary": " ".join(summaries)})

    except Exception as e:
        logger.error(f"Error in summarize view: {e}")
        return JsonResponse({'error': str(e)}, status=500)