import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import TestResult

@csrf_exempt
def test_results(request):
    """
    View to retrieve all test results from a database via GET request
    """
    test_results = list(TestResult.objects.all().values())
    return JsonResponse(test_results, safe=False)

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
