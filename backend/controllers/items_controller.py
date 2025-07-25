"""
Items controller for managing item resources.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status, Request
from fastapi.responses import JSONResponse

from models import Item, ItemCreate, ItemUpdate
from dependencies import ItemsServiceDep

items_router = APIRouter(
    prefix="/items",
    tags=["items"],
    responses={
        404: {"description": "Item not found"},
        500: {"description": "Internal server error"},
    }
)


def _get_request_id(request: Request) -> str:
    """Extract request ID from headers for traceability."""
    return request.headers.get("X-Request-ID", "unknown")


def _create_error_response(request: Request, status_code: int, detail: str) -> JSONResponse:
    """Create standardized error response with request ID."""
    request_id = _get_request_id(request)
    return JSONResponse(
        status_code=status_code,
        content={
            "detail": detail,
            "request_id": request_id,
            "status_code": status_code
        }
    )


@items_router.get("/", response_model=Dict[str, Any])
async def get_items(
    request: Request,
    items_service: ItemsServiceDep,
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of items to return")
):
    """
    Get all items with pagination.
    
    - **skip**: Number of items to skip (for pagination)
    - **limit**: Maximum number of items to return (1-1000)
    """
    try:
        result = await items_service.get_items(skip=skip, limit=limit)
        if result["success"]:
            return {
                "success": True,
                "data": result["data"],
                "count": result["count"],
                "pagination": {
                    "skip": result["skip"],
                    "limit": result["limit"]
                }
            }
        else:
            return _create_error_response(
                request, 
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                result.get("error", "Failed to fetch items")
            )
    except Exception as e:
        return _create_error_response(
            request,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Failed to fetch items"
        )


@items_router.get("/{item_id}", response_model=Dict[str, Any])
async def get_item(request: Request, items_service: ItemsServiceDep, item_id: int):
    """
    Get a specific item by ID.
    
    - **item_id**: The ID of the item to retrieve
    """
    try:
        result = await items_service.get_item(item_id)
        if result["success"]:
            return {"success": True, "data": result["data"]}
        else:
            return _create_error_response(
                request,
                status.HTTP_404_NOT_FOUND,
                f"Item with ID {item_id} not found"
            )
    except Exception as e:
        return _create_error_response(
            request,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Failed to fetch item"
        )


@items_router.post("/", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_item(request: Request, items_service: ItemsServiceDep, item: ItemCreate):
    """
    Create a new item.
    
    - **name**: Item name (1-100 characters)
    - **price**: Item price (must be greater than 0)
    - **is_offer**: Whether the item is on offer (optional, defaults to False)
    """
    try:
        result = await items_service.create_item(item)
        if result["success"]:
            return {"success": True, "data": result["data"]}
        else:
            return _create_error_response(
                request,
                status.HTTP_400_BAD_REQUEST,
                result.get("error", "Failed to create item")
            )
    except Exception as e:
        return _create_error_response(
            request,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Failed to create item"
        )


@items_router.put("/{item_id}", response_model=Dict[str, Any])
async def update_item(request: Request, items_service: ItemsServiceDep, item_id: int, item: ItemUpdate):
    """
    Update an existing item.
    
    - **item_id**: The ID of the item to update
    - **name**: New item name (optional)
    - **price**: New item price (optional)
    - **is_offer**: New offer status (optional)
    """
    try:
        # Check if item exists
        existing_result = await items_service.get_item(item_id)
        if not existing_result["success"]:
            return _create_error_response(
                request,
                status.HTTP_404_NOT_FOUND,
                f"Item with ID {item_id} not found"
            )
        
        result = await items_service.update_item(item_id, item)
        if result["success"]:
            return {"success": True, "data": result["data"]}
        else:
            return _create_error_response(
                request,
                status.HTTP_400_BAD_REQUEST,
                result.get("error", "Failed to update item")
            )
    except Exception as e:
        return _create_error_response(
            request,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Failed to update item"
        )


@items_router.delete("/{item_id}", response_model=Dict[str, Any])
async def delete_item(request: Request, items_service: ItemsServiceDep, item_id: int):
    """
    Delete an item.
    
    - **item_id**: The ID of the item to delete
    """
    try:
        # Check if item exists
        existing_result = await items_service.get_item(item_id)
        if not existing_result["success"]:
            return _create_error_response(
                request,
                status.HTTP_404_NOT_FOUND,
                f"Item with ID {item_id} not found"
            )
        
        result = await items_service.delete_item(item_id)
        if result["success"]:
            return {"success": True, "deleted": result["deleted"]}
        else:
            return _create_error_response(
                request,
                status.HTTP_400_BAD_REQUEST,
                result.get("error", "Failed to delete item")
            )
    except Exception as e:
        return _create_error_response(
            request,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Failed to delete item"
        )


# Search endpoints
@items_router.get("/search/offers", response_model=Dict[str, Any])
async def get_items_on_offer(
    request: Request,
    items_service: ItemsServiceDep,
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of items to return")
):
    """
    Get all items that are currently on offer.
    """
    try:
        result = await items_service.get_items_on_offer(skip=skip, limit=limit)
        if result["success"]:
            return {
                "success": True,
                "data": result["data"],
                "count": result["count"]
            }
        else:
            return _create_error_response(
                request,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                result.get("error", "Failed to fetch items on offer")
            )
    except Exception as e:
        return _create_error_response(
            request,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Failed to fetch items on offer"
        )


@items_router.get("/search/name/{name}", response_model=Dict[str, Any])
async def get_items_by_name(request: Request, items_service: ItemsServiceDep, name: str):
    """
    Get items by name (partial match).
    
    - **name**: The name to search for
    """
    try:
        result = await items_service.get_items_by_name(name, exact_match=False)
        if result["success"]:
            return {
                "success": True,
                "data": result["data"],
                "count": result["count"]
            }
        else:
            return _create_error_response(
                request,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                result.get("error", "Failed to fetch items by name")
            )
    except Exception as e:
        return _create_error_response(
            request,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Failed to fetch items by name"
        )


@items_router.get("/search/", response_model=Dict[str, Any])
async def search_items(
    request: Request,
    items_service: ItemsServiceDep,
    q: str = Query(..., description="Search term"),
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of items to return")
):
    """
    Search items by name or description.
    
    - **q**: Search term
    - **skip**: Number of items to skip (for pagination)
    - **limit**: Maximum number of items to return (1-1000)
    """
    try:
        result = await items_service.search_items(q, skip=skip, limit=limit)
        if result["success"]:
            return {
                "success": True,
                "data": result["data"],
                "count": result["count"],
                "search_term": q
            }
        else:
            return _create_error_response(
                request,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                result.get("error", "Search failed")
            )
    except Exception as e:
        return _create_error_response(
            request,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Search failed"
        )


@items_router.get("/search/price-range/", response_model=Dict[str, Any])
async def get_items_by_price_range(
    request: Request,
    items_service: ItemsServiceDep,
    min_price: float = Query(..., ge=0, description="Minimum price"),
    max_price: float = Query(..., ge=0, description="Maximum price"),
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of items to return")
):
    """
    Get items within a price range.
    
    - **min_price**: Minimum price (inclusive)
    - **max_price**: Maximum price (inclusive)
    - **skip**: Number of items to skip (for pagination)
    - **limit**: Maximum number of items to return (1-1000)
    """
    try:
        if min_price > max_price:
            return _create_error_response(
                request,
                status.HTTP_400_BAD_REQUEST,
                "Minimum price cannot be greater than maximum price"
            )
        
        result = await items_service.get_items_by_price_range(
            min_price, max_price, skip=skip, limit=limit
        )
        if result["success"]:
            return {
                "success": True,
                "data": result["data"],
                "count": result["count"],
                "price_range": {
                    "min_price": min_price,
                    "max_price": max_price
                }
            }
        else:
            return _create_error_response(
                request,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                result.get("error", "Failed to fetch items by price range")
            )
    except Exception as e:
        return _create_error_response(
            request,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Failed to fetch items by price range"
        ) 