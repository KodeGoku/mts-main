# Backend Setup

Run the following commands to create a new conda environment and install the necessary packages:

```
conda create --name vals python=3.11
conda activate vals
pip install -r requirements.txt
```

To start the backend server, run

```
./manage.py runserver
```

# Frontend Setup

Make sure you have npm version 8.3.0 installed.

To install the necessary packages, run

```
cd fe
npm install
```

To start the FE server, run:

```
npm run dev
```
