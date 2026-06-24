"""Employees router."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import get_current_user, require_role
from ..database import get_db
from ..models import Employee
from ..schemas import EmployeeOut, EmployeeUpdate

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


@router.patch(
    "/{employee_id}",
    response_model=EmployeeOut,
    dependencies=[Depends(require_role("admin"))],
)
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
