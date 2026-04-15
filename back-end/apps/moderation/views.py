from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import get_user_model
from .models import Report
from .serializers import ReportSerializer
from apps.users.permissions import IsAdmin

User = get_user_model()


class CreateReportView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]  # supports file upload

    def post(self, request):
        serializer = ReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(reporter=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ListReportsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        report_status = request.query_params.get('status')   # pending / treated / dismissed
        report_type = request.query_params.get('type')       # post / user

        reports = Report.objects.all().order_by('-created_at')

        if report_status:
            reports = reports.filter(status=report_status)
        if report_type == 'post':
            reports = reports.filter(reported_donation__isnull=False)
        elif report_type == 'user':
            reports = reports.filter(reported_user__isnull=False)

        serializer = ReportSerializer(reports, many=True, context={'request': request})
        return Response({'count': reports.count(), 'reports': serializer.data})


class ReportActionView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            report = Report.objects.get(pk=pk)
        except Report.DoesNotExist:
            return Response({'error': 'Report not found.'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')
        # actions: delete_post / deactivate_account / send_warning / ignore

        if action == 'delete_post':
            if report.reported_donation:
                report.reported_donation.delete()
            report.status = 'treated'
            report.save()
            return Response({'message': 'Post deleted and report treated.'})

        elif action == 'deactivate_account':
            if report.reported_user:
                report.reported_user.is_active = False
                report.reported_user.save()
            report.status = 'treated'
            report.save()
            return Response({'message': 'Account deactivated and report treated.'})

        elif action == 'send_warning':
            # Email logic can be added here later
            report.status = 'treated'
            report.save()
            return Response({'message': 'Warning sent and report treated.'})

        elif action == 'ignore':
            report.status = 'dismissed'
            report.save()
            return Response({'message': 'Report dismissed.'})

        return Response({'error': 'Invalid action.'}, status=status.HTTP_400_BAD_REQUEST)


class ToggleUserActiveView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            user.is_active = not user.is_active
            user.save()
            state = 'activated' if user.is_active else 'deactivated'
            return Response({'message': f'User {user.username} has been {state}.'})
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)