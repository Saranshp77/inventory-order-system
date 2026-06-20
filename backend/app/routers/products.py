"""
Product endpoints.

Each function maps an HTTP method + URL to a piece of logic in crud.py.
The decorators also declare the response shape and status codes, which is
what makes the /docs page so detailed.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/products", tags=["Products"])


@router.post(
    "",
    response_model=schemas.ProductOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a product",
)
def create_product(payload: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db, payload)


@router.get("", response_model=list[schemas.ProductOut], summary="List all products")
def list_products(db: Session = Depends(get_db)):
    return crud.get_products(db)


@router.get("/{product_id}", response_model=schemas.ProductOut, summary="Get one product")
def get_product(product_id: int, db: Session = Depends(get_db)):
    return crud.get_product(db, product_id)


@router.put("/{product_id}", response_model=schemas.ProductOut, summary="Update a product")
def update_product(
    product_id: int, payload: schemas.ProductUpdate, db: Session = Depends(get_db)
):
    return crud.update_product(db, product_id, payload)


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a product",
)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    crud.delete_product(db, product_id)
