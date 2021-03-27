
import csv

yearly_hemisphere = []
yearly_seasons_by_hemisphere = []

with open('EarthTempAnomalies.csv', mode='r') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    for row in csv_reader:
        print(row)
        if int(row["Year"]) < 1900:
            continue
        ## By hemisphere
        node_1 = {
            "Hemisphere": row["Hemisphere"],
            "Year":row["Year"],
            "AnnualAvg":row["J-D"],
        }
        yearly_hemisphere.append(node_1)

        ## By season
        for i in range(0, 4):
            value = 0
            season = ""
            if i == 0:
                value = row["DJF"] 
                season = "Winter"
            elif i == 1:
                value = row["MAM"]
                season = "Spring"
            elif i == 2:
                value = row["JJA"]
                season = "Summer"
            elif i == 3:
                value = row["SON"]
                season = "Autumn"
            node_2 = {
                "Hemisphere": row["Hemisphere"],
                "Year":row["Year"],
                "Season": season,
                "SeasonAvg": value
            }
            yearly_seasons_by_hemisphere.append(node_2)

with open('Annual_By_Hemisphere.csv', 'w', newline='') as csvfile:
    fieldnames = ['Hemisphere', 'Year', 'AnnualAvg']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    for row in yearly_hemisphere:
        writer.writerow({
            'Hemisphere': row["Hemisphere"],
            'Year': row["Year"],
            'AnnualAvg': row["AnnualAvg"],
        })

with open('Seasonal_By_Hemisphere.csv', 'w', newline='') as csvfile:
    fieldnames = ['Hemisphere', 'Year', 'Season', 'SeasonAvg']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    for row in yearly_seasons_by_hemisphere:
        writer.writerow({
            'Hemisphere': row["Hemisphere"],
            'Year': row["Year"],
            'Season': row["Season"],
            'SeasonAvg': row["SeasonAvg"]
        })