import PySpice
import PySpice.Logging.Logging as Logging
from PySpice.Spice.Netlist import Circuit, SubCircuit
from PySpice.Unit import *
import matplotlib.pyplot as plt


logger = Logging.setup_logging()

circuit = Circuit('Resistor Bridge')

circuit.V('input', 1, circuit.gnd, 10@u_V)
circuit.R(1, 1, 2, 2@u_kΩ)
circuit.R(2, 1, 3, 1@u_kΩ)
circuit.R(3, 2, circuit.gnd, 1@u_kΩ)
circuit.R(4, 3, circuit.gnd, 2@u_kΩ)
circuit.R(5, 3, 2, 2@u_kΩ)

simulator = circuit.simulator(temperature=25, nominal_temperature=25)
analysis = simulator.operating_point()

for node in analysis.nodes.values():
    print('Node {}: {:4.1f} V'.format(str(node), node.item()))
    # fuck you



# # Mapping unit strings to PySpice unit objects
# import PySpice.Unit as Unit
# unit_map = {
#     "ohm": Unit.u_Ohm,
#     "volt": Unit.u_V,
#     "farad": Unit.u_F,
#     "henry": Unit.u_H,
#     "ampere": Unit.u_A
# }

# # Mapping prefixes to multipliers
# prefix_map = {
#     "p": 1e-12,
#     "n": 1e-9,
#     "u": 1e-6,
#     "m": 1e-3,
#     "": 1,
#     "k": 1e3,
#     "M": 1e6,
#     "G": 1e9
# }

# def convert_to_pyspice(value: float, prefix: str, unit_type: str):
#     prefix = prefix or ""
#     unit_type = unit_type.lower()
    
#     if unit_type not in unit_map:
#         raise ValueError(f"Unsupported unit: {unit_type}")
#     if prefix not in prefix_map:
#         raise ValueError(f"Unsupported prefix: {prefix}")
    
#     factor = prefix_map[prefix]
#     unit_constructor = unit_map[unit_type]
    

#     return (value * factor) @ unit_constructor

# resistor_value = convert_to_pyspice(1, "k", "ohm")  # 1 kΩ
# voltage_value = convert_to_pyspice(5, "", "volt")   # 5 V
# capacitor_value = convert_to_pyspice(10, "u", "farad")  # 10 μF

# print(resistor_value, voltage_value, capacitor_value)
