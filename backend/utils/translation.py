from model.circuit import Component
from collections import defaultdict

def convert_frontend_to_netlist(frontend_data):
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
    #print(nets)

    # Step 2: assign names to each net (N1, N2, ...)
    net_name_map = {}
    for i, net in enumerate(nets, start=1):
        name = "0" if any("bottom" in pin for pin in net) else f"N{i}"
        for pin in net:
            net_name_map[pin] = name
    
    #print(net_name_map)

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

        node1 = net_name_map.get((comp["id"], pins[0]))
        node2 = net_name_map.get((comp["id"], pins[1]))

        # translate frontend types → PySpice types

        
        type_map = {
            "resistor": "R",
            "capacitor": "C",
            "inductor": "L",
            "voltageSource": "V",
            "currentSource": "I"
        }
        comp_type = type_map.get(comp["type"])
        type_counters[comp_type] += 1
        comp_name = f"{comp_type}{type_counters[comp_type]}"
        comp_mapping[comp["id"]] = comp_name

        parsed_components.append(Component(
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
        )

    json_safe_map = {f"{k[0]}:{k[1]}": v for k, v in net_name_map.items()}
    return {"components": parsed_components, "mappings": json_safe_map, 'components_mapping': comp_mapping}

