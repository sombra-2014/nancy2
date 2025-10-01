from flask import Flask, request, jsonify, g, send_from_directory
import sqlite3
import json
from datetime import datetime
from flask_cors import CORS
import os
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

DATABASE = 'ecommerce.db'

# Esta línea te mostrará dónde se está buscando la base de datos
print(f"La base de datos se está usando desde: {os.path.join(os.path.dirname(os.path.abspath(__file__)), DATABASE)}")

# Rutas absolutas para evitar problemas con la ubicación del script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_PRODUCT_FOLDER = os.path.join(BASE_DIR, '..', 'frontend', 'uploads', 'products')
UPLOAD_CAROUSEL_FOLDER = os.path.join(BASE_DIR, '..', 'frontend', 'uploads', 'carousel')

app.config['UPLOAD_PRODUCT_FOLDER'] = UPLOAD_PRODUCT_FOLDER
app.config['UPLOAD_CAROUSEL_FOLDER'] = UPLOAD_CAROUSEL_FOLDER

os.makedirs(UPLOAD_PRODUCT_FOLDER, exist_ok=True)
os.makedirs(UPLOAD_CAROUSEL_FOLDER, exist_ok=True)


def get_db_connection():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def create_tables():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            category TEXT NOT NULL,
            image_url TEXT,
            image_urls TEXT,
            description TEXT,
            stock INTEGER NOT NULL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            order_date TEXT NOT NULL,
            total_price REAL NOT NULL,
            products TEXT NOT NULL,
            status TEXT NOT NULL,
            message TEXT  
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            is_admin INTEGER NOT NULL
        )
    ''')
    
    cursor.execute("SELECT COUNT(*) FROM users")
    user_count = cursor.fetchone()[0]
    if user_count == 0:
        hashed_password = generate_password_hash("passwordsegura")
        cursor.execute("INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)", ('admin', hashed_password, 1))
        print("--- Usuario 'admin' creado automáticamente. ---")
        print("Usuario: admin")
        print("Contraseña: passwordsegura")
    
    conn.commit()


# --- RUTA PRINCIPAL ---
@app.route('/')
def home():
    return "¡Hola! Mi aplicación de e-commerce está funcionando."


# --- RUTAS DE AUTENTICACIÓN ---
@app.route('/api/login', methods=['POST'])
def login_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    
    if user and check_password_hash(user['password_hash'], password):
        return jsonify({
            "message": "Inicio de sesión exitoso",
            "username": user['username'],
            "is_admin": bool(user['is_admin'])
        }), 200
    else:
        return jsonify({"error": "Credenciales inválidas"}), 401
    
# --- OTROS ENDPOINTS ---
@app.route('/uploads/products/<path:filename>')
def serve_product_image(filename):
    return send_from_directory(app.config['UPLOAD_PRODUCT_FOLDER'], filename)

@app.route('/api/products', methods=['GET'])
def get_products():
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM products")
    products = cursor.fetchall()
    
    product_list = []
    for p in products:
        p_dict = dict(p)
        if p_dict.get('image_urls'):
            p_dict['image_urls'] = json.loads(p_dict['image_urls'])
            p_dict['image_url'] = p_dict['image_urls'][0] if p_dict['image_urls'] else None
        else:
            p_dict['image_urls'] = []
            p_dict['image_url'] = None
        product_list.append(p_dict)
    return jsonify(product_list)

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_single_product(product_id):
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    product = cursor.fetchone()
    if product:
        product_dict = dict(product)
        if product_dict.get('image_urls'):
            product_dict['image_urls'] = json.loads(product_dict['image_urls'])
        else:
            product_dict['image_urls'] = []
        return jsonify(product_dict)
    else:
        return jsonify({"error": "Product not found"}), 404

@app.route('/api/products', methods=['POST'])
def add_product():
    if 'images' not in request.files or not request.files.getlist('images'):
        return jsonify({"error": "No image files provided"}), 400

    image_urls = []
    for file in request.files.getlist('images'):
        if file.filename != '':
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_PRODUCT_FOLDER'], filename)
            file.save(filepath)
            image_urls.append(f'/uploads/products/{filename}')
    
    name = request.form.get('name')
    price = request.form.get('price')
    category = request.form.get('category')
    description = request.form.get('description')
    stock = request.form.get('stock')
    
    db = get_db_connection()
    cursor = db.cursor()
    
    try:
        cursor.execute("INSERT INTO products (name, price, category, description, stock, image_urls) VALUES (?, ?, ?, ?, ?, ?)", 
                        (name, price, category, description, stock, json.dumps(image_urls)))
        db.commit()
        return jsonify({"message": "Product added successfully", "image_urls": image_urls}), 201
    except sqlite3.Error as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.get_json()
    db = get_db_connection()
    cursor = db.cursor()
    
    try:
        query = "UPDATE products SET "
        updates = []
        params = []
        
        image_urls_list = data.pop('image_urls', None)
        if image_urls_list is not None:
            updates.append("image_urls = ?")
            params.append(json.dumps(image_urls_list))
        
        for key, value in data.items():
            updates.append(f"{key} = ?")
            params.append(value)
        
        query += ", ".join(updates)
        query += " WHERE id = ?"
        params.append(product_id)
        
        cursor.execute(query, tuple(params))
        db.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Product not found"}), 404
        return jsonify({"message": "Product updated successfully"}), 200
    except sqlite3.Error as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    db = get_db_connection()
    cursor = db.cursor()
    
    try:
        cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
        db.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Product not found"}), 404
        return jsonify({"message": "Product deleted successfully"}), 200
    except sqlite3.Error as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/products/search', methods=['GET'])
def search_products():
    query = request.args.get('q', '')
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM products WHERE name LIKE ?", ('%' + query + '%',))
    products = cursor.fetchall()
    
    product_list = []
    for p in products:
        p_dict = dict(p)
        if p_dict.get('image_urls'):
            p_dict['image_urls'] = json.loads(p_dict['image_urls'])
            p_dict['image_url'] = p_dict['image_urls'][0] if p_dict['image_urls'] else None
        else:
            p_dict['image_urls'] = []
            p_dict['image_url'] = None
        product_list.append(p_dict)
    return jsonify(product_list)

@app.route('/api/products/category/<string:category_name>', methods=['GET'])
def get_products_by_category(category_name):
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM products WHERE category = ?", (category_name,))
    products = cursor.fetchall()
    
    product_list = []
    for p in products:
        p_dict = dict(p)
        if p_dict.get('image_urls'):
            p_dict['image_urls'] = json.loads(p_dict['image_urls'])
            p_dict['image_url'] = p_dict['image_urls'][0] if p_dict['image_urls'] else None
        else:
            p_dict['image_urls'] = []
            p_dict['image_url'] = None
        product_list.append(p_dict)
    return jsonify(product_list)

# Endpoints de pedidos
@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.get_json()
    customer_name = data.get('customer_name')
    customer_email = data.get('customer_email')
    products = data.get('products') 
    message = data.get('message', '') # Obtener el campo message
    order_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    status = 'completed'

    if not customer_name or not products:
        return jsonify({"error": "Missing required fields"}), 400

    db = get_db_connection()
    cursor = db.cursor()
    total_price = 0
    products_for_order = []

    try:
        for item in products:
            product_id = item['id']
            quantity = item['quantity']
            
            cursor.execute("SELECT name, price, stock FROM products WHERE id = ?", (product_id,))
            product = cursor.fetchone()
            
            if not product:
                db.rollback()
                return jsonify({"error": f"Product with ID {product_id} not found"}), 404
                
            if product['stock'] < quantity:
                db.rollback()
                return jsonify({"error": f"Stock insuficiente para el producto: {product['name']}"}), 400
            
            total_price += product['price'] * quantity
            products_for_order.append({
                'id': product_id,
                'name': product['name'],
                'price': product['price'],
                'quantity': quantity
            })
            
            new_stock = product['stock'] - quantity
            cursor.execute("UPDATE products SET stock = ? WHERE id = ?", (new_stock, product_id))

        cursor.execute("INSERT INTO orders (customer_name, customer_email, order_date, total_price, products, status, message) VALUES (?, ?, ?, ?, ?, ?, ?)", 
                        (customer_name, customer_email, order_date, total_price, json.dumps(products_for_order), status, message))
        
        db.commit()
        return jsonify({"message": "¡Pedido creado exitosamente!", "total_price": total_price}), 201

    except Exception as e:
        db.rollback()
        # Esta línea nos dirá el error exacto en la terminal
        print(f"Error al crear el pedido: {e}") 
        return jsonify({"error": "Hubo un error al procesar tu pedido. Inténtalo de nuevo."}), 500

@app.route('/api/orders', methods=['GET'])
def get_orders():
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("SELECT id, customer_name, customer_email, order_date, total_price, products, status, message FROM orders ORDER BY order_date DESC")
    orders = cursor.fetchall()
    
    order_list = []
    for order in orders:
        order_dict = dict(order)
        order_dict['products'] = json.loads(order_dict['products'])
        order_list.append(order_dict)

    # Esta línea nos dirá si se encontraron pedidos
    print("Pedidos encontrados en la base de datos:", order_list) 
    return jsonify(order_list)

@app.route('/api/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM orders WHERE id = ?", (order_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Pedido no encontrado"}), 404
        return jsonify({"message": "Pedido eliminado exitosamente"}), 200
    except Exception as e:
        conn.rollback()
        print(f"Error al eliminar el pedido: {e}")
        return jsonify({"error": "Hubo un error al eliminar el pedido"}), 500

# --- RUTAS DE CARRUSEL ---
@app.route('/uploads/carousel/<path:filename>')
def serve_carousel_image(filename):
    return send_from_directory(app.config['UPLOAD_CAROUSEL_FOLDER'], filename)

@app.route('/api/carousel_images', methods=['GET'])
def get_carousel_images():
    images = []
    for filename in os.listdir(app.config['UPLOAD_CAROUSEL_FOLDER']):
        images.append({
            "url": f"/uploads/carousel/{filename}",
            "alt": filename
        })
    return jsonify(images)

if __name__ == '__main__':
    with app.app_context():
        create_tables()
    app.run(debug=True)



