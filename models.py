from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {'id': self.id, 'username': self.username, 'is_admin': self.is_admin}

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False, default=0)
    
    # --- CAMBIO: AÑADIMOS EL CAMPO CATEGORY ---
    category = db.Column(db.String(50), nullable=False, default='General')
    
    images = db.relationship('ProductImage', backref='product', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'stock': self.stock,
            'category': self.category, # Incluimos la categoría en la respuesta
            'image_urls': [img.image_url for img in self.images]
        }

class ProductImage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    image_url = db.Column(db.String(500), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)