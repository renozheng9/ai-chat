from pathlib import Path
from typing import TYPE_CHECKING
 
import motor.motor_asyncio
from motor.core import AgnosticClient
 
 
client: "AgnosticClient" = motor.motor_asyncio.AsyncIOMotorClient("localhost", 27017)
# db_name: str = Path(__file__).parent.parent.name.replace("-", "_")
database = client["test"]
