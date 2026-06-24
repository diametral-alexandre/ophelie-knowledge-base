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
    profile_image_url: str | None = Field(default=None, max_length=500)


class EmployeeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    employee_id: int
    first_name: str
    last_name: str
    email: str
    department: str | None
    hire_date: date | None
    profile_image_url: str | None


class ClientUpdate(BaseModel):
    company_name: str | None = Field(default=None, min_length=1, max_length=100)
    contact_name: str | None = Field(default=None, max_length=100)
    email: str | None = Field(default=None, max_length=100)
    phone: str | None = Field(default=None, max_length=20)
    address: str | None = None
    sector: str | None = Field(default=None, max_length=30)
    logo_url: str | None = Field(default=None, max_length=500)


class ClientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    customer_id: int
    company_name: str
    contact_name: str | None
    email: str | None
    phone: str | None
    address: str | None
    created_at: datetime
    sector: str | None
    logo_url: str | None


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


class EmployeeReferenceOut(BaseModel):
    """Denormalised reference row seen from an employee's profile."""

    model_config = ConfigDict(from_attributes=True)

    reference_id: int
    role_description: str | None
    skill_id: int
    skill_name: str
    mission_id: int
    mission_name: str
    status: str
    start_date: date | None
    end_date: date | None


class ReferenceListOut(BaseModel):
    """Enriched reference row for the list view: employee + mission + client + skill."""

    model_config = ConfigDict(from_attributes=True)

    reference_id: int
    role_description: str | None
    employee_id: int | None
    first_name: str | None
    last_name: str | None
    profile_image_url: str | None
    mission_id: int
    mission_name: str
    status: str
    company_name: str
    skill_name: str


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


class ReferenceRowOut(BaseModel):
    """Denormalised junction row: reference + employee fields + skill name."""

    model_config = ConfigDict(from_attributes=True)

    reference_id: int
    role_description: str | None
    employee_id: int | None
    first_name: str | None
    last_name: str | None
    profile_image_url: str | None
    skill_id: int
    skill_name: str


class UserOut(BaseModel):
    sub: str
    username: str | None
    email: str | None
    first_name: str | None
    last_name: str | None
    roles: list[str]
