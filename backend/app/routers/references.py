"""References router."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import get_current_user, require_role
from ..database import get_db
from ..models import Reference
from ..schemas import ReferenceOut, ReferenceUpdate

router = APIRouter(prefix="/api/references", tags=["references"])

DB = Annotated[Session, Depends(get_db)]


def _get_or_404(reference_id: int, db: Session) -> Reference:
    reference = db.get(Reference, reference_id)
    if reference is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reference not found")
    return reference


@router.get("", response_model=list[ReferenceOut], dependencies=[Depends(get_current_user)])
def list_references(db: DB) -> list[Reference]:
    return db.query(Reference).order_by(Reference.reference_id).all()


@router.patch("/{reference_id}", response_model=ReferenceOut, dependencies=[Depends(require_role("admin"))])
def update_reference(reference_id: int, payload: ReferenceUpdate, db: DB) -> Reference:
    reference = _get_or_404(reference_id, db)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(reference, key, value)
    db.commit()
    db.refresh(reference)
    return reference


@router.delete("/{reference_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_role("admin"))])
def delete_reference(reference_id: int, db: DB) -> None:
    reference = _get_or_404(reference_id, db)
    db.delete(reference)
    db.commit()
