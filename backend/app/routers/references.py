"""References router."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import get_current_user, require_role
from ..database import get_db
from ..models import Client, Employee, Mission, Reference, Skill
from ..schemas import ReferenceListOut, ReferenceOut, ReferenceUpdate

router = APIRouter(prefix="/api/references", tags=["references"])

DB = Annotated[Session, Depends(get_db)]


def _get_or_404(reference_id: int, db: Session) -> Reference:
    reference = db.get(Reference, reference_id)
    if reference is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reference not found")
    return reference


@router.get("", response_model=list[ReferenceListOut], dependencies=[Depends(get_current_user)])
def list_references(db: DB):
    rows = db.execute(
        select(
            Reference.reference_id,
            Reference.employee_id,
            Reference.role_description,
            Employee.first_name,
            Employee.last_name,
            Employee.profile_image_url,
            Mission.mission_id,
            Mission.mission_name,
            Mission.status,
            Client.company_name,
            Skill.skill_name,
        )
        .outerjoin(Employee, Reference.employee_id == Employee.employee_id)
        .join(Mission, Reference.mission_id == Mission.mission_id)
        .join(Client, Mission.customer_id == Client.customer_id)
        .join(Skill, Reference.skill_id == Skill.skill_id)
        .order_by(Employee.last_name, Employee.first_name, Mission.mission_id)
    ).mappings().all()
    return [ReferenceListOut.model_validate(dict(r)) for r in rows]


@router.patch(
    "/{reference_id}",
    response_model=ReferenceOut,
    dependencies=[Depends(require_role("admin"))],
)
def update_reference(reference_id: int, payload: ReferenceUpdate, db: DB) -> Reference:
    reference = _get_or_404(reference_id, db)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(reference, key, value)
    db.commit()
    db.refresh(reference)
    return reference


@router.delete(
    "/{reference_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("admin"))],
)
def delete_reference(reference_id: int, db: DB) -> None:
    reference = _get_or_404(reference_id, db)
    db.delete(reference)
    db.commit()
