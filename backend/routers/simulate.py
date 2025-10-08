from model.circuit import Component, SimulationRequest
from fastapi import APIRouter, HTTPException, status
import services.simulation as sim

router = APIRouter(
    prefix="/simulate",
    tags=["simulate"],
)

@router.post("/", status_code=status.HTTP_200_OK)
async def simulate_circuit(sim_request: SimulationRequest):
    try:
        result = sim.build_and_simulate(sim_request.components)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))