#!/usr/bin/env python3
"""
Direct database script to create seed accounts for admin, buyer, seller, and rider.
This script directly accesses the database without needing authentication.
"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import database connection
try:
    import os
    from dotenv import load_dotenv
    from werkzeug.security import generate_password_hash
    from datetime import datetime
    
    # Load environment variables
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    load_dotenv(os.path.join(BASE_DIR, '.env'))
    
    # Determine database engine
    DB_ENGINE = os.environ.get('DB_ENGINE', 'mysql').lower()
    
    # Import database libraries
    if DB_ENGINE == 'mysql':
        import pymysql
        import pymysql.cursors
    else:
        import sqlite3
    
    def get_db():
        """Get database connection without Flask context"""
        if DB_ENGINE == 'mysql':
            return pymysql.connect(
                host=os.environ.get('DB_HOST', '127.0.0.1'),
                user=os.environ.get('DB_USER', 'root'),
                password=os.environ.get('DB_PASS', ''),
                db=os.environ.get('DB_NAME', 'qwerty'),
                port=int(os.environ.get('DB_PORT', '3306')),
                cursorclass=pymysql.cursors.DictCursor,
                charset='utf8mb4'
            )
        else:
            db_path = os.path.join(BASE_DIR, 'qwerty.db')
            conn = sqlite3.connect(db_path)
            conn.row_factory = sqlite3.Row
            return conn
            
except ImportError as e:
    print(f"❌ Error importing modules: {e}")
    print("Make sure you're running this from the backend directory and required packages are installed.")
    sys.exit(1)

def create_test_accounts():
    """Create test accounts directly in the database"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        created_accounts = {
            'admins': [],
            'buyers': [],
            'sellers': [],
            'riders': []
        }
        
        # Delete existing seed accounts first
        test_emails = [
            'admin', 'buyer', 'seller', 'rider'
        ]
        
        print("🗑️  Deleting existing test accounts...")
        for email in test_emails:
            try:
                if DB_ENGINE == 'mysql':
                    cursor.execute('SELECT id FROM users WHERE email = %s', (email,))
                else:
                    cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
                user_row = cursor.fetchone()
                if user_row:
                    user_id = user_row[0] if isinstance(user_row, tuple) else (user_row.get('id') if hasattr(user_row, 'get') else user_row['id'])
                    if user_id:
                        if DB_ENGINE == 'mysql':
                            cursor.execute('DELETE FROM sellers WHERE user_id = %s', (user_id,))
                            cursor.execute('DELETE FROM riders WHERE user_id = %s', (user_id,))
                            cursor.execute('DELETE FROM users WHERE id = %s', (user_id,))
                        else:
                            cursor.execute('DELETE FROM sellers WHERE user_id = ?', (user_id,))
                            cursor.execute('DELETE FROM riders WHERE user_id = ?', (user_id,))
                            cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))
            except Exception as del_err:
                print(f"   ⚠️  Warning: Could not delete {email}: {del_err}")
        
        # Create admin account
        print("\n👑 Creating admin account...")
        admin_info = {
            'email': 'admin',
            'password': 'admin123',
            'first_name': 'System',
            'last_name': 'Admin'
        }
        admin_password_hash = generate_password_hash(admin_info['password'])

        try:
            if DB_ENGINE == 'mysql':
                cursor.execute('''
                    INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified)
                    VALUES (%s, %s, %s, %s, %s, %s)
                ''', (admin_info['email'], admin_password_hash, admin_info['first_name'], admin_info['last_name'], 'admin', 1))
            else:
                cursor.execute('''
                    INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (admin_info['email'], admin_password_hash, admin_info['first_name'], admin_info['last_name'], 'admin', 1))
            admin_id = cursor.lastrowid
            created_accounts['admins'].append({
                'email': admin_info['email'],
                'password': admin_info['password'],
                'user_id': admin_id
            })
            print(f"   ✅ Created: {admin_info['email']} (ID: {admin_id})")
        except Exception as err:
            print(f"   ❌ Failed to create admin account: {err}")

        # Create buyer account
        print("\n🛒 Creating buyer account...")
        buyer_info = {
            'email': 'buyer',
            'password': 'buyer123',
            'first_name': 'Seed',
            'last_name': 'Buyer'
        }
        buyer_password_hash = generate_password_hash(buyer_info['password'])

        try:
            if DB_ENGINE == 'mysql':
                cursor.execute('''
                    INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified)
                    VALUES (%s, %s, %s, %s, %s, %s)
                ''', (buyer_info['email'], buyer_password_hash, buyer_info['first_name'], buyer_info['last_name'], 'buyer', 1))
            else:
                cursor.execute('''
                    INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (buyer_info['email'], buyer_password_hash, buyer_info['first_name'], buyer_info['last_name'], 'buyer', 1))
            buyer_id = cursor.lastrowid
            created_accounts['buyers'].append({
                'email': buyer_info['email'],
                'password': buyer_info['password'],
                'user_id': buyer_id
            })
            print(f"   ✅ Created: {buyer_info['email']} (ID: {buyer_id})")
        except Exception as err:
            print(f"   ❌ Failed to create buyer account: {err}")

        # Create seller account
        print("\n🏪 Creating seller account...")
        seller_info = {
            'email': 'seller',
            'password': 'seller 123',
            'first_name': 'Seed',
            'last_name': 'Seller',
            'business_name': 'Seed Seller Store',
            'category': 'Food'
        }
        seller_password_hash = generate_password_hash(seller_info['password'])

        try:
            if DB_ENGINE == 'mysql':
                cursor.execute('''
                    INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified)
                    VALUES (%s, %s, %s, %s, %s, %s)
                ''', (seller_info['email'], seller_password_hash, seller_info['first_name'], seller_info['last_name'], 'seller', 1))
            else:
                cursor.execute('''
                    INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (seller_info['email'], seller_password_hash, seller_info['first_name'], seller_info['last_name'], 'seller', 1))
            seller_user_id = cursor.lastrowid

            if DB_ENGINE == 'mysql':
                cursor.execute('''
                    INSERT INTO sellers (user_id, business_name, category, verified, shop_status)
                    VALUES (%s, %s, %s, 1, 'active')
                ''', (seller_user_id, seller_info['business_name'], seller_info['category']))
            else:
                cursor.execute('''
                    INSERT INTO sellers (user_id, business_name, category, verified, shop_status)
                    VALUES (?, ?, ?, 1, 'active')
                ''', (seller_user_id, seller_info['business_name'], seller_info['category']))
            seller_id = cursor.lastrowid
            created_accounts['sellers'].append({
                'email': seller_info['email'],
                'password': seller_info['password'],
                'user_id': seller_user_id,
                'seller_id': seller_id,
                'business_name': seller_info['business_name']
            })
            print(f"   ✅ Created: {seller_info['email']} (ID: {seller_id})")
        except Exception as err:
            print(f"   ❌ Failed to create seller account: {err}")

        # Create rider account
        print("\n🚴 Creating rider account...")
        rider_info = {
            'email': 'rider',
            'password': 'rider123',
            'first_name': 'Seed',
            'last_name': 'Rider',
            'vehicle_type': 'Motorcycle',
            'driver_license': 'RID-SEED-001'
        }
        rider_password_hash = generate_password_hash(rider_info['password'])

        try:
            if DB_ENGINE == 'mysql':
                cursor.execute('''
                    INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified)
                    VALUES (%s, %s, %s, %s, %s, %s)
                ''', (rider_info['email'], rider_password_hash, rider_info['first_name'], rider_info['last_name'], 'rider', 1))
            else:
                cursor.execute('''
                    INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (rider_info['email'], rider_password_hash, rider_info['first_name'], rider_info['last_name'], 'rider', 1))
            rider_user_id = cursor.lastrowid

            if DB_ENGINE == 'mysql':
                cursor.execute('''
                    INSERT INTO riders (user_id, vehicle_type, driver_license, verified, rider_status, availability)
                    VALUES (%s, %s, %s, 1, 'active', 'available')
                ''', (rider_user_id, rider_info['vehicle_type'], rider_info['driver_license']))
            else:
                cursor.execute('''
                    INSERT INTO riders (user_id, vehicle_type, driver_license, verified, rider_status, availability)
                    VALUES (?, ?, ?, 1, 'active', 'available')
                ''', (rider_user_id, rider_info['vehicle_type'], rider_info['driver_license']))
            rider_id = cursor.lastrowid
            created_accounts['riders'].append({
                'email': rider_info['email'],
                'password': rider_info['password'],
                'user_id': rider_user_id,
                'rider_id': rider_id,
                'vehicle_type': rider_info['vehicle_type']
            })
            print(f"   ✅ Created: {rider_info['email']} (ID: {rider_id})")
        except Exception as err:
            print(f"   ❌ Failed to create rider account: {err}")
        # Commit the transaction
        db.commit()
        cursor.close()
        db.close()

        print(
            f"\n✨ Successfully created {len(created_accounts['admins'])} admin, "
            f"{len(created_accounts['buyers'])} buyer, {len(created_accounts['sellers'])} seller, "
            f"and {len(created_accounts['riders'])} rider account(s)!"
        )

        print(f"\n📋 Account Summary:")
        print(f"\n👑 Admin Account:")
        for admin in created_accounts['admins']:
            print(f"   - {admin['email']} | Password: {admin['password']}")

        print(f"\n🛒 Buyer Account:")
        for buyer in created_accounts['buyers']:
            print(f"   - {buyer['email']} | Password: {buyer['password']}")

        print(f"\n🏪 Seller Accounts:")
        for seller in created_accounts['sellers']:
            print(f"   - {seller['email']} | Password: {seller['password']} | Business: {seller['business_name']}")
        
        print(f"\n🚴 Rider Accounts:")
        for rider in created_accounts['riders']:
            print(f"   - {rider['email']} | Password: {rider['password']} | Vehicle: {rider['vehicle_type']}")
        
        print("\n💡 These accounts are now ready for testing admin actions!")
        return True
        
    except Exception as e:
        import traceback
        print(f"\n❌ Error: {e}")
        print(traceback.format_exc())
        try:
            db.rollback()
        except:
            pass
        try:
            cursor.close()
        except:
            pass
        try:
            db.close()
        except:
            pass
        return False

if __name__ == "__main__":
    print("🔧 Creating test accounts directly in database...\n")
    success = create_test_accounts()
    sys.exit(0 if success else 1)

