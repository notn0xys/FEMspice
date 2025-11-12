import datetime
from model.circuit import SimComponent, SimulationRequest, CircuitCreate
from fastapi import APIRouter, HTTPException, Response, status, Depends
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


# @router.post("/DC", status_code=status.HTTP_200_OK)
# async def simulate_circuit(sim_request: SimulationRequest):
#     if sim_request.mode.lower() == "dc":
#         try:
#             translation_res = translate.convert_frontend_to_netlist(sim_request)
#             result = sim.build_and_simulate_DC(translation_res["components"])
#             return {"result": result, 
#                 "mappings": translation_res['mappings'], 
#                 'components_mapping': translation_res['components_mapping']}
#         except ValueError as ve:
#             raise HTTPException(status_code=400, detail=str(ve))
#     elif sim_request.mode.lower() == "transient":
#         try:
#             translation_res = translate.convert_frontend_to_netlist(sim_request)
#             result = sim.build_and_simulate_transient(
#                 translation_res["components"],
#                 sim_request.step_time,
#                 sim_request.end_time
#             )
#             return {"result": result}
#         except ValueError as ve:
#             raise HTTPException(status_code=400, detail=str(ve))
#     else:
#         raise HTTPException(status_code=400, detail="Unsupported simulation mode")

@router.post("/transcient", status_code=status.HTTP_200_OK)
async def transient(frontend_data: dict):
    try:
        translation_res = translate.convert_frontend_to_netlist(frontend_data)
        result = sim.build_and_simulate_transient(
            translation_res["components"],
            frontend_data.get("step_time", 50e-6),
            frontend_data.get("end_time", 30e-3)
        )
        return Response(content=result, media_type="image/png")
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.post("/test", status_code=status.HTTP_200_OK)
async def test_endpoint(frontend_data: dict):
    try:
        translation_res = translate.convert_frontend_to_netlist(frontend_data)
        result = sim.build_and_simulate_DC(translation_res["components"])
        return {"result": result, 
                "mappings": translation_res['mappings'], 
                'components_mapping': translation_res['components_mapping']}
    
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    
@router.post("/save", status_code=status.HTTP_201_CREATED)
async def save_circuit(circuit_data: CircuitCreate, current_user: Annotated[UserPublic, Depends(get_current_user)]):
    simulation_doc = circuit_data.model_dump()
    simulation_doc.update({
        "user_id": ObjectId(current_user["id"]),
        "created_at": datetime.datetime.utcnow()
    })

    result = simulations_collection.insert_one(simulation_doc)
    sim_id = result.inserted_id

    users_collection.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$push": {"circuits": {"_id": sim_id, "name": circuit_data.name, "description": simulation_doc.get("description", "")}}}
    )

    return {"message": "Circuit saved", "circuit_id": str(sim_id)}

@router.get("/list", status_code=status.HTTP_200_OK)
async def list_circuits(current_user: Annotated[UserPublic, Depends(get_current_user)]):
    user_id = ObjectId(current_user["id"])
    simulations = simulations_collection.find({"user_id": user_id})

    circuit_list = []
    for sim_doc in simulations:
        circuit_list.append({
            "id": str(sim_doc["_id"]),
            "name": sim_doc["name"],
            "description": sim_doc.get("description", ""),
            "created_at": sim_doc["created_at"]
        })

    return {"circuits": circuit_list}


@router.get("/load/{circuit_id}", status_code=status.HTTP_200_OK)
async def load_circuit(circuit_id: str, current_user: Annotated[UserPublic, Depends(get_current_user)]):
    simulation_doc = simulations_collection.find_one({"_id": ObjectId(circuit_id), "user_id": ObjectId(current_user["id"])})

    if not simulation_doc:
        raise HTTPException(status_code=404, detail="Circuit not found")

    simulation_doc["id"] = str(simulation_doc["_id"])
    del simulation_doc["_id"]
    del simulation_doc["user_id"]
    del simulation_doc["created_at"]

    return simulation_doc
    


@router.delete("/delete/{circuit_id}", status_code=status.HTTP_200_OK)
async def delete_circuit(
    circuit_id: str,
    current_user: Annotated[UserPublic, Depends(get_current_user)]
):
    try:
        circuit_obj_id = ObjectId(circuit_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid circuit ID")

    circuit = simulations_collection.find_one({
        "_id": circuit_obj_id,
        "user_id": ObjectId(current_user["id"])
    })

    if not circuit:
        raise HTTPException(status_code=404, detail="Circuit not found or not owned by user")

    simulations_collection.delete_one({"_id": circuit_obj_id})

    users_collection.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$pull": {"circuits": {"_id": circuit_obj_id}}}
    )

    return {"message": "Circuit deleted successfully", "circuit_id": circuit_id}
