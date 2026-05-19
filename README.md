# 🧩 Головоломки (Puzzle Website)

Інтерактивна веб-платформа з різноманітними головоломками (15-Puzzle, Сапер, GeoGuess, Колірна пам'ять) на базі Python та Flask.

## 🚀 Локальний запуск

### Варіант 1. Через `uv` (якщо встановлено)

```bash
uv run python app.py
```

### Варіант 2. Через стандартний Python

1. Створіть віртуальне оточення та активуйте його:
   ```bash
   python -m venv .venv
   # Для Windows (PowerShell):
   .\.venv\Scripts\Activate.ps1
   # Для Linux/macOS:
   source .venv/bin/activate
   ```
2. Встановіть залежності:
   ```bash
   pip install -r requirements.txt
   ```
3. Запустіть сервер розробки:
   ```bash
   python app.py
   ```

Сайт буде доступний за адресою [http://127.0.0.1:5000](http://127.0.0.1:5000).

---

## 🌐 Деплой на Render.com

Проєкт повністю готовий до безкоштовного деплою на Render.com.

### Крок 1. Залийте проєкт на GitHub

Якщо ви ще не ініціалізували Git у проєкті:

1. Ініціалізуйте репозиторій:
   ```bash
   git init
   git add .
   git commit -m "Prepare project for Render deployment"
   ```
2. Створіть новий публічний або приватний репозиторій на GitHub.
3. Додайте віддалений репозиторій та надішліть код:
   ```bash
   git remote add origin <URL_вашого_репозиторію>
   git branch -M main
   git push -u origin main
   ```

### Крок 2. Налаштування на Render.com

Ви можете налаштувати деплой двома способами:

#### Спосіб А. Автоматичний (через Render Blueprints)
Завдяки файлу `render.yaml`, Render може налаштувати все автоматично:
1. Перейдіть у панель керування Render та натисніть **New** -> **Blueprint**.
2. Підключіть свій репозиторій GitHub.
3. Render автоматично прочитає файл `render.yaml` і створить Web Service з усіма потрібними параметрами. Натисніть **Apply**.

#### Спосіб Б. Ручний (через Web Service)
1. У панелі керування Render натисніть **New** -> **Web Service**.
2. Підключіть свій GitHub репозиторій.
3. Вкажіть наступні налаштування:
   - **Name**: `puzzle-site` (або будь-яка інша назва)
   - **Language**: `Python`
   - **Branch**: `main`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
4. В розділі **Advanced**:
   - Додайте змінну оточення `PYTHON_VERSION` зі значенням `3.12` (або Render сам зчитає файл `.python-version`).
5. Натисніть **Create Web Service**.

Ваш проєкт автоматично скомпілюється та стане доступним у мережі Інтернет!
