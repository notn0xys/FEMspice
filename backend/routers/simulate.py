import datetime
from model.circuit import SimComponent, SimulationRequest, CircuitCreate
from fastapi import APIRouter, HTTPException, status, Depends
import services.simulation as sim
import utils.translation as translate
from typing import Annotated
from model.user import UserPublic
from routers.auth import get_current_user
from bson import ObjectId
from config.db import simulations_collection, users_collection

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

    return {"result": result, 
            "mappings": translation_res['mappings'], 
            'components_mapping': translation_res['components_mapping']}
@router.post("/save", status_code=status.HTTP_201_CREATED)
async def save_circuit(circuit_data: CircuitCreate, current_user: Annotated[UserPublic, Depends(get_current_user)]):
    simulation_doc = circuit_data.model_dump()
    simulation_doc.update({
        "user_id": ObjectId(current_user.id),
        "created_at": datetime.utcnow()
    })

    result = simulations_collection.insert_one(simulation_doc)
    sim_id = result.inserted_id

    users_collection.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$push": {"circuits": {"_id": sim_id, "name": circuit_data.name}}}
    )

    return {"message": "Circuit saved", "circuit_id": str(sim_id)}
    