"""Restaurant tables: list, create, get, update, delete."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, require_restaurant
from app.models.restaurant_table import RestaurantTable
from app.models.user import User
from app.schemas.table import TableCreate, TableRead, TableUpdate

router = APIRouter(prefix="/tables", tags=["tables"])


@router.get("", response_model=list[TableRead])
async def list_tables(
    db: Annotated[AsyncSession, Depends(get_db)],
    restaurant_id: Annotated[UUID, Depends(require_restaurant)],
    user: Annotated[User, Depends(get_current_user)],
) -> list[TableRead]:
    """List tables of current restaurant."""
    result = await db.execute(
        select(RestaurantTable)
        .where(RestaurantTable.restaurant_id == restaurant_id)
        .order_by(RestaurantTable.sort_order, RestaurantTable.name)
    )
    rows = result.scalars().all()
    return [TableRead.model_validate(r) for r in rows]


@router.get("/{table_id}", response_model=TableRead)
async def get_table(
    table_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    restaurant_id: Annotated[UUID, Depends(require_restaurant)],
    user: Annotated[User, Depends(get_current_user)],
) -> TableRead:
    """Get table by id."""
    result = await db.execute(
        select(RestaurantTable).where(
            RestaurantTable.id == table_id,
            RestaurantTable.restaurant_id == restaurant_id,
        )
    )
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table not found")
    return TableRead.model_validate(row)


@router.post("", response_model=TableRead, status_code=status.HTTP_201_CREATED)
async def create_table(
    body: TableCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    restaurant_id: Annotated[UUID, Depends(require_restaurant)],
    user: Annotated[User, Depends(get_current_user)],
) -> TableRead:
    """Create table."""
    table = RestaurantTable(
        restaurant_id=restaurant_id,
        name=body.name,
        capacity=body.capacity,
        sort_order=body.sort_order,
    )
    db.add(table)
    await db.flush()
    await db.refresh(table)
    return TableRead.model_validate(table)


@router.patch("/{table_id}", response_model=TableRead)
async def update_table(
    table_id: UUID,
    body: TableUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    restaurant_id: Annotated[UUID, Depends(require_restaurant)],
    user: Annotated[User, Depends(get_current_user)],
) -> TableRead:
    """Update table."""
    result = await db.execute(
        select(RestaurantTable).where(
            RestaurantTable.id == table_id,
            RestaurantTable.restaurant_id == restaurant_id,
        )
    )
    table = result.scalar_one_or_none()
    if not table:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table not found")
    if body.name is not None:
        table.name = body.name
    if body.capacity is not None:
        table.capacity = body.capacity
    if body.sort_order is not None:
        table.sort_order = body.sort_order
    await db.flush()
    await db.refresh(table)
    return TableRead.model_validate(table)


@router.delete("/{table_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_table(
    table_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    restaurant_id: Annotated[UUID, Depends(require_restaurant)],
    user: Annotated[User, Depends(get_current_user)],
) -> None:
    """Delete table."""
    result = await db.execute(
        select(RestaurantTable).where(
            RestaurantTable.id == table_id,
            RestaurantTable.restaurant_id == restaurant_id,
        )
    )
    table = result.scalar_one_or_none()
    if not table:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table not found")
    await db.delete(table)
    await db.flush()
