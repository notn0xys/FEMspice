from pydantic import BaseModel
from typing import List, Optional, Tuple, Dict

class SimComponent(BaseModel):
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
    components: List[SimComponent]
    step_time: Optional[float] = 50e-6
    end_time: Optional[float] = 30e-3


## Saving circuit model


class ComponentJSON(BaseModel):
    id: str
    type: str
    x: float
    y: float
    rotation: float
    value: Optional[float] = None
    title: str
    connections: Dict[str, List[str]]

class WireEnd(BaseModel):
    componentId: str
    pinId: str

class Wire(BaseModel):
    id: str
    from_: WireEnd   # `from` is reserved in Python, use `from_`
    to: WireEnd
    points: List[float]
    color: str

class CircuitCreate(BaseModel):
    name: str
    description: Optional[str] = None
    components: List[ComponentJSON]
    wires: List[Wire]




