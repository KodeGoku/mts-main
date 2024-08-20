import uuid
from django.db import models

class TestResult(models.Model):
    """
    The result of one
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    input_under_test = models.TextField()
    llm_output = models.TextField()
    criteria = models.TextField()
    auto_eval = models.IntegerField()
    auto_feedback = models.TextField()
    
    human_eval = models.IntegerField(blank=True, null=True)
    human_feedback = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.input_under_test
