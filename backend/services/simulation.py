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

def build_and_simulate_DC(components):
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

    component_currents = {}
    for comp in components:
        if comp.type == "R":
            # node voltages
            V1 = results.get(str(comp.node1).lower(), 0.0)
            V2 = results.get(str(comp.node2).lower(), 0.0)
            # resistor value in ohms
            R_value = comp.value * prefix_map.get(comp.prefix or "", 1)
            if R_value == 0:
                I = 0.0
            else:
                I = (V1 - V2) / R_value
            component_currents[comp.name] = I  # positive = node1 → node2

        elif comp.type == "V":
            try:
                I = -float(analysis.branches["v" + comp.name][0])
            except Exception:
                I = None
            component_currents[comp.name] = I
        elif comp.type == "I":
        # Current source: value already given by user 
            I = comp.value * prefix_map.get(comp.prefix or "", 1)
            component_currents[comp.name] = I

        elif comp.type in ("C", "L"):
            # For DC operating point:
            # - Capacitors = open circuit → 0 A
            # - Inductors = short circuit → branch current if exists
            if comp.type == "C":
                I = 0.0
            else:  # L
                try:
                    I = float(analysis.branches[comp.name][0])
                except Exception:
                    I = None
            component_currents[comp.name] = I

    return {"node_voltages": results, "component_currents": component_currents}

def build_and_simulate_transient(components, step_time, end_time):
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
        elif comp.type=="PV": ## pulse voltage source
            initial_value = convert_to_pyspice(comp.initial_value[0], comp.initial_value[1], comp.initial_value[2])
            pulse_value = convert_to_pyspice(comp.pulse_value, "", "volt")
            circuit.PulseVoltageSource(comp.name, 
                                        comp.node1,
                                        comp.node2, 
                                        initial_value, 
                                        pulse_value, 
                                        pulse_width=comp.pulse_width@Unit.u_s, 
                                        period=comp.period@Unit.u_s)
            
        else:
            raise ValueError(f"Unsupported component type: {comp.type}")
        
    simulator = circuit.simulator(temperature=25, nominal_temperature=25)

    # ---- Run transient analysis ----
    step_time_val = step_time @ Unit.u_s
    end_time_val = end_time @ Unit.u_s
    analysis = simulator.transient(step_time=step_time_val, end_time=end_time_val)
    
    print(len(analysis.time))
    # ---- Extract results ----
    time_data = [float(t) for t in analysis.time]
    node_voltages = {}

    # Extract voltage for each node
    for node in circuit.node_names:
        if node == '0':  # skip ground
            continue
        try:
            node_voltages[node] = [float(v) for v in analysis[node]]
        except KeyError:
            logger.warning(f"Node {node} not found in analysis results.")

    # ---- Prepare frontend payload ----
    result = {
        "time": time_data,
        "voltages": node_voltages,
        "metadata": {
            "step_time_us": step_time,
            "end_time_us": end_time,
            "num_points": len(time_data),
        },
    }

    return result