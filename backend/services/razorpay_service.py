from __future__ import annotations

import os
import time
from functools import lru_cache
from pathlib import Path
from typing import Any

import razorpay
from dotenv import load_dotenv


# =========================================================
# ENVIRONMENT
# =========================================================

ENV_PATH = (
    Path(__file__).resolve().parents[1]
    / ".env"
)

load_dotenv(
    ENV_PATH,
    override=True,
)


# =========================================================
# CUSTOM EXCEPTIONS
# =========================================================

class RazorpayConfigurationError(
    RuntimeError
):
    """
    Raised when required Razorpay configuration
    is missing.
    """

    pass


class RazorpayVerificationError(
    RuntimeError
):
    """
    Raised when Razorpay signature verification
    fails.
    """

    pass


# =========================================================
# CONFIGURATION
# =========================================================

def razorpay_enabled() -> bool:
    """
    Return whether Razorpay execution is enabled.

    RecoverAI currently uses Razorpay Test Mode.
    """

    value = os.getenv(
        "RAZORPAY_ENABLED",
        "false",
    )

    return value.strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }


def get_razorpay_key_id() -> str:
    """
    Return the public Razorpay Key ID.

    This value may safely be returned to
    Razorpay Checkout.

    IMPORTANT:
    RAZORPAY_KEY_SECRET must never be exposed
    to the frontend.
    """

    key_id = os.getenv(
        "RAZORPAY_KEY_ID"
    )

    if not key_id:
        raise RazorpayConfigurationError(
            "RAZORPAY_KEY_ID is missing."
        )

    return key_id


# =========================================================
# RAZORPAY CLIENT
# =========================================================

@lru_cache(maxsize=1)
def get_razorpay_client() -> razorpay.Client:
    """
    Create and cache the server-side
    Razorpay client.
    """

    key_id = os.getenv(
        "RAZORPAY_KEY_ID"
    )

    key_secret = os.getenv(
        "RAZORPAY_KEY_SECRET"
    )

    if not key_id:
        raise RazorpayConfigurationError(
            "RAZORPAY_KEY_ID is missing."
        )

    if not key_secret:
        raise RazorpayConfigurationError(
            "RAZORPAY_KEY_SECRET is missing."
        )

    return razorpay.Client(
        auth=(
            key_id,
            key_secret,
        )
    )


# =========================================================
# ORDER CREATION
# =========================================================

def create_test_order(
    *,
    amount_paise: int,
    receipt: str,
    currency: str = "INR",
) -> dict[str, Any]:
    """
    Create a Razorpay Test Mode order.

    amount_paise is always supplied in
    currency subunits.

    Examples:

        ₹1
        -> 100 paise

        ₹7,499
        -> 749900 paise
    """

    if amount_paise <= 0:
        raise ValueError(
            "amount_paise must be greater than zero."
        )

    if not receipt:
        raise ValueError(
            "receipt is required."
        )

    if not currency:
        raise ValueError(
            "currency is required."
        )

    payload = {
        "amount": int(
            amount_paise
        ),
        "currency": currency,
        "receipt": receipt,
    }

    client = get_razorpay_client()

    order = client.order.create(
        data=payload
    )

    if not isinstance(
        order,
        dict,
    ):
        raise RuntimeError(
            "Razorpay returned an invalid order response."
        )

    return dict(
        order
    )


# =========================================================
# ORDER FETCH
# =========================================================

def fetch_order(
    order_id: str,
) -> dict[str, Any]:
    """
    Fetch an existing Razorpay order.
    """

    if not order_id:
        raise ValueError(
            "order_id is required."
        )

    client = get_razorpay_client()

    order = client.order.fetch(
        order_id
    )

    if not isinstance(
        order,
        dict,
    ):
        raise RuntimeError(
            "Razorpay returned an invalid order response."
        )

    return dict(
        order
    )


# =========================================================
# PAYMENT FETCH
# =========================================================

