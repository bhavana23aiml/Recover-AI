import json
import os
import time
from typing import Any

import httpx

from core import config


# =========================================================
# GROQCLOUD API
# =========================================================

GROQ_CHAT_URL = (
    "https://api.groq.com/openai/v1/chat/completions"
)


# =========================================================
# PROMPT
# =========================================================

def _build_prompt(
    context: dict[str, Any],
) -> str:
    """
    Build the explanation-only prompt for GroqCloud.

    RecoverAI's deterministic services have already made
    the classification, recovery, and guardrail decisions.

    GroqCloud is used only to explain those decisions.
    """

    context_json = json.dumps(
        context,
        ensure_ascii=False,
        indent=2,
        default=str,
    )

    return f"""
You are the AI explanation layer for RecoverAI,
an intelligent payment revenue recovery system.

RecoverAI has already deterministically:

- classified the payment failure
- selected a proposed recovery strategy
- calculated the confidence score
- evaluated safety guardrails

Your job is ONLY to explain those existing decisions
clearly to a payment operations professional.


=========================================================
STRICT AUTHORITY RULES
=========================================================

You MUST NOT:

- change the failure classification
- change the recommended recovery action
- change retry limits
- change retry counts
- change confidence values
- override guardrails
- authorize payment execution
- execute a payment
- retry a payment
- mark a payment successful
- claim revenue was recovered
- claim an action completed
- invent transaction facts
- invent customer facts
- invent payment gateway facts
- invent required operator actions

The deterministic RecoverAI system is authoritative.

You are an explanation layer only.


=========================================================
CRITICAL GUARDRAIL LANGUAGE RULES
=========================================================

`recommended_action` is only a proposed recovery strategy.

`can_execute` is the authoritative execution permission.

If `can_execute` is false:

- never say the action will execute
- never say the action will be executed
- never say the action will be attempted
- never say the system will retry
- never say the action will proceed
- never say the action is authorized to proceed
- never say a retry is scheduled
- never say a retry was scheduled
- never say the system is scheduling a retry
- never say execution has started
- never imply automatic execution will occur

Instead describe the action only as:

- proposed
- recommended
- selected as a strategy

If `guardrail_status` is BLOCKED:

- explicitly state that automatic execution is blocked
- explain only the supplied guardrail violation
- describe the recovery action only as proposed
- do not imply that the proposed action will execute
- do not invent a manual-review requirement
- do not invent alternative handling requirements

If `guardrail_status` is REVIEW_REQUIRED:

- explicitly state that automatic execution is not authorized
- state that manual review is required

Only when `can_execute` is true may you state that
the deterministic guardrail engine permits the
proposed action.

Even when `can_execute` is true:

- do not claim execution already occurred
- do not claim recovery already succeeded
- do not claim payment verification already succeeded

Never reinterpret, bypass, weaken, or override a
guardrail decision.


=========================================================
CRITICAL FINANCIAL DATA RULES
=========================================================

Amounts are expressed in Indian rupees (INR).

You MUST:

- preserve the numeric amount exactly as supplied
- use INR or ₹ when referring to the amount
- treat the amount as rupees, not cents
- use `amount_display` when available

You MUST NOT:

- convert the amount into another currency
- divide the amount by 100
- multiply the amount
- reinterpret the amount as paise or cents
- use USD
- use dollars
- use cents
- use the $ symbol
- invent another currency


=========================================================
CRITICAL FACTUAL GROUNDING RULES
=========================================================

Use ONLY facts explicitly present in the
deterministic context.

Do NOT introduce comparative claims such as:

- safer than
- reduces risk
- lower risk
- less risky
- better than
- more reliable
- more successful
- higher success rate

Do NOT invent benefits of a recovery strategy.

Explain the recovery rationale only using:

- failure code
- failure category
- proposed recovery action
- retry delay
- deterministic reason
- guardrail status
- guardrail violations

Never invent or claim:

- historical patterns
- historical success rates
- historical transaction data
- previous recovery performance
- customer history
- merchant history
- bank history
- issuer history
- bank trends
- issuer trends
- behavioral patterns
- previous outcomes
- success probabilities
- external evidence
- additional risk factors

unless those facts are explicitly supplied.

Never invent an operator requirement such as:

- manual review
- alternative handling
- operator intervention
- policy adjustment

unless that requirement is explicitly present in
the deterministic context.

The confidence score is deterministic input.

Do NOT invent a reason for how the confidence
score was calculated.

You may only describe its level, for example:

- high confidence
- moderate confidence
- low confidence


=========================================================
RECOVERY ACTION WORDING
=========================================================

The field `recommended_action` means:

PROPOSED RECOVERY ACTION

It does NOT automatically mean:

- scheduled
- executed
- started
- attempted
- completed

If `can_execute` is false, always use words such as:

- proposed
- recommended
- blocked
- not authorized
- not permitted

Never describe a blocked action as scheduled.


=========================================================
OUTPUT REQUIREMENTS
=========================================================

Return exactly four concise explanation fields:

1. diagnosis
2. recovery_rationale
3. confidence_narrative
4. operator_summary

Diagnosis:
Explain the supplied failure classification.

Recovery rationale:
Explain the supplied proposed recovery action using
only deterministic facts.

Confidence narrative:
Describe the supplied confidence score without
inventing evidence.

Operator summary:
Give a concise operational summary that accurately
reflects the guardrail state.

For BLOCKED cases, state only:

- that automatic execution is blocked
- the supplied reason for the block
- that the recovery action remains proposed

Do not invent additional next steps.

Do not provide execution instructions.

Do not recommend bypassing RecoverAI policies.

Do not modify deterministic facts.


=========================================================
DETERMINISTIC RECOVERAI CONTEXT
=========================================================

{context_json}
""".strip()


