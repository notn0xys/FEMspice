from model.circuit import Component, SimulationRequest
from fastapi import APIRouter, HTTPException, status
import services.simulation as sim
import utils.translation as translate

router = APIRouter(
    prefix="/simulate",
    tags=["simulate"],
)

@router.post("/DC", status_code=status.HTTP_200_OK)
async def simulate_circuit(sim_request: SimulationRequest):
    try:
        if sim_request.mode.lower() == "dc":
            result = sim.build_and_simulate_DC(sim_request.components)
            return {"result": result}
        else:
            raise HTTPException(status_code=400, detail="Unsupported simulation mode")

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/test", status_code=status.HTTP_200_OK)
async def test_endpoint(frontend_data: dict):
    translation_res = translate.convert_frontend_to_netlist(frontend_data)
    result = sim.build_and_simulate_DC(translation_res["components"])

    return {"result": result, "mappings": translation_res['mappings'], "temp": translation_res['components']}