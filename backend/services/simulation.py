import PySpice
import PySpice.Logging.Logging as Logging
from PySpice.Spice.Netlist import Circuit, SubCircuit
import PySpice.Unit as Unit

unit_map = {
    "ohm": Unit.u_Ohm,
    "volt": Unit.u_V,
    "farad": Unit.u_F,
    "henry": Unit.u_H,
    "ampere": Unit.u_A
}

prefix_map = {
    "p": 1e-12,
    "n": 1e-9,
    "u": 1e-6,
    "m": 1e-3,
    "": 1,
    "k": 1e3,
    "M": 1e6,
    "G": 1e9
}

def convert_to_pyspice(value: float, prefix: str, unit_type: str):
    prefix = prefix or ""
    unit_type = unit_type.lower()
    
    if unit_type not in unit_map:
        raise ValueError(f"Unsupported unit: {unit_type}")
    if prefix not in prefix_map:
        raise ValueError(f"Unsupported prefix: {prefix}")
    
    factor = prefix_map[prefix]
    unit_constructor = unit_map[unit_type]
    

    return (value * factor) @ unit_constructor

def build_and_simulate(components):
    logger = Logging.setup_logging()
    circuit = Circuit('Generated Circuit')

    for comp in components:
        value_with_unit = convert_to_pyspice(comp.value, comp.prefix, comp.unit)
        if comp.type == "R":
            circuit.R(comp.name, comp.node1, comp.node2, value_with_unit)
        elif comp.type == "V":
            circuit.V(comp.name, comp.node1, comp.node2, value_with_unit)
        elif comp.type == "C":
            circuit.C(comp.name, comp.node1, comp.node2, value_with_unit)
        elif comp.type == "L":
            circuit.L(comp.name, comp.node1, comp.node2, value_with_unit)
        elif comp.type == "I":
            circuit.I(comp.name, comp.node1, comp.node2, value_with_unit)
        else:
            raise ValueError(f"Unsupported component type: {comp.type}")

    simulator = circuit.simulator(temperature=25, nominal_temperature=25)
    analysis = simulator.operating_point()

    results = {}
    for node in analysis.nodes.values():
        results[str(node)] = float(node.item())

    return results