from django.db import models
from django.conf import settings

POST_REASON_CHOICES = [
    ('expired', 'Expired product posted as fresh'),
    ('dangerous', 'Dangerous or unsafe food'),
    ('misleading_desc', 'Misleading description'),
    ('inappropriate', 'Inappropriate content'),
    ('spam', 'Spam'),
    ('other', 'Other'),
]

PROFILE_REASON_CHOICES = [
    ('fake', 'Fake account'),
    ('misleading_info', 'Misleading information'),
    ('rude', 'Rude or Inappropriate behavior'),
    ('spam', 'Spam'),
    ('other', 'Other'),
]

ALL_REASON_CHOICES = POST_REASON_CHOICES + [
    r for r in PROFILE_REASON_CHOICES if r[0] not in dict(POST_REASON_CHOICES)
]

STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('treated', 'Treated'),
    ('dismissed', 'Dismissed'),
]

ACTION_CHOICES = [
    ('delete_post', 'Post Deleted'),
    ('deactivate_account', 'Account Deactivated'),
    ('send_warning', 'Warning Sent'),
    ('ignore', 'Ignored'),
]


class Report(models.Model):
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports_made'
    )
    reported_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='reports_received'
    )
    reported_donation = models.ForeignKey(
        'donations.Donation',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='reports'
    )
    reason = models.CharField(max_length=50, choices=ALL_REASON_CHOICES)
    description = models.TextField(blank=True)
    screenshot = models.ImageField(upload_to='report_screenshots/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    
    action_taken = models.CharField(
        max_length=50, choices=ACTION_CHOICES, null=True, blank=True
    )
   
    treated_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report by {self.reporter} — {self.reason} ({self.status})"