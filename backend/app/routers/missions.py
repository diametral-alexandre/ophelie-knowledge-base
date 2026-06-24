"""Missions router."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import get_current_user, require_role
from ..database import get_db
from ..models import Mission
from ..schemas import MissionOut, MissionUpdate

router = APIRouter(prefix="/api/missions", tags=["missions"])

DB = Annotated[Session, Depends(get_db)]


def _get_or_404(mission_id: int, db: Session) -> Mission:
    mission = db.get(Mission, mission_id)
    if mission is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mission not found")
    return mission


@router.get("", response_model=list[MissionOut], dependencies=[Depends(get_current_user)])
def list_missions(db: DB) -> list[Mission]:
    return db.query(Mission).order_by(Mission.mission_id).all()


@router.patch("/{mission_id}", response_model=MissionOut, dependencies=[Depends(require_role("admin"))])
def update_mission(mission_id: int, payload: MissionUpdate, db: DB) -> Mission:
    mission = _get_or_404(mission_id, db)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(mission, key, value)
    db.commit()
    db.refresh(mission)
    return mission


@router.delete("/{mission_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_role("admin"))])
def delete_mission(mission_id: int, db: DB) -> None:
    mission = _get_or_404(mission_id, db)
    db.delete(mission)
    db.commit()
