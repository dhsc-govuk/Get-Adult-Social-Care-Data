# Usage: DB_PASSWORD=mydbpassword ./dbtools/import_csv.sh mydata.csv tablename
docker cp $1 mssql-server:/tmp/in.csv
docker exec -it \
		mssql-server /opt/mssql-tools18/bin/bcp $2 in /tmp/in.csv \
		-u -S localhost -U SA -P "$DB_PASSWORD" -d Analytical_Datastore \
		-c -t "," -r "\n" -F 2