# =========================================================
# STRUCTURED OUTPUT SCHEMA
# =========================================================

def _response_schema() -> dict[str, Any]:
    """
    Explanation-only structured output schema.

    There are intentionally no output fields for:

    - execution permission
    - guardrail decision
    - payment status
    - retry count
    - verification result

    Those remain controlled by RecoverAI.
    """

    return {
        "type": "object",

        "properties": {
            "diagnosis": {
                "type": "string",
            },

            "recovery_rationale": {
                "type": "string",
            },

            "confidence_narrative": {
                "type": "string",
            },

            "operator_summary": {
                "type": "string",
            },
        },

        "required": [
            "diagnosis",
            "recovery_rationale",
            "confidence_narrative",
            "operator_summary",
        ],

        "additionalProperties": False,
    }


# =========================================================
# RESPONSE EXTRACTION
# =========================================================

def _extract_content(
    payload: dict[str, Any],
) -> str:
    """
    Extract structured JSON text from the
    GroqCloud Chat Completions response.
    """

    choices = payload.get(
        "choices"
    )

    if (
        not isinstance(choices, list)
        or not choices
    ):
        raise ValueError(
            "GroqCloud returned no choices."
        )

    first_choice = choices[0]

    if not isinstance(
        first_choice,
        dict,
    ):
        raise ValueError(
            "GroqCloud returned an invalid choice."
        )

    message = first_choice.get(
        "message"
    )

    if not isinstance(
        message,
        dict,
    ):
        raise ValueError(
            "GroqCloud returned no message."
        )

    content = message.get(
        "content"
    )

    if (
        not isinstance(content, str)
        or not content.strip()
    ):
        raise ValueError(
            "GroqCloud returned empty content."
        )

    return content.strip()


# =========================================================
# STRUCTURE VALIDATION
# =========================================================

def _validate_result(
    result: dict[str, Any],
) -> dict[str, str]:
    """
    Validate the structure and basic types returned
    by the AI provider.
    """

    required_fields = (
        "diagnosis",
        "recovery_rationale",
        "confidence_narrative",
        "operator_summary",
    )

    validated: dict[str, str] = {}

    for field in required_fields:

        value = result.get(
            field
        )

        if (
            not isinstance(value, str)
            or not value.strip()
        ):
            raise ValueError(
                "GroqCloud returned an invalid "
                f"value for '{field}'."
            )

        validated[field] = (
            value.strip()
        )

    return validated


# =========================================================
# FACTUAL GROUNDING VALIDATION
# =========================================================

def _validate_grounding(
    result: dict[str, str],
    context: dict[str, Any],
) -> None:
    """
    Deterministically validate the AI explanation.

    The prompt is NOT treated as a safety boundary.

    If the provider introduces unsupported facts or
    contradicts deterministic guardrails, this function
    rejects the response.

    ai_reasoner.py will then return RecoverAI's
    deterministic fallback explanation.
    """

    context_text = json.dumps(
        context,
        ensure_ascii=False,
        default=str,
    ).lower()

    output_text = " ".join(
        result.values()
    ).lower()

    # =====================================================
    # 1. UNSUPPORTED STRATEGY CLAIMS
    # =====================================================

    unsupported_strategy_claims = (
        "safer than",
        "reduces risk",
        "reduce risk",
        "reduced risk",
        "lower risk",
        "lower-risk",
        "less risky",
        "more reliable",
        "more successful",
        "better than",
        "higher success rate",
        "improves success rate",
        "improve success rate",
        "increase success rate",
        "increases success rate",
    )

    for phrase in unsupported_strategy_claims:

        if phrase in output_text:
            raise ValueError(
                "GroqCloud introduced an unsupported "
                f"strategy claim: '{phrase}'."
            )

    # =====================================================
    # 2. UNSUPPORTED HISTORICAL / STATISTICAL CLAIMS
    # =====================================================

    unsupported_evidence = (
        "historical pattern",
        "historical patterns",
        "historical data",
        "historical success",
        "historical success rate",
        "previous success",
        "past success",
        "past performance",
        "previous recovery performance",
        "customer history",
        "merchant history",
        "bank history",
        "issuer history",
        "bank trend",
        "bank trends",
        "issuer trend",
        "issuer trends",
        "behavioral pattern",
        "behavioral patterns",
    )

    for phrase in unsupported_evidence:

        if (
            phrase in output_text
            and phrase not in context_text
        ):
            raise ValueError(
                "GroqCloud introduced unsupported "
                f"evidence: '{phrase}'."
            )

    # =====================================================
    # 3. UNSUPPORTED OPERATOR ACTION CLAIMS
    # =====================================================

    unsupported_operator_actions = (
        "manual review",
        "alternative handling",
        "operator intervention",
        "policy adjustment",
    )

    for phrase in unsupported_operator_actions:

        if (
            phrase in output_text
            and phrase not in context_text
        ):
            raise ValueError(
                "GroqCloud introduced an unsupported "
                f"operator action: '{phrase}'."
            )

    # =====================================================
    # 4. CURRENCY PROTECTION
    # =====================================================

    if "$" in output_text:
        raise ValueError(
            "GroqCloud introduced an unsupported "
            "currency symbol."
        )

    unsupported_currency_terms = (
        "usd",
        "dollar",
        "dollars",
        "cent",
        "cents",
    )

    normalized_words = (
        output_text
        .replace(",", " ")
        .replace(".", " ")
        .replace(":", " ")
        .replace(";", " ")
        .replace("(", " ")
        .replace(")", " ")
        .replace("[", " ")
        .replace("]", " ")
        .replace("{", " ")
        .replace("}", " ")
        .replace("/", " ")
        .replace("\\", " ")
        .replace("-", " ")
        .split()
    )

    for term in unsupported_currency_terms:

        if term in normalized_words:
            raise ValueError(
                "GroqCloud introduced an unsupported "
                f"currency representation: '{term}'."
            )

    # =====================================================
    # 5. CONTEXT GUARDRAIL STATE
    # =====================================================

    can_execute = context.get(
        "can_execute"
    )

    guardrail_status = str(
        context.get(
            "guardrail_status"
        )
        or ""
    ).strip().upper()

    # =====================================================
    # 6. BLOCKED / NON-EXECUTABLE PROTECTION
    # =====================================================

    if can_execute is False:

        forbidden_execution_claims = (
            "will execute",
            "will be executed",
            "will be attempted",
            "will retry",
            "will proceed",
            "authorized to proceed",
            "scheduled to execute",
            "execution will proceed",
            "automatic execution will occur",
            "scheduling a retry",
            "scheduled a retry",
            "retry is scheduled",
            "retry was scheduled",
            "retry has been scheduled",
            "retry scheduled",
            "scheduled retry",
        )

        for phrase in forbidden_execution_claims:

            if phrase in output_text:
                raise ValueError(
                    "GroqCloud incorrectly implied "
                    "execution for a non-executable action: "
                    f"'{phrase}'."
                )

    # =====================================================
    # 7. BLOCKED STATE CANNOT BE CONTRADICTED
    # =====================================================

    if (
        guardrail_status == "BLOCKED"
        and can_execute is False
    ):

        misleading_allowed_claims = (
            "guardrails allow",
            "guardrail allows",
            "guardrails permit",
            "guardrail permits",
            "execution is permitted",
            "execution is allowed",
            "automatic execution is permitted",
            "automatic execution is allowed",
            "approved for execution",
            "approved to execute",
        )

        for phrase in misleading_allowed_claims:

            if phrase in output_text:
                raise ValueError(
                    "GroqCloud contradicted the "
                    "BLOCKED guardrail decision: "
                    f"'{phrase}'."
                )

        blocked_language = (
            "blocked",
            "not authorized",
            "not permitted",
            "cannot be executed",
            "cannot execute",
            "automatic execution is not permitted",
            "automatic execution is not authorized",
        )

        if not any(
            phrase in output_text
            for phrase in blocked_language
        ):
            raise ValueError(
                "GroqCloud did not clearly communicate "
                "the BLOCKED guardrail state."
            )

    # =====================================================
    # 8. REVIEW_REQUIRED STATE
    # =====================================================

    if (
        guardrail_status == "REVIEW_REQUIRED"
        and can_execute is False
    ):

        misleading_review_claims = (
            "automatic execution is allowed",
            "automatic execution is permitted",
            "authorized to proceed",
            "will proceed automatically",
            "approved for automatic execution",
        )

        for phrase in misleading_review_claims:

            if phrase in output_text:
                raise ValueError(
                    "GroqCloud contradicted the "
                    "REVIEW_REQUIRED guardrail state: "
                    f"'{phrase}'."
                )

        if (
            "manual review" not in output_text
            and "review required" not in output_text
        ):
            raise ValueError(
                "GroqCloud did not clearly communicate "
                "the manual-review requirement."
            )

    # =====================================================
    # 9. ALLOWED STATE CANNOT CLAIM COMPLETION
    # =====================================================

    if (
        guardrail_status == "ALLOWED"
        and can_execute is True
    ):

        forbidden_completion_claims = (
            "payment succeeded",
            "payment was successful",
            "payment has succeeded",
            "recovery succeeded",
            "recovery was successful",
            "revenue recovered",
            "payment verified successfully",
            "execution completed",
        )

        for phrase in forbidden_completion_claims:

            if phrase in output_text:
                raise ValueError(
                    "GroqCloud incorrectly claimed "
                    "financial execution or completion: "
                    f"'{phrase}'."
                )

    # =====================================================
    # 10. AMOUNT CONTEXT VALIDATION
    # =====================================================

    amount_display = context.get(
        "amount_display"
    )

    if (
        amount_display is not None
        and not isinstance(
            amount_display,
            str,
        )
    ):
        raise ValueError(
            "RecoverAI context contained an invalid "
            "amount_display value."
        )


