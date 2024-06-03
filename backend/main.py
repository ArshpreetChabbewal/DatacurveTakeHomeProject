from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import docker
import databases
import sqlalchemy

# Database configuration
DATABASE_URL = "sqlite:///./code.db"  # Define the database URL
database = databases.Database(DATABASE_URL)  # Create a database instance
metadata = sqlalchemy.MetaData()  # Create metadata for database

# Define the table structure for storing code and output
codes = sqlalchemy.Table(
    "codes",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("code", sqlalchemy.String),
    sqlalchemy.Column("output", sqlalchemy.String)
)

# Create an engine to connect to the database
engine = sqlalchemy.create_engine(DATABASE_URL)
metadata.create_all(engine)  # Create the tables in the database

# Docker client initialization
client = docker.from_env()

# Define a Pydantic model for the code input
class Code(BaseModel):
    code: str

# Create a FastAPI instance
app = FastAPI()

# Event handlers for database connection and disconnection
@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# Function to execute code in a Docker container
def execute_code_in_docker(code: str) -> str:
    try:
        # Run code in container with timeout
        container = client.containers.run(
            "python-env",
            f"python -c '{code}'",
            detach=True,
            stderr=True,
            stdout=True
        )
        container.wait(timeout=10)

        # Get output and remove container
        logs = container.logs().decode("utf-8")
        container.remove()
        return logs
    except Exception as e:
        return str(e)

# Endpoint to execute code
@app.post("/execute")
async def execute_code(code: Code):
    try:
        output = execute_code_in_docker(code.code)
        return {"output": output}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Endpoint to execute and submit code
@app.post("/submit")
async def submit_code(code: Code):
    try:
        output = execute_code_in_docker(code.code)
        query = codes.insert().values(code=code.code, output=output)
        record_id = await database.execute(query)
        return {"id": record_id, "output": output}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Endpoint to fetch last submitted code
@app.get("/latest_submitted_code")
async def get_last_code():
    query = codes.select().order_by(sqlalchemy.desc(codes.c.id)).limit(1)
    last_code = await database.fetch_one(query)
    return {"code": last_code["code"] if last_code else ""}
