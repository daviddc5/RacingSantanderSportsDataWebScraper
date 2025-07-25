import asyncio
import logging
from typing import Dict, List, Optional, Any, Tuple, Union
from supabase import create_client, Client
from config import settings

# Set up logger
logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        self.supabase: Client = create_client(
            settings.supabase_url,
            settings.supabase_key
        )
    
    async def _execute_sync(self, func):
        """Execute synchronous Supabase operations in thread pool"""
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, func)
    
    async def create_record(self, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new record in the specified table"""
        try:
            def _create():
                response = self.supabase.table(table).insert(data).execute()
                return response.data[0] if response.data else None
            
            result = await self._execute_sync(_create)
            if result:
                logger.info(f"Created record in {table} with ID: {result.get('id', 'unknown')}")
                return {"success": True, "data": result}
            else:
                logger.warning(f"Failed to create record in {table} - no data returned")
                return {"success": False, "error": "No data returned from insert"}
        except Exception as e:
            logger.exception(f"Error creating record in {table}")
            return {"success": False, "error": str(e)}
    
    async def get_record(self, table: str, record_id: int) -> Dict[str, Any]:
        """Get a single record by ID"""
        try:
            def _get():
                response = self.supabase.table(table).select("*").eq("id", record_id).execute()
                return response.data[0] if response.data else None
            
            result = await self._execute_sync(_get)
            if result:
                return {"success": True, "data": result}
            else:
                return {"success": False, "error": "Record not found"}
        except Exception as e:
            logger.exception(f"Error getting record from {table}")
            return {"success": False, "error": str(e)}
    
    async def get_records(
        self, 
        table: str, 
        filters: Optional[Dict[str, Union[Any, Tuple[str, Any]]]] = None,
        skip: int = 0,
        limit: int = 100
    ) -> Dict[str, Any]:
        """Get multiple records with optional filters and pagination"""
        try:
            def _get_records():
                query = self.supabase.table(table).select("*")
                
                if filters:
                    for key, value in filters.items():
                        if isinstance(value, tuple) and len(value) == 2:
                            # Handle operator filters like ("ilike", "%search%")
                            operator, filter_value = value
                            query = getattr(query, operator)(key, filter_value)
                        else:
                            # Handle simple equality filters
                            query = query.eq(key, value)
                
                # Apply pagination at database level
                query = query.range(skip, skip + limit - 1)
                
                response = query.execute()
                return response.data or []
            
            results = await self._execute_sync(_get_records)
            logger.info(f"Retrieved {len(results)} records from {table}")
            return {"success": True, "data": results, "count": len(results)}
        except Exception as e:
            logger.exception(f"Error getting records from {table}")
            return {"success": False, "error": str(e), "data": []}
    
    async def update_record(self, table: str, record_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a record by ID"""
        try:
            def _update():
                response = self.supabase.table(table).update(data).eq("id", record_id).execute()
                return response.data[0] if response.data else None
            
            result = await self._execute_sync(_update)
            if result:
                logger.info(f"Updated record {record_id} in {table}")
                return {"success": True, "data": result}
            else:
                logger.warning(f"Failed to update record {record_id} in {table} - no data returned")
                return {"success": False, "error": "Record not found or no changes made"}
        except Exception as e:
            logger.exception(f"Error updating record in {table}")
            return {"success": False, "error": str(e)}
    
    async def delete_record(self, table: str, record_id: int) -> Dict[str, Any]:
        """Delete a record by ID"""
        try:
            def _delete():
                response = self.supabase.table(table).delete().eq("id", record_id).execute()
                return response.data
            
            result = await self._execute_sync(_delete)
            if result:
                logger.info(f"Deleted record {record_id} from {table}")
                return {"success": True, "deleted": len(result)}
            else:
                logger.warning(f"Failed to delete record {record_id} from {table} - record not found")
                return {"success": False, "error": "Record not found"}
        except Exception as e:
            logger.exception(f"Error deleting record from {table}")
            return {"success": False, "error": str(e)}


# Note: Global instance removed - now using dependency injection 