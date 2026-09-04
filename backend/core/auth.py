from typing import Any, Annotated

from fastapi import (
    Depends,
    HTTPException,
    status,
)

from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from pydantic import (
    BaseModel,
    Field,
)

from core.database import get_supabase


# =========================================================
# BEARER TOKEN EXTRACTION
# =========================================================

bearer_scheme = HTTPBearer(
    auto_error=False,
)


# =========================================================
# AUTHENTICATED USER MODEL
# =========================================================

class AuthenticatedUser(BaseModel):
    id: str
    email: str | None = None

    user_metadata: dict[str, Any] = Field(
        default_factory=dict,
    )

    app_metadata: dict[str, Any] = Field(
        default_factory=dict,
    )


# =========================================================
# CURRENT AUTHENTICATED USER
# =========================================================

def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
) -> AuthenticatedUser:
    """
    Validate a Supabase access token sent by the frontend.

    Expected header:

        Authorization: Bearer <access_token>

    Invalid or expired tokens are rejected with HTTP 401.
    """

    # -----------------------------------------------------
    # REQUIRE AUTHORIZATION HEADER
    # -----------------------------------------------------

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )


    # -----------------------------------------------------
    # REQUIRE BEARER AUTH
    # -----------------------------------------------------

    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )


    access_token = credentials.credentials.strip()


    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )


    # -----------------------------------------------------
    # VERIFY TOKEN WITH SUPABASE AUTH
    # -----------------------------------------------------

    try:
        supabase = get_supabase()

        response = supabase.auth.get_user(
            access_token,
        )

        user = response.user

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )


    # -----------------------------------------------------
    # REQUIRE VERIFIED USER
    # -----------------------------------------------------

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user was not found.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )


    user_id = getattr(
        user,
        "id",
        None,
    )


    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authenticated user.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )


    # -----------------------------------------------------
    # RETURN SAFE USER CONTEXT
    # -----------------------------------------------------

    return AuthenticatedUser(
        id=str(user_id),

        email=getattr(
            user,
            "email",
            None,
        ),

        user_metadata=(
            getattr(
                user,
                "user_metadata",
                None,
            )
            or {}
        ),

        app_metadata=(
            getattr(
                user,
                "app_metadata",
                None,
            )
            or {}
        ),
    )