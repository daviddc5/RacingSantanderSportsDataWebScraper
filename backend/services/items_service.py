import logging
from typing import List, Optional, Dict, Any
from services.db_service import DatabaseService
from models.item import Item, ItemCreate, ItemUpdate

# Set up logger
logger = logging.getLogger(__name__)

class ItemsService:
    def __init__(self, db_service: DatabaseService):
        self.db_service = db_service
        self.table_name = "items"
    
    async def create_item(self, item_data: ItemCreate) -> Dict[str, Any]:
        """Create a new item"""
        try:
            data = item_data.dict()
            result = await self.db_service.create_record(self.table_name, data)
            
            if result["success"]:
                item = Item(**result["data"])
                logger.info(f"Successfully created item: {item.name}")
                return {"success": True, "data": item}
            else:
                logger.warning(f"Failed to create item: {result.get('error', 'Unknown error')}")
                return {"success": False, "error": result.get("error", "Failed to create item")}
        except Exception as e:
            logger.exception("Error in create_item")
            return {"success": False, "error": str(e)}
    
    async def get_item(self, item_id: int) -> Dict[str, Any]:
        """Get an item by ID"""
        try:
            result = await self.db_service.get_record(self.table_name, item_id)
            
            if result["success"]:
                item = Item(**result["data"])
                return {"success": True, "data": item}
            else:
                return {"success": False, "error": result.get("error", "Item not found")}
        except Exception as e:
            logger.exception(f"Error getting item {item_id}")
            return {"success": False, "error": str(e)}
    
    async def get_items(self, skip: int = 0, limit: int = 100) -> Dict[str, Any]:
        """Get all items with pagination"""
        try:
            result = await self.db_service.get_records(
                self.table_name, 
                skip=skip, 
                limit=limit
            )
            
            if result["success"]:
                items = [Item(**item) for item in result["data"]]
                logger.info(f"Retrieved {len(items)} items (skip={skip}, limit={limit})")
                return {
                    "success": True, 
                    "data": items, 
                    "count": result["count"],
                    "skip": skip,
                    "limit": limit
                }
            else:
                return {"success": False, "error": result.get("error", "Failed to retrieve items")}
        except Exception as e:
            logger.exception("Error in get_items")
            return {"success": False, "error": str(e)}
    
    async def get_items_by_name(self, name: str, exact_match: bool = False) -> Dict[str, Any]:
        """Get items by name (exact or partial match)"""
        try:
            if exact_match:
                filters = {"name": name}
            else:
                # Use ilike for case-insensitive partial matching
                filters = {"name": ("ilike", f"%{name}%")}
            
            result = await self.db_service.get_records(self.table_name, filters=filters)
            
            if result["success"]:
                items = [Item(**item) for item in result["data"]]
                logger.info(f"Found {len(items)} items matching name: {name}")
                return {"success": True, "data": items, "count": len(items)}
            else:
                return {"success": False, "error": result.get("error", "Failed to search items")}
        except Exception as e:
            logger.exception(f"Error searching items by name: {name}")
            return {"success": False, "error": str(e)}
    
    async def update_item(self, item_id: int, item_data: ItemUpdate) -> Dict[str, Any]:
        """Update an item"""
        try:
            # Only include fields that are not None
            data = {k: v for k, v in item_data.dict().items() if v is not None}
            if not data:
                return {"success": False, "error": "No data provided for update"}
            
            result = await self.db_service.update_record(self.table_name, item_id, data)
            
            if result["success"]:
                item = Item(**result["data"])
                logger.info(f"Successfully updated item {item_id}: {item.name}")
                return {"success": True, "data": item}
            else:
                return {"success": False, "error": result.get("error", "Failed to update item")}
        except Exception as e:
            logger.exception(f"Error updating item {item_id}")
            return {"success": False, "error": str(e)}
    
    async def delete_item(self, item_id: int) -> Dict[str, Any]:
        """Delete an item"""
        try:
            result = await self.db_service.delete_record(self.table_name, item_id)
            
            if result["success"]:
                logger.info(f"Successfully deleted item {item_id}")
                return {"success": True, "deleted": result["deleted"]}
            else:
                return {"success": False, "error": result.get("error", "Failed to delete item")}
        except Exception as e:
            logger.exception(f"Error deleting item {item_id}")
            return {"success": False, "error": str(e)}
    
    async def get_items_on_offer(self, skip: int = 0, limit: int = 100) -> Dict[str, Any]:
        """Get items that are on offer"""
        try:
            result = await self.db_service.get_records(
                self.table_name, 
                filters={"is_offer": True},
                skip=skip,
                limit=limit
            )
            
            if result["success"]:
                items = [Item(**item) for item in result["data"]]
                logger.info(f"Found {len(items)} items on offer")
                return {"success": True, "data": items, "count": len(items)}
            else:
                return {"success": False, "error": result.get("error", "Failed to retrieve items on offer")}
        except Exception as e:
            logger.exception("Error getting items on offer")
            return {"success": False, "error": str(e)}
    
    async def search_items(self, search_term: str, skip: int = 0, limit: int = 100) -> Dict[str, Any]:
        """Search items by name or description"""
        try:
            # Use ilike for case-insensitive partial matching across multiple fields
            filters = {"name": ("ilike", f"%{search_term}%")}
            
            result = await self.db_service.get_records(
                self.table_name, 
                filters=filters,
                skip=skip,
                limit=limit
            )
            
            if result["success"]:
                items = [Item(**item) for item in result["data"]]
                logger.info(f"Search for '{search_term}' found {len(items)} items")
                return {"success": True, "data": items, "count": len(items)}
            else:
                return {"success": False, "error": result.get("error", "Search failed")}
        except Exception as e:
            logger.exception(f"Error searching items with term: {search_term}")
            return {"success": False, "error": str(e)}
    
    async def get_items_by_price_range(self, min_price: float, max_price: float, skip: int = 0, limit: int = 100) -> Dict[str, Any]:
        """Get items within a price range"""
        try:
            # Use gte and lte for range filtering
            filters = {
                "price": ("gte", min_price),
                # Note: For multiple conditions on the same field, you might need to modify the db_service
                # This is a simplified version - in practice, you'd want to handle multiple conditions better
            }
            
            result = await self.db_service.get_records(
                self.table_name, 
                filters=filters,
                skip=skip,
                limit=limit
            )
            
            if result["success"]:
                # Filter max price in Python for now (could be improved at DB level)
                filtered_items = [item for item in result["data"] if item.get("price", 0) <= max_price]
                items = [Item(**item) for item in filtered_items]
                logger.info(f"Found {len(items)} items in price range ${min_price}-${max_price}")
                return {"success": True, "data": items, "count": len(items)}
            else:
                return {"success": False, "error": result.get("error", "Failed to retrieve items by price range")}
        except Exception as e:
            logger.exception(f"Error getting items by price range: ${min_price}-${max_price}")
            return {"success": False, "error": str(e)}


# Note: Global instance removed - now using dependency injection 