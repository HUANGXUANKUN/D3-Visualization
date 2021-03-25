import json
import csv

char_list = []
data = {}
newData = {
    "nodes":[],
    "links":[]
}

with open('graph.json') as json_file:
    data = json.load(json_file)

with open('characters.csv', mode='r') as csv_file:
    csv_reader = csv.DictReader(csv_file)

    line_count = 0
    found_count = 0
    for row in csv_reader:
        print(row)
        for p in data['nodes']:     
            if p["name"] == row["name"]:
                print("found!")
                found_count+=1
                print(p)
                new_node = {
                    "name": row["name"],
                    "id":row["id"],
                    "bio":row["bio"]
                }
                newData["nodes"].append(new_node)

# top 5 in fan ficiion books 

# Harry Potter 39
# Herminoe Granger 21
# Draco Malfoy 32
# Severus Snape 47
# James Potter 40

# top 5 in official fiction

# Harry Potter 39
# Ron Weasley 58
# Herminoe Granger 21
# Albus Dumbledore 11
# Rubeus Hagrid 22

top5_fan_id = ["39", "21", "32", "47", "40"]
top5_official_id = ["39", "58", "21", "11", "22"]

new_links = []
new_nodes = []

# filter top 5 links only
for a in data["links"]:
    if "triads" in a.keys():
        a.pop("triads")
    hasId = False
    for i in top5_fan_id:
        if a["source"] == i or a["target"] == i:
            hasId = True
            break
    if hasId:
        new_links.append(a)

# filter non-related nodes
print("filter non-related nodes")
for p in newData["nodes"]:
    for link in new_links:
        print(p)
        print(link)
        if p["id"] == link["target"] or p["id"] == link["source"]:
            new_nodes.append(p)
            break

top5_fan_char_data = {
    "nodes" : [],
    "links":[]
}

top5_fan_char_data["nodes"] = new_nodes
top5_fan_char_data["links"] = new_links

with open('top5_fan_fiction_char.json', 'w') as outfile:
    json.dump(top5_fan_char_data, outfile)




################################################
#top5_ official


new_links_1 = []
new_nodes_1 = []

# filter top 5 links only
for a in data["links"]:
    if "triads" in a.keys():
        a.pop("triads")
    hasId = False
    for i in top5_official_id:
        if a["source"] == i or a["target"] == i:
            hasId = True
            break
    if hasId:
        new_links_1.append(a)

# filter non-related link
for p in newData["nodes"]:
    for link in new_links_1:
        if p["id"] == link["target"] or p["id"] == link["source"]:
            new_nodes_1.append(p)
            break

top5_official_char_data = {
    "nodes" : [],
    "links":[]
}
top5_official_char_data["nodes"] = new_nodes_1
top5_official_char_data["links"] = new_links_1

with open('top5_official_char.json', 'w') as outfile:
    json.dump(top5_official_char_data, outfile)