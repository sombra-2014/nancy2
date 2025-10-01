import sqlite3

def update_db_schema():
    conn = sqlite3.connect('ecommerce.db')
    cursor = conn.cursor()

    try:
        # Intenta agregar la columna customer_name
        cursor.execute("ALTER TABLE orders ADD COLUMN customer_name TEXT;")
        print("Columna 'customer_name' agregada con éxito.")
    except sqlite3.OperationalError as e:
        print(f"La columna 'customer_name' ya existe o hubo un error: {e}")

    try:
        # Intenta agregar la columna customer_email
        cursor.execute("ALTER TABLE orders ADD COLUMN customer_email TEXT;")
        print("Columna 'customer_email' agregada con éxito.")
    except sqlite3.OperationalError as e:
        print(f"La columna 'customer_email' ya existe o hubo un error: {e}")

    conn.commit()
    conn.close()

if __name__ == '__main__':
    update_db_schema()