import csv
import json
import io
from datetime import timedelta

from django.http import HttpResponse
from django.utils.timezone import now
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Donation, Reservation

User = get_user_model()


# ── Date range helper ─────────────────────────────────────────
def get_date_filter(date_range):
    today = now()
    mapping = {
        'last_7':    today - timedelta(days=7),
        'last_30':   today - timedelta(days=30),
        'last_3m':   today - timedelta(days=90),
        'this_year': today.replace(month=1, day=1, hour=0, minute=0, second=0),
        'all':       None,
    }
    return mapping.get(date_range, None)


# ── Data builders ─────────────────────────────────────────────
def get_donations_data(since):
    qs = Donation.objects.exclude(status='deleted').select_related('donor')
    if since:
        qs = qs.filter(created_at__gte=since)
    return [
        {
            'id':                 d.id,
            'title':              d.title,
            'donor':              d.donor.username if d.donor else 'Deleted User',  # fix
            'category':           d.category,
            'quantity':           d.quantity,
            'available_quantity': d.available_quantity,
            'unit':               d.unit,
            'status':             d.status,
            'urgency':            d.urgency,
            'expiry_date':        str(d.expiry_date),
            'pickup_address':     d.pickup_address,
            'created_at':         str(d.created_at.date()),
        }
        for d in qs.order_by('-created_at')
    ]


def get_reports_data(since):
    qs = Reservation.objects.select_related('donation', 'beneficiary')
    if since:
        qs = qs.filter(created_at__gte=since)
    return [
        {
            'id':           r.id,
            'donation':     r.donation.title if r.donation else 'Deleted',  # fix
            'donor':        r.donation.donor.username if r.donation and r.donation.donor else 'Deleted User',  # fix
            'beneficiary':  r.beneficiary.username if r.beneficiary else 'Deleted User',  # fix
            'quantity':     r.quantity_confirmed,
            'unit':         r.donation.unit if r.donation else '',  # fix
            'status':       r.status,
            'created_at':   str(r.created_at.date()),
        }
        for r in qs.order_by('-created_at')
    ]
def get_users_data(since):
    qs = User.objects.exclude(role='admin')
    if since:
        qs = qs.filter(date_joined__gte=since)
    return [
        {
            'id':               u.id,
            'username':         u.username,
            'email':            u.email,
            'role':             u.role,
            'phone':            u.phone,
            'is_active':        u.is_active,
            'is_verified':      u.is_verified,
            'reputation_score': u.reputation_score,
            'date_joined':      str(u.date_joined.date()),
        }
        for u in qs.order_by('-date_joined')
    ]


def get_statistics_data(since):
    donations_qs = Donation.objects.exclude(status='deleted')
    if since:
        donations_qs = donations_qs.filter(created_at__gte=since)

    donated = donations_qs.filter(status='donated')
    total_food_saved = round(sum(d.quantity_in_kg() for d in donated), 1)
    total_co2        = round(sum(d.co2_avoided_kg() for d in donated), 1)

    return [
        {'metric': 'Total Donations',    'value': donations_qs.count()},
        {'metric': 'Donated',            'value': donated.count()},
        {'metric': 'Expired',            'value': donations_qs.filter(status='expired').count()},
        {'metric': 'Active',             'value': donations_qs.filter(status='active').count()},
        {'metric': 'Food Saved (kg)',     'value': total_food_saved},
        {'metric': 'CO2 Avoided (kg)',   'value': total_co2},
        {'metric': 'Total Users',        'value': User.objects.exclude(role='admin').count()},
        {'metric': 'Active Users',       'value': User.objects.filter(is_active=True).exclude(role='admin').count()},
    ]




DATA_BUILDERS = {
    'donations':  get_donations_data,
    'users':      get_users_data,
    'statistics': get_statistics_data,
    'reports':    get_reports_data,
}


# ── Export View ───────────────────────────────────────────────


class AdminExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if not hasattr(user, 'role') or user.role not in ['admin', 'localauthority']:
            return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        fmt        = request.query_params.get('file_format', 'csv').lower()
        date_range = request.query_params.get('date_range', 'all')
        data_type  = request.query_params.get('data_type', 'donations').lower()

        if user.role == 'localauthority' and data_type in ['users', 'reports']:
            return Response({'error': 'Local authority cannot export users or reports.'}, status=status.HTTP_403_FORBIDDEN)

        since   = get_date_filter(date_range)
        builder = DATA_BUILDERS.get(data_type, get_donations_data)
        rows    = builder(since)
        filename = f"zerowaste_{data_type}_{date_range}"

        if fmt == 'json':
            return self._as_json(rows, filename)
        elif fmt == 'xlsx':
            return self._as_xlsx(rows, filename)
        else:
            return self._as_csv(rows, filename)
   

    # ── JSON ──
    def _as_json(self, rows, filename):
        response = HttpResponse(
            json.dumps(rows, indent=2, ensure_ascii=False),
            content_type='application/json'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}.json"'
        return response

    def _as_csv(self, rows, filename):
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="{filename}.csv"'
            if not rows:
                return response
            writer = csv.DictWriter(response, fieldnames=rows[0].keys())
            writer.writeheader()
            writer.writerows(rows)
            return response
        except Exception as e:
            import traceback
            return HttpResponse(f"CSV ERROR: {str(e)}\n{traceback.format_exc()}", status=500, content_type='text/plain')

    def _as_xlsx(self, rows, filename):
        try:
            import openpyxl
            wb = openpyxl.Workbook()
            ws = wb.active
            if rows:
                ws.append(list(rows[0].keys()))
                for row in rows:
                    ws.append(list(row.values()))
            buffer = io.BytesIO()
            wb.save(buffer)
            buffer.seek(0)
            response = HttpResponse(
                buffer.read(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename="{filename}.xlsx"'
            return response
        except Exception as e:
            import traceback
            return HttpResponse(f"XLSX ERROR: {str(e)}\n{traceback.format_exc()}", status=500, content_type='text/plain')