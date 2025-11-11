from pydantic import BaseModel
from typing import List, Optional, Tuple


class Component(BaseModel):
    type: str         # "R", "V", "C", etc.
    name: str         # "R1", "V1", etc.
    node1: str
    node2: str
    value: float      # resistance in ohms, voltage in volts, etc.
    unit : str       # "ohm", "volt", "farad", etc.
    prefix: str         # "k", "M", "m", "u", etc.
    
    ## Optional parameters
    initial_value: Tuple[float, str, str] = None
    pulse_value: float = None
    pulse_width: float = None
    period: float = None



class SimulationRequest(BaseModel):
    mode: str
    components: List[Component]
    step_time: Optional[float] = 50e-6
    end_time: Optional[float] = 30e-3




