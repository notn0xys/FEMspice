from model.circuit import SimComponent
from collections import defaultdict

def convert_frontend_to_netlist(frontend_data):
    # print("DATA")
    # print(frontend_data)
    # print("------------------------------------")
    components = frontend_data["components"]
    wires = frontend_data["wires"]

    # Build a map of each pin to the net it connects to
    pin_to_net = {}
    nets = []
    # next_net_id = 1

    def find_or_create_net(pin):
        for net in nets:
            if pin in net:
                return net
        new_net = {pin}
        nets.append(new_net)
        return new_net

    # Step 1: connect all wires into electrical nets
    for wire in wires:
        pin_a = (wire["from"]["componentId"], wire["from"]["pinId"])
        pin_b = (wire["to"]["componentId"], wire["to"]["pinId"])
        net_a = find_or_create_net(pin_a)
        net_b = find_or_create_net(pin_b)

        # merge nets if distinct
        if net_a != net_b:
            net_a |= net_b
            nets.remove(net_b)


    # Step 2: assign names to each net (N1, N2, ...)
    net_name_map = {}
    ground_nets = set()
    for comp in components:
        if comp["type"] == "ground":
            for pin in comp["connections"].keys():
                ground_nets.add((comp["id"], pin))

    for i, net in enumerate(nets, start=1):
        # Default name
        name = f"N{i}"
        # If any pin in this net is ground, force name to "0"
        if any(pin in ground_nets for pin in net):
            name = "0"

        # Map each pin to that name
        for pin in net:
            net_name_map[pin] = name
    

    if not ground_nets:
        print("NO GROUND FOUND")
        raise ValueError("No ground found in circuit — please add one before simulation.")

    print(net_name_map)
    
    # Step 3: build simplified component list
    parsed_components = []
    type_counters = defaultdict(int)  # counts per type
    comp_mapping = {}
    for comp in components:
        pin_connections = comp["connections"]
        pins = list(pin_connections.keys())

        # pick first two pins (for simplicity)
        if len(pins) < 2:
            continue

        if comp["type"] in ("voltageSource", "currentSource"):

            # Force node1 = bottom/right (arrow tail)
            bottom_pin = "bottom"
            top_pin = "top"
            node1 = net_name_map.get((comp["id"], top_pin))
            node2 = net_name_map.get((comp["id"], bottom_pin))


        else:
            node1 = net_name_map.get((comp["id"], pins[0]))
            node2 = net_name_map.get((comp["id"], pins[1]))

     

        # translate frontend types → PySpice types

        
        type_map = {
            "resistor": "R",
            "capacitor": "C",
            "inductor": "L",
            "voltageSource": "V",
            "currentSource": "I",
            "pulseVoltageSource": "PV",
        }
        comp_type = type_map.get(comp["type"])
        type_counters[comp_type] += 1
        comp_name = f"{comp_type}{type_counters[comp_type]}"
        comp_mapping[comp["id"]] = comp_name

        # if comp_type == "I":

        #     print("CURRENT SOURCE")
        #     print(node1)
        #     print((comp["id"], pins[0]))
        #     print(node2)
        #     print((comp["id"], pins[1]))
        #     print()


        temp = SimComponent(
            type=comp_type,
            name=comp_name,
            node1=node1,
            node2=node2,
            value=comp["value"],
            unit="ohm" if comp_type == "R" else
                 "volt" if comp_type == "V" else
                 "farad" if comp_type == "C" else
                 "henry" if comp_type == "L" else
                 "ampere" if comp_type == "I" else "",
            prefix=""  # Default to no prefix; can be extended to parse from frontend
        )
        # if comp_type == "I":
        #   print(temp)
        if comp_type == "PV":
            temp.initial_value = (comp.get("initialValue", 0), comp.get("initialPrefix", ""), "volt")
            temp.pulse_value = comp.get("pulse_value")
            temp.pulse_width = comp.get("pulse_width")
            temp.period = comp.get("period")
            temp.unit = "volt"
        parsed_components.append(temp)

    json_safe_map = {f"{k[0]}:{k[1]}": v for k, v in net_name_map.items()}
    # print(parsed_components)
    return {"components": parsed_components, "mappings": json_safe_map, 'components_mapping': comp_mapping}

