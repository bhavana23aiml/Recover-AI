from enum import Enum
from pydantic import BaseModel, Field
from datetime import datetime


class FailureCode(str, Enum):
    BANK_UNAVAILABLE = "BANK_UNAVAILABLE"
    NETWORK_ERROR = "NETWORK_ERROR"
    PAYMENT_TIMEOUT = "PAYMENT_TIMEOUT"
    INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS"
    MANDATE_FAILURE = "MANDATE_FAILURE"
    CUSTOMER_ABANDONED = "CUSTOMER_ABANDONED"
    ISSUER_DECLINED = "ISSUER_DECLINED"
    UNKNOWN_ERROR = "UNKNOWN_ERROR"


class ClassificationRequest(BaseModel):
    transaction_id: str
    amount: float = Field(gt=0)
    failure_code: FailureCode
    retry_count: int = Field(default=0, ge=0)


class ClassificationResult(BaseModel):
    transaction_id: str
    failure_code: FailureCode

    category: str
    retryable: bool
    severity: str

    recommended_action: str
    retry_delay_minutes: int | None

    confidence: float
    explanation: str
class RecoveryStatus(str, Enum):
    RETRY_SCHEDULED = "RETRY_SCHEDULED"
    CUSTOMER_ACTION_REQUIRED = "CUSTOMER_ACTION_REQUIRED"
    MANUAL_REVIEW = "MANUAL_REVIEW"
    STOPPED = "STOPPED"


class RecoveryDecision(BaseModel):
    transaction_id: str
    amount: float

    failure_code: FailureCode
    category: str

    action: str
    status: RecoveryStatus

    retryable: bool
    retry_delay_minutes: int | None

    confidence: float
    reason: str
class GuardrailStatus(str, Enum):
    ALLOWED = "ALLOWED"
    BLOCKED = "BLOCKED"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"


class GuardrailDecision(BaseModel):
    transaction_id: str

    proposed_action: str

    status: GuardrailStatus
    can_execute: bool

    retry_count: int
    max_retries: int

    confidence: float
    minimum_confidence: float

    violations: list[str]

    reason: str
class ExecutionStatus(str, Enum):
    RECOVERED = "RECOVERED"
    ACTION_COMPLETED = "ACTION_COMPLETED"
    FAILED = "FAILED"
    BLOCKED = "BLOCKED"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"


class AuditEvent(BaseModel):
    step: str
    status: str
    message: str
    timestamp: datetime


class RecoveryExecutionResponse(BaseModel):
    transaction_id: str
    amount: float

    failure_code: FailureCode
    category: str

    action: str

    confidence: float

    guardrail_status: GuardrailStatus
    can_execute: bool

    execution_status: ExecutionStatus

    recovered_amount: float

    simulation_probability: float | None = None

    execution_mode: str

    audit_trail: list[AuditEvent]
class ExecutionStatus(str, Enum):
    RECOVERED = "RECOVERED"
    ACTION_COMPLETED = "ACTION_COMPLETED"
    FAILED = "FAILED"
    BLOCKED = "BLOCKED"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"


class AuditEvent(BaseModel):
    step: str
    status: str
    message: str
    timestamp: datetime


class RecoveryExecutionResponse(BaseModel):
    transaction_id: str
    amount: float

    failure_code: FailureCode
    category: str

    action: str
    confidence: float

    guardrail_status: GuardrailStatus
    can_execute: bool

    execution_status: ExecutionStatus

    recovered_amount: float

    simulation_probability: float | None = None

    execution_mode: str

    audit_trail: list[AuditEvent]