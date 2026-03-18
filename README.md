# Gasp-zero
clone the repo
git clone https://github.com/your-username/ZeroWaste.git
cd ZeroWaste/back-end

Create and activate virtual environment:

python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

Install dependencies:

pip install -r requirements.txt

run migrations: 

python manage.py migrate

create admin account:

python manage.py createsuperuser

start the server:

py manage.py runserver

Server runs at: http://127.0.0.1:8000/


Full name (first_name, last_name)
Username
Email
Phone number
Password
Confirm password
Role (dropdown: Donateur, Bénéficiaire, Collectivité, Food Saver)
Address
optional:
Profile picture (avatar)



pip install celery django-celery-beat --break-system-packages