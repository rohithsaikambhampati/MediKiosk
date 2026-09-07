from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user_token_payload
from app.schemas.auth import LoginRequest, TokenResponse, UserCreate, UserResponse
from app.schemas.common import ApiResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=ApiResponse[TokenResponse])
def login(login_in: LoginRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    user = auth_service.authenticate_user(login_in.email, login_in.password)
    token_resp = auth_service.create_user_token(user)
    return ApiResponse(data=token_resp)


@router.post("/register", response_model=ApiResponse[UserResponse], status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    user = auth_service.register_user(user_in)
    return ApiResponse(data=UserResponse.model_validate(user))


@router.get("/me", response_model=ApiResponse[UserResponse])
def get_current_user_profile(
    payload: dict = Depends(get_current_user_token_payload),
    db: Session = Depends(get_db)
):
    user_id = payload.get("sub")
    auth_service = AuthService(db)
    user = auth_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return ApiResponse(data=UserResponse.model_validate(user))
