"""Employees router."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import get_current_user, require_role
from ..database import get_db
from ..models import Employee, Mission, Reference, Skill
from ..schemas import EmployeeOut, EmployeeReferenceOut, EmployeeUpdate

router = APIRouter(prefix="/api/employees", tags=["employees"])

DB = Annotated[Session, Depends(get_db)]


def _get_or_404(employee_id: int, db: Session) -> Employee:
    employee = db.get(Employee, employee_id)
    if employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return employee


@router.get("", response_model=list[EmployeeOut], dependencies=[Depends(get_current_user)])
def list_employees(db: DB) -> list[Employee]:
    return db.query(Employee).order_by(Employee.last_name, Employee.first_name).all()


@router.get("/{employee_id}", response_model=EmployeeOut, dependencies=[Depends(get_current_user)])
def get_employee(employee_id: int, db: DB) -> Employee:
    return _get_or_404(employee_id, db)


@router.get("/{employee_id}/references", response_model=list[EmployeeReferenceOut], dependencies=[Depends(get_current_user)])
def get_employee_references(employee_id: int, db: DB):
    _get_or_404(employee_id, db)
    rows = db.execute(
        select(
            Reference.reference_id,
            Reference.role_description,
            Skill.skill_id,
            Skill.skill_name,
            Mission.mission_id,
            Mission.mission_name,
            Mission.status,
            Mission.start_date,
            Mission.end_date,
        )
        .join(Mission, Reference.mission_id == Mission.mission_id)
        .join(Skill, Reference.skill_id == Skill.skill_id)
        .where(Reference.employee_id == employee_id)
        .order_by(Mission.mission_id)
    ).mappings().all()
    return [EmployeeReferenceOut.model_validate(dict(r)) for r in rows]


@router.patch("/{employee_id}", response_model=EmployeeOut, dependencies=[Depends(require_role("admin"))])
def update_employee(employee_id: int, payload: EmployeeUpdate, db: DB) -> Employee:
    employee = _get_or_404(employee_id, db)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(employee, key, value)
    db.commit()
    db.refresh(employee)
    return employee


@router.delete(
    "/{employee_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("admin"))],
)
def delete_employee(employee_id: int, db: DB) -> None:
    employee = _get_or_404(employee_id, db)
    db.delete(employee)
    db.commit()
