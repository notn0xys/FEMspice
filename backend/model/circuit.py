from pydantic import BaseModel
from typing import List

from pydantic import BaseModel
from typing import List

class Component(BaseModel):
    type: str         # "R", "V", "C", etc.
    name: str         # "R1", "V1", etc.
    node1: str
    node2: str
    value: float      # resistance in ohms, voltage in volts, etc.
    unit : str       # "ohm", "volt", "farad", etc.
    prefix: str         # "k", "M", "m", "u", etc.

class SimulationRequest(BaseModel):
    components: List[Component]
