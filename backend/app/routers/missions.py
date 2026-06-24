"""Missions router."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import get_current_user, require_role
from ..database import get_db
from ..models import Employee, Mission, Reference, Skill
from ..schemas import MissionOut, MissionUpdate, ReferenceRowOut

router = APIRouter(prefix="/api/missions", tags=["missions"])

DB = Annotated[Session, Depends(get_db)]


def _get_or_404(mission_id: int, db: Session) -> Mission:
    mission = db.get(Mission, mission_id)
    if mission is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mission not found")
    return mission


@router.get("", response_model=list[MissionOut], dependencies=[Depends(get_current_user)])
def list_missions(
    db: DB,
    customer_id: Annotated[int | None, Query()] = None,
) -> list[Mission]:
    q = db.query(Mission)
    if customer_id is not None:
        q = q.filter(Mission.customer_id == customer_id)
    return q.order_by(Mission.mission_id).all()


@router.get("/{mission_id}", response_model=MissionOut, dependencies=[Depends(get_current_user)])
def get_mission(mission_id: int, db: DB) -> Mission:
    return _get_or_404(mission_id, db)


@router.get(
    "/{mission_id}/references",
    response_model=list[ReferenceRowOut],
    dependencies=[Depends(get_current_user)],
)
def get_mission_references(mission_id: int, db: DB):
    _get_or_404(mission_id, db)
    rows = (
        db.execute(
            select(
                Reference.reference_id,
                Reference.employee_id,
                Reference.role_description,
                Employee.first_name,
                Employee.last_name,
                Employee.profile_image_url,
                Skill.skill_id,
                Skill.skill_name,
            )
            .outerjoin(Employee, Reference.employee_id == Employee.employee_id)
            .join(Skill, Reference.skill_id == Skill.skill_id)
            .where(Reference.mission_id == mission_id)
        )
        .mappings()
        .all()
    )
    return [ReferenceRowOut.model_validate(dict(r)) for r in rows]


@router.patch(
    "/{mission_id}", response_model=MissionOut, dependencies=[Depends(require_role("admin"))]
)
def update_mission(mission_id: int, payload: MissionUpdate, db: DB) -> Mission:
    mission = _get_or_404(mission_id, db)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(mission, key, value)
    db.commit()
    db.refresh(mission)
    return mission


@router.delete(
    "/{mission_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("admin"))],
)
def delete_mission(mission_id: int, db: DB) -> None:
    mission = _get_or_404(mission_id, db)
    db.delete(mission)
    db.commit()
