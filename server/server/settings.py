"""
Django settings for server project.

Generated by 'django-admin startproject' using Django 4.0.4.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.0/ref/settings/
"""

from os import environ, path
from pathlib import Path


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
MEDIA_URL = '/test-books/'
MEDIA_ROOT = path.join(BASE_DIR, 'test-books')


# For development:
# environ['GITHUB_MODE'] = "development"
google_credentials = environ.get('GOOGLE_APPLICATION_CREDENTIALS')
if google_credentials is None:
    environ['GOOGLE_APPLICATION_CREDENTIALS'] = google_credentials = \
        "./arcane-pillar-349913-6276b9f35040.json"
# Add your (Azure) Computer Vision subscription key and endpoint to your environment variables.
if 'COMPUTER_VISION_SUBSCRIPTION_KEY' not in environ:
    if path.isfile("azure-key.txt"):
        with open("azure-key.txt", 'r') as file:
            environ['COMPUTER_VISION_SUBSCRIPTION_KEY'] = file.read()
    else:
        environ['COMPUTER_VISION_SUBSCRIPTION_KEY'] = ''
if 'COMPUTER_VISION_ENDPOINT' not in environ:
    # if no endpoint is set, just use the default endpoint
    environ['COMPUTER_VISION_ENDPOINT'] = 'https://ebooks.cognitiveservices.azure.com/'


# For automatic deployment:
if not path.isfile(google_credentials):
    with open(google_credentials, 'w') as file:
        file.write(environ.get('GOOGLE_CREDENTIALS', ''))
certificate = environ.get('MONGO_DB_CA_CERT')
if certificate is not None and not path.isfile(certificate):
    with open(certificate, 'w') as file:
        file.write(environ.get('CA_CERTIFICATE', ''))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = environ.get('SECRET_KEY',
                         'django-insecure-n8lk#@)p)u_9jn34^i#2_uf_k*k8$+fzhj4)*b!n_6a!krj14e')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = environ.get('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = environ.get("DJANGO_ALLOWED_HOSTS", "127.0.0.1,localhost").split(",")

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'ebooks',
    'images',
    'annotations',
    'rest_framework',
    'corsheaders',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]

ROOT_URLCONF = 'server.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'server.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'djongo',
        'NAME': environ.get('MONGO_DB_NAME', 'fixingebooks'),
        'CLIENT': {
            'host': environ.get('MONGO_DB_HOST', 'mongodb://mongodb:27017'),
            'username': environ.get('MONGO_DB_USERNAME', 'root'),
            'password': environ.get('MONGO_DB_PASSWORD', 'mongoadmin'),
            'authSource': environ.get('MONGO_DB_AUTH_SOURCE', 'admin'),
            'authMechanism': environ.get('MONGO_DB_AUTH_MECHANISM', 'SCRAM-SHA-1'),
            'tls': environ.get('MONGO_DB_TLS', 'false'),
            'tlsCAFile': environ.get('MONGO_DB_CA_CERT', None),
        }
    }
}


# Password validation
# https://docs.djangoproject.com/en/4.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.0/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/4.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ORIGIN_WHITELIST = [
    environ.get('CLIENT_URL', 'http://localhost:3000'),
]

CORS_ALLOW_HEADERS = ('content-disposition', 'accept-encoding',
                      'content-type', 'accept', 'origin', 'authorization', 'ebook')
