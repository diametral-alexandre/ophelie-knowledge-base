"""Pydantic request/response models."""

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class ItemCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = ""


class ItemUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    done: bool | None = None


class ItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    done: bool
    owner_sub: str
    owner_name: str | None
    created_at: datetime


class EmployeeUpdate(BaseModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=50)
    last_name: str | None = Field(default=None, min_length=1, max_length=50)
    email: str | None = Field(default=None, min_length=1, max_length=100)
    department: str | None = None
    hire_date: date | None = None


class EmployeeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    employee_id: int
    first_name: str
    last_name: str
    email: str
    department: str | None
    hire_date: date | None


class MissionUpdate(BaseModel):
    mission_name: str | None = Field(default=None, min_length=1, max_length=150)
    description: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: str | None = Field(default=None, max_length=20)


class MissionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    mission_id: int
    customer_id: int
    mission_name: str
    description: str | None
    start_date: date | None
    end_date: date | None
    status: str


class ReferenceUpdate(BaseModel):
    employee_id: int | None = None
    mission_id: int | None = None
    skill_id: int | None = None
    role_description: str | None = None


class ReferenceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    reference_id: int
    employee_id: int | None
    mission_id: int
    skill_id: int
    role_description: str | None


class UserOut(BaseModel):
    sub: str
    username: str | None
    email: str | None
    first_name: str | None
    last_name: str | None
    roles: list[str]