# =========================================================
# GROQCLOUD PROVIDER
# =========================================================

def generate_groq_reasoning(
    context: dict[str, Any],
) -> dict[str, str]:
    """
    Generate explanation-only reasoning using GroqCloud.

    This function does NOT:

    - call Razorpay
    - execute payments
    - retry payments
    - write to Supabase
    - modify recovery decisions
    - modify guardrails
    - change retry counts
    - authorize execution
    - verify payment success

    Provider path:

        deterministic context
                ↓
        GroqCloud
                ↓
        structured JSON
                ↓
        structure validation
                ↓
        grounding validation
                ↓
        accepted explanation

    Any provider or grounding failure is raised to
    ai_reasoner.py.

    ai_reasoner.py then returns the deterministic
    fallback explanation.
    """

    # =====================================================
    # API KEY
    # =====================================================

    api_key = os.getenv(
        "GROQ_API_KEY"
    )

    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is not configured."
        )

    # =====================================================
    # MODEL
    # =====================================================

    model = (
        config.AI_MODEL
        .strip()
    )

    if not model:
        raise RuntimeError(
            "AI_MODEL is not configured."
        )

    # =====================================================
    # REQUEST HEADERS
    # =====================================================

    headers = {
        "Authorization":
            f"Bearer {api_key}",

        "Content-Type":
            "application/json",
    }

    # =====================================================
    # REQUEST BODY
    # =====================================================

    body = {
        "model":
            model,

        "messages": [
            {
                "role":
                    "system",

                "content": (
                    "You are RecoverAI's explanation-only "
                    "AI assistant. "
                    "The deterministic RecoverAI system "
                    "controls classification, recovery, "
                    "guardrails, execution, verification, "
                    "and payment state. "
                    "Use only supplied deterministic facts. "
                    "Never invent facts, operator requirements, "
                    "or claim authority over financial actions."
                ),
            },

            {
                "role":
                    "user",

                "content":
                    _build_prompt(
                        context
                    ),
            },
        ],

        "response_format": {
            "type":
                "json_schema",

            "json_schema": {
                "name":
                    "recoverai_reasoning",

                "schema":
                    _response_schema(),
            },
        },

        "temperature":
            0.1,
    }

    # =====================================================
    # PROVIDER RETRY POLICY
    # =====================================================

    attempts = max(
        1,
        config.AI_MAX_RETRIES + 1,
    )

    last_error: Exception | None = None

    # =====================================================
    # PROVIDER REQUEST
    # =====================================================

    for attempt in range(
        attempts
    ):

        try:

            with httpx.Client(
                timeout=(
                    config.AI_TIMEOUT_SECONDS
                ),
            ) as client:

                response = client.post(
                    GROQ_CHAT_URL,
                    headers=headers,
                    json=body,
                )

            response.raise_for_status()

            payload = response.json()

            content = _extract_content(
                payload
            )

            result = json.loads(
                content
            )

            if not isinstance(
                result,
                dict,
            ):
                raise ValueError(
                    "GroqCloud structured output "
                    "was not a JSON object."
                )

            # ---------------------------------------------
            # STRUCTURE VALIDATION
            # ---------------------------------------------

            validated = (
                _validate_result(
                    result
                )
            )

            # ---------------------------------------------
            # FACTUAL / SAFETY VALIDATION
            # ---------------------------------------------

            _validate_grounding(
                validated,
                context,
            )

            return validated

        except (
            httpx.TimeoutException,
            httpx.NetworkError,
            httpx.HTTPStatusError,
            json.JSONDecodeError,
            ValueError,
            TypeError,
        ) as exc:

            last_error = exc

            if (
                attempt
                >= attempts - 1
            ):
                break

            time.sleep(
                0.25
            )

    # =====================================================
    # PROVIDER FAILURE
    # =====================================================

    raise RuntimeError(
        "GroqCloud explanation request failed."
    ) from last_error