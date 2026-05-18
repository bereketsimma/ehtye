# Django Project

A Django web application project setup with a virtual environment and basic project structure.

## Project Structure

```
ehtye/
├── config/              # Django project configuration
│   ├── settings.py      # Project settings
│   ├── urls.py          # Project URL routing
│   ├── asgi.py          # ASGI configuration
│   └── wsgi.py          # WSGI configuration
├── core/                # Main Django app
│   ├── migrations/      # Database migrations
│   ├── models.py        # Data models
│   ├── views.py         # View functions/classes
│   ├── urls.py          # App URL routing (create this)
│   └── admin.py         # Django admin configuration
├── venv/                # Python virtual environment
├── manage.py            # Django management script
└── requirements.txt     # Project dependencies
```

## Setup Instructions

### 1. Activate Virtual Environment

**Windows (PowerShell):**
```powershell
venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
venv\Scripts\activate.bat
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run Migrations

```bash
python manage.py migrate
```

### 4. Create Superuser (for Django Admin)

```bash
python manage.py createsuperuser
```

### 5. Start Development Server

```bash
python manage.py runserver
```

The application will be available at `http://localhost:8000/`

## Development

### Create Database Migrations

```bash
python manage.py makemigrations
```

### Run Tests

```bash
python manage.py test
```

### Django Shell

```bash
python manage.py shell
```

## Available Apps

- **core**: Main application for the project

## Notes

- The virtual environment (`venv/`) should not be committed to version control
- Create a `.gitignore` file to exclude `venv/`, `*.pyc`, `db.sqlite3`, etc.
- Update `ALLOWED_HOSTS` in `config/settings.py` for production deployment
- Use environment variables for sensitive settings (database credentials, secret keys, etc.)

## Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django Admin Interface](http://localhost:8000/admin/) (after creating a superuser)
