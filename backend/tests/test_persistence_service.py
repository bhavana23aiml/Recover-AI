from services import persistence_service


class FakeResponse:
    def __init__(self, data):
        self.data = data


class FakeQuery:
    def __init__(self):
        self.payload = None
        self.job_id = None

    def update(self, payload):
        self.payload = payload
        return self

    def eq(self, field, value):
        assert field == "id"
        self.job_id = value
        return self

    def execute(self):
        return FakeResponse([
            {
                "id": self.job_id,
                **self.payload,
            }
        ])


class FakeSupabase:
    def __init__(self):
        self.query = FakeQuery()

    def table(self, name):
        assert name == "recovery_jobs"
        return self.query


def test_captured_payment_marks_order_paid(monkeypatch):
    fake_db = FakeSupabase()

    monkeypatch.setattr(
        persistence_service,
        "get_supabase",
        lambda: fake_db,
    )

    monkeypatch.setattr(
        persistence_service,
        "_utc_now_iso",
        lambda: "2026-08-31T10:00:00+00:00",
    )

    result = persistence_service.save_verified_payment(
        job_id="job_test_001",
        razorpay_payment_id="pay_test_001",
        payment_status="captured",
    )

    assert result["razorpay_payment_id"] == "pay_test_001"
    assert result["razorpay_payment_status"] == "captured"
    assert result["razorpay_order_status"] == "paid"
    assert result["gateway_verified_at"] == "2026-08-31T10:00:00+00:00"
