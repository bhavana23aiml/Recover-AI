from pydantic import BaseModel, Field


# =========================================================
# CREATE RAZORPAY ORDER
# =========================================================

class RazorpayRecoveryOrderRequest(BaseModel):
    recovery_job_id: str


class RazorpayRecoveryOrderResponse(BaseModel):
    recovery_job_id: str

    razorpay_order_id: str

    amount_paise: int = Field(
        gt=0
    )

    currency: str

    status: str

    key_id: str

    execution_mode: str = (
        "RAZORPAY_TEST"
    )


# =========================================================
# VERIFY CHECKOUT PAYMENT
# =========================================================

class RazorpayVerifyPaymentRequest(BaseModel):
    recovery_job_id: str

    razorpay_order_id: str

    razorpay_payment_id: str

    razorpay_signature: str


class RazorpayVerifyPaymentResponse(BaseModel):
    recovery_job_id: str

    razorpay_order_id: str

    razorpay_payment_id: str

    payment_status: str

    verified: bool

    execution_mode: str = (
        "RAZORPAY_TEST"
    )


# =========================================================
# RECONCILE PAYMENT
# =========================================================
#
# Used when:
#
# Razorpay payment succeeds
#       ↓
# browser callback / verification request fails
#       ↓
# RecoverAI independently checks Razorpay
#       ↓
# captured payment is safely reconciled
#
# Frontend only supplies the trusted recovery job ID.
#
# It does NOT supply:
# - payment ID
# - amount
# - order ID
# - status
#
# RecoverAI discovers and verifies those independently.
# =========================================================

class RazorpayReconcilePaymentRequest(
    BaseModel
):
    recovery_job_id: str


class RazorpayReconcilePaymentResponse(
    BaseModel
):
    recovery_job_id: str

    transaction_id: str

    razorpay_order_id: str

    razorpay_payment_id: str

    amount_paise: int = Field(
        gt=0
    )

    currency: str

    payment_status: str

    reconciled: bool

    execution_mode: str = (
        "RAZORPAY_TEST"
    )