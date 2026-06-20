"""
CRUD = Create, Read, Update, Delete.

This file holds all the actual database work and the business rules:
- SKU and email must be unique.
- Stock can never go negative.
- An order is rejected if stock is insufficient.
- Creating an order reduces stock and the total is calculated here.

Functions raise HTTPException with the correct status code so the routers
stay thin and the API returns proper error messages.
"""

from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app import models, schemas


# --------------------------- Products ---------------------------

def create_product(db: Session, data: schemas.ProductCreate) -> models.Product:
    # Enforce unique SKU before inserting, for a clean 409 error message.
    existing = db.scalar(select(models.Product).where(models.Product.sku == data.sku))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A product with SKU '{data.sku}' already exists.",
        )

    product = models.Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def get_products(db: Session) -> list[models.Product]:
    return list(db.scalars(select(models.Product).order_by(models.Product.id)))


def get_product(db: Session, product_id: int) -> models.Product:
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found.",
        )
    return product


def update_product(
    db: Session, product_id: int, data: schemas.ProductUpdate
) -> models.Product:
    product = get_product(db, product_id)

    # Only the fields the client actually sent are updated.
    updates = data.model_dump(exclude_unset=True)

    # If the SKU is changing, make sure the new one isn't taken.
    new_sku = updates.get("sku")
    if new_sku and new_sku != product.sku:
        clash = db.scalar(select(models.Product).where(models.Product.sku == new_sku))
        if clash:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A product with SKU '{new_sku}' already exists.",
            )

    for field, value in updates.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int) -> None:
    product = get_product(db, product_id)
    db.delete(product)
    db.commit()


# --------------------------- Customers ---------------------------

def create_customer(db: Session, data: schemas.CustomerCreate) -> models.Customer:
    existing = db.scalar(
        select(models.Customer).where(models.Customer.email == data.email)
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A customer with email '{data.email}' already exists.",
        )

    # EmailStr is a special type; store it as a plain string.
    customer = models.Customer(
        full_name=data.full_name, email=str(data.email), phone=data.phone
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


def get_customers(db: Session) -> list[models.Customer]:
    return list(db.scalars(select(models.Customer).order_by(models.Customer.id)))


def get_customer(db: Session, customer_id: int) -> models.Customer:
    customer = db.get(models.Customer, customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id {customer_id} not found.",
        )
    return customer


def delete_customer(db: Session, customer_id: int) -> None:
    customer = get_customer(db, customer_id)
    db.delete(customer)
    db.commit()


# --------------------------- Orders ---------------------------

def _load_order(db: Session, order_id: int) -> models.Order | None:
    """Fetch an order with its items already loaded (avoids extra queries)."""
    return db.scalar(
        select(models.Order)
        .where(models.Order.id == order_id)
        .options(selectinload(models.Order.items))
    )


def create_order(db: Session, data: schemas.OrderCreate) -> models.Order:
    # 1) The customer must exist.
    customer = db.get(models.Customer, data.customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id {data.customer_id} not found.",
        )

    # 2) Merge duplicate product lines (e.g. two lines for the same product)
    #    so stock checks use the true combined quantity.
    requested: dict[int, int] = {}
    for item in data.items:
        requested[item.product_id] = requested.get(item.product_id, 0) + item.quantity

    # 3) Validate every product and that there is enough stock, BEFORE changing
    #    anything. This way an invalid order never half-applies.
    total = Decimal("0")
    order_items: list[models.OrderItem] = []

    for product_id, quantity in requested.items():
        product = db.get(models.Product, product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {product_id} not found.",
            )
        if product.quantity_in_stock < quantity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Insufficient stock for product '{product.name}' "
                    f"(SKU {product.sku}): requested {quantity}, "
                    f"available {product.quantity_in_stock}."
                ),
            )

        line_total = product.price * quantity
        total += line_total
        order_items.append(
            models.OrderItem(
                product_id=product.id,
                quantity=quantity,
                unit_price=product.price,
            )
        )

    # 4) All checks passed — reduce stock and create the order.
    for product_id, quantity in requested.items():
        product = db.get(models.Product, product_id)
        product.quantity_in_stock -= quantity

    order = models.Order(
        customer_id=customer.id,
        total_amount=total,
        items=order_items,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def get_orders(db: Session) -> list[models.Order]:
    return list(
        db.scalars(
            select(models.Order)
            .options(selectinload(models.Order.items))
            .order_by(models.Order.id)
        )
    )


def get_order(db: Session, order_id: int) -> models.Order:
    order = _load_order(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found.",
        )
    return order


def delete_order(db: Session, order_id: int) -> None:
    """
    Delete an order and return its products to stock (so deleting a mistaken
    order restores inventory).
    """
    order = _load_order(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found.",
        )

    for item in order.items:
        product = db.get(models.Product, item.product_id)
        if product:
            product.quantity_in_stock += item.quantity

    db.delete(order)
    db.commit()
