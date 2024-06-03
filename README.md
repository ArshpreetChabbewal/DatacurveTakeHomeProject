# DatacurveTakeHomeProject

This project was built using React (Next.js) for the frontend and Python (FastApi) for the backend. Note that this code also uses a docker container to run the python code safely in an isolated and trusted environment. Please ensure that docker is installed and running before proceeding.

The steps to setup the project are shown below, please create two seperate terminal instances and run the following commands to set up the frontend and backend components of the project.

BACKEND SETUP:
From the root directory, run the following commands
```
cd backend
pip install -r requirements.txt
docker build -t python-env .
uvicorn main:app --reload
```

FRONTEND SETUP:
From the root directory, run the following commands
```
cd frontend
npm install
npm run dev
```