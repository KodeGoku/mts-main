import json
import pytest
from django.urls import reverse
from django.test import Client
from .models import TestResult

@pytest.mark.django_db
def test_test_results_view(client):
    
    TestResult.objects.create(input_under_test="Test input 1", llm_output="Test output 1", criteria="Criteria 1", auto_eval="Auto eval 1", auto_feedback="Auto feedback 1", human_eval="Human eval 1", human_feedback="Human feedback 1")
    TestResult.objects.create(input_under_test="Test input 2", llm_output="Test output 2", criteria="Criteria 2", auto_eval="Auto eval 2", auto_feedback="Auto feedback 2", human_eval="Human eval 2", human_feedback="Human feedback 2")

    
    response = client.get(reverse('test_results'))
    assert response.status_code == 200
    data = json.loads(response.content)
    assert 'results' in data
    assert 'total_count' in data
    assert len(data['results']) == 2

@pytest.mark.django_db
def test_add_feedback_view(client):
    
    test_result = TestResult.objects.create(input_under_test="Test input", llm_output="Test output", criteria="Criteria", auto_eval="Auto eval", auto_feedback="Auto feedback", human_eval="Initial human eval", human_feedback="Initial human feedback")

    
    data = {
        'id': test_result.id,
        'human_eval': 'Updated human eval',
        'human_feedback': 'Updated human feedback',
    }

    # Test the view with POST method
    response = client.post(reverse('add_feedback'), json.dumps(data), content_type='application/json')
    assert response.status_code == 200
    assert json.loads(response.content)['status'] == 'success'

    # Verify that the object was updated
    test_result.refresh_from_db()
    assert test_result.human_eval == 'Updated human eval'
    assert test_result.human_feedback == 'Updated human feedback'

@pytest.mark.django_db
def test_summarize_view(client, mocker):
    # Create some test data
    TestResult.objects.create(human_feedback="This is good.")
    TestResult.objects.create(human_feedback="This is bad.")
    TestResult.objects.create(human_feedback="This is okay.")

    # Mock the Gemini API response
    mocker.patch('google.generativeai.GenerativeModel.generate_content', return_value=mocker.Mock(text="Mocked summary"))

    # Test the view
    response = client.get(reverse('summarize'))
    assert response.status_code == 200
    data = json.loads(response.content)
    assert 'summary' in data
    assert data['summary'] == "Mocked summary"
