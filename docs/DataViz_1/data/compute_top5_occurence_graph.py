
import csv

yearly_data = {}
with open('EarthTempAnomalies.csv', mode='r') as csv_file:
    csv_reader = csv.DictReader(csv_file)

    line_count = 0
    found_count = 0
    for row in csv_reader:
        print(row)
        for p in data['nodes']:
                new_node = {
                    "name": row["name"],
                    "id":row["id"],
                    "bio":row["bio"]
                }
                data_out.append(new_node)

with open('names.csv', 'w', newline='') as csvfile:
    fieldnames = ['Global',
    'Northern',
    'Southern',
     'Year',
     'Jan',
     'Feb',
     'Mar',
     'Apr',
     'May',
     'Jun',
     'Jul',
     'Aug',
     'Sep',
     'Oct',
     'Nov',
     'Dec',
     'MonthlyAvg',
     'AnnualAvg',
     'Winter',
     'Spring',
     'Summer',
     'Autumn'
     ]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    writer.writerow({'first_name': 'Baked', 'last_name': 'Beans'})
    writer.writerow({'first_name': 'Lovely', 'last_name': 'Spam'})
    writer.writerow({'first_name': 'Wonderful', 'last_name': 'Spam'})