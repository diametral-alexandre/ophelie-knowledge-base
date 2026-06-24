"""Clients router."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import get_current_user, require_role
from ..database import get_db
from ..models import Client
from ..schemas import ClientOut, ClientUpdate

router = APIRouter(prefix="/api/clients", tags=["clients"])

DB = Annotated[Session, Depends(get_db)]


def _get_or_404(client_id: int, db: Session) -> Client:
    client = db.get(Client, client_id)
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    return client


@router.get("", response_model=list[ClientOut], dependencies=[Depends(get_current_user)])
def list_clients(db: DB) -> list[Client]:
    return db.query(Client).order_by(Client.company_name).all()


@router.get("/{client_id}", response_model=ClientOut, dependencies=[Depends(get_current_user)])
def get_client(client_id: int, db: DB) -> Client:
    return _get_or_404(client_id, db)


@router.patch("/{client_id}", response_model=ClientOut, dependencies=[Depends(require_role("admin"))])
def update_client(client_id: int, payload: ClientUpdate, db: DB) -> Client:
    client = _get_or_404(client_id, db)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(client, key, value)
    db.commit()
    db.refresh(client)
    return client


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_role("admin"))])
def delete_client(client_id: int, db: DB) -> None:
    client = _get_or_404(client_id, db)
    db.delete(client)
    db.commit()
