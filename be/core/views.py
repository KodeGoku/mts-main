import json
from django.http import JsonResponse

from .models import TestResult
import pandas as pd
from django.core import serializers
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def test_results(request):
    """
    View to retrieve all test results from a database via GET request
    """
    test_results = list(TestResult.objects.all().values())

    return JsonResponse(test_results, safe=False)
