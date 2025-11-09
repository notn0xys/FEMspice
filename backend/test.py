import PySpice
import PySpice.Logging.Logging as Logging
from PySpice.Spice.Netlist import Circuit, SubCircuit
from PySpice.Unit import *
import matplotlib.pyplot as plt


logger = Logging.setup_logging()

circuit = Circuit('Resistor Bridge')

circuit.V('input', 1, circuit.gnd, 10@u_V)
circuit.R('R1', 1, 2, 2@u_kΩ)
circuit.R('R2', 1, 3, 1@u_kΩ)
circuit.R(3, 2, circuit.gnd, 1@u_kΩ)
circuit.R(4, 3, circuit.gnd, 2@u_kΩ)
circuit.R(5, 3, 2, 2@u_kΩ)

simulator = circuit.simulator(temperature=25, nominal_temperature=25)
analysis = simulator.operating_point()

for node in analysis.nodes.values():
    print('Node {}: {:4.1f} V'.format(str(node), node.item()))
    # fuck you
print(f"{-float(analysis.branches['vinput'][0]):.3e} A")
print(len(analysis.branches))

## -- SWEEP SOURCE

# import matplotlib.pyplot as plt
# from PySpice.Spice.Netlist import Circuit
# from PySpice.Unit import *

# # Create the circuit
# circuit = Circuit('Voltage Source Sweep Example')
# circuit.V('1', 'n1', circuit.gnd, 0@u_V)  # voltage source (will sweep)
# circuit.R(1, 'n1', 'n2', 30@u_Ω)          # R1 = 30 Ohm
# circuit.R(2, 'n2', circuit.gnd, 20@u_Ω)   # R2 = 20 Ohm

# # Create simulator
# simulator = circuit.simulator(temperature=25, nominal_temperature=25)

# # DC sweep: sweep voltage source V1 from 0V to 30V linearly with 20 points
# analysis = simulator.dc(V1=slice(0, 30, 1.5))  # 0, 1.5, 3, ..., 30 V

# # Sweep points
# V1_sweep = [float(v) for v in analysis.sweep]  # V1 values

# # Voltage at node n2
# V_n2 = [float(v) for v in analysis.nodes['n2']]

# # Plot
# plt.figure()
# plt.plot(V1_sweep, V_n2)
# plt.xlabel('V1 (V)')
# plt.ylabel('Voltage at n2 (V)')
# plt.title('DC Sweep of Voltage Source V1')
# plt.grid(True)
# plt.show()

# import numpy as np
# import matplotlib.pyplot as plt
# from PySpice.Spice.Netlist import Circuit
# from PySpice.Unit import *

# # Create RC circuit
# circuit = Circuit('RC Transient Example')

# # Pulse voltage source: 0V → 10V step
# source = circuit.PulseVoltageSource('input', 'in', circuit.gnd,
#                                     initial_value=0@u_V,
#                                     pulsed_value=10@u_V,
#                                     pulse_width=10@u_ms,
#                                     period=20@u_ms)

# # Resistor and capacitor
# circuit.R(1, 'in', 'out', 1@u_kΩ)
# circuit.C(1, 'out', circuit.gnd, 1@u_uF)  # 1 µF

# # Theoretical time constant
# tau = circuit['R1'].resistance * circuit['C1'].capacitance  # tau = RC
# print(f"Theoretical tau = {tau}")

# # Simulator
# simulator = circuit.simulator(temperature=25, nominal_temperature=25)

# # Transient analysis
# step_time = 50@u_us
# analysis = simulator.transient(step_time=step_time, end_time=30@u_ms)

# # Theoretical RC charging curve
# def v_out_theory(t, tau):
#     return float(source.pulsed_value) * (1 - np.exp(np.array(t)/(-float(tau))))

# print(len(analysis.time))


# # Plot

# plt.figure(figsize=(10,5))
# plt.plot(analysis.time, analysis['in'], label='Vin [V]')
# plt.plot(analysis.time, analysis['out'], label='Vout [V] (simulated)')
# plt.plot(analysis.time, v_out_theory(analysis.time, tau), '--', label='Vout [V] (theory)')
# plt.axvline(float(tau), color='red', linestyle=':', label='tau')
# plt.xlabel('Time [s]')
# plt.ylabel('Voltage [V]')
# plt.title('RC Circuit Transient Response')
# plt.grid(True)
# plt.legend()
# plt.show()










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
