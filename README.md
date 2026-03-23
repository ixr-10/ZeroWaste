# ZeroWaste

ZeroWaste includes a Django backend, a React web frontend, and a mobile app under `front-end/mobile`.

## Repository Structure

- `back-end/`: Django API and admin.
- `src/`, `public/`: React web application.
- `front-end/mobile/`: mobile app source.

## Backend Setup

```bash
git clone https://github.com/your-username/ZeroWaste.git
cd ZeroWaste/back-end
python -m venv venv
```

Activate the virtual environment:

```bash
# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

Install dependencies and start the backend:

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The backend runs at `http://127.0.0.1:8000/`.

## Web Frontend Setup

From the repository root:

```bash
npm install
npm start
```

Available scripts:

- `npm start`: runs the web app in development mode.
- `npm test`: runs the test suite.
- `npm run build`: creates a production build.

## Notes

The earlier README content from both branches was consolidated here to avoid keeping the default Create React App boilerplate while preserving the project setup instructions.
