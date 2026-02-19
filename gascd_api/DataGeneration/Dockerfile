
FROM python:3.15.0a6-slim-trixie

WORKDIR .

ADD generate_sql.py .
ADD configs/* configs/
ADD data/* data/

RUN mkdir /output/
RUN python generate_sql.py