def fetch_payment(
    payment_id: str,
) -> dict[str, Any]:
    """
    Fetch one Razorpay payment by payment ID.

    Used by RecoverAI during backend payment
    verification.

    A bounded retry is used only for transient
    Razorpay/network failures.

    Maximum attempts:
        3

    Backoff:
        attempt 1 failure -> wait 0.5s
        attempt 2 failure -> wait 1.0s
        attempt 3 failure -> raise error

    RecoverAI still fails closed if Razorpay
    cannot be reached.
    """

    if not payment_id:
        raise ValueError(
            "payment_id is required."
        )

    last_error: (
        Exception | None
    ) = None

    for attempt in range(3):

        try:
            payment = (
                get_razorpay_client()
                .payment
                .fetch(
                    payment_id
                )
            )

            if not isinstance(
                payment,
                dict,
            ):
                raise RuntimeError(
                    "Razorpay returned an invalid "
                    "payment response."
                )

            return dict(
                payment
            )

        except Exception as exc:
            last_error = exc

            if attempt >= 2:
                break

            delay_seconds = (
                0.5
                * (2 ** attempt)
            )

            time.sleep(
                delay_seconds
            )

    if last_error is not None:
        raise last_error

    raise RuntimeError(
        "Unable to fetch Razorpay payment."
    )


# =========================================================
# FETCH PAYMENTS FOR AN ORDER
# =========================================================

def fetch_order_payments(
    order_id: str,
) -> dict[str, Any]:
    """
    Fetch all Razorpay payment attempts
    associated with one order.

    Used by RecoverAI reconciliation when:

    - Razorpay Checkout succeeds
    - normal browser verification fails
    - callback/network request times out
    - RecoverAI needs to independently
      discover the captured payment

    Failed payment attempts may also appear
    in the returned collection.

    The reconciliation layer decides which
    payment, if any, is safe to accept.
    """

    if not order_id:
        raise ValueError(
            "order_id is required."
        )

    last_error: (
        Exception | None
    ) = None

    for attempt in range(3):

        try:
            collection = (
                get_razorpay_client()
                .order
                .payments(
                    order_id
                )
            )

            if not isinstance(
                collection,
                dict,
            ):
                raise RuntimeError(
                    "Razorpay returned an invalid "
                    "payment collection."
                )

            return dict(
                collection
            )

        except Exception as exc:
            last_error = exc

            if attempt >= 2:
                break

            delay_seconds = (
                0.5
                * (2 ** attempt)
            )

            time.sleep(
                delay_seconds
            )

    if last_error is not None:
        raise last_error

    raise RuntimeError(
        "Unable to fetch Razorpay order payments."
    )


# =========================================================
# PAYMENT SIGNATURE VERIFICATION
# =========================================================

def verify_payment_signature(
    *,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
) -> bool:
    """
    Verify Razorpay Checkout signature
    on the RecoverAI backend.

    Frontend payment success is NEVER enough
    to mark revenue as verified.

    The order ID passed here should be the
    order ID stored by RecoverAI rather than
    blindly trusting the browser value.
    """

    if not razorpay_order_id:
        raise ValueError(
            "razorpay_order_id is required."
        )

    if not razorpay_payment_id:
        raise ValueError(
            "razorpay_payment_id is required."
        )

    if not razorpay_signature:
        raise ValueError(
            "razorpay_signature is required."
        )

    client = get_razorpay_client()

    try:
        client.utility.verify_payment_signature(
            {
                "razorpay_order_id":
                    razorpay_order_id,

                "razorpay_payment_id":
                    razorpay_payment_id,

                "razorpay_signature":
                    razorpay_signature,
            }
        )

    except Exception as exc:
        raise RazorpayVerificationError(
            "Razorpay payment signature "
            "verification failed."
        ) from exc

    return True


# =========================================================
# WEBHOOK SIGNATURE VERIFICATION
# =========================================================

def verify_webhook_signature(
    *,
    raw_body: str,
    signature: str,
) -> bool:
    """
    Verify Razorpay webhook signature.

    IMPORTANT:

    raw_body must contain the exact,
    unmodified webhook request body.

    This functionality is separate from
    Razorpay Checkout payment-signature
    verification.

    RAZORPAY_WEBHOOK_SECRET is only required
    when the webhook endpoint is enabled.
    """

    if not raw_body:
        raise ValueError(
            "raw_body is required."
        )

    if not signature:
        raise ValueError(
            "signature is required."
        )

    webhook_secret = os.getenv(
        "RAZORPAY_WEBHOOK_SECRET"
    )

    if not webhook_secret:
        raise RazorpayConfigurationError(
            "RAZORPAY_WEBHOOK_SECRET is missing."
        )

    client = get_razorpay_client()

    try:
        client.utility.verify_webhook_signature(
            raw_body,
            signature,
            webhook_secret,
        )

    except Exception as exc:
        raise RazorpayVerificationError(
            "Razorpay webhook signature "
            "verification failed."
        ) from exc

    return True