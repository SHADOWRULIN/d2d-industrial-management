from database.db_connection import connect_db

class ClientController:
    def create_client(self, name, phone, email, company, password):
        conn = connect_db()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO clients (name, phone, email, company, password) 
            VALUES (?, ?, ?, ?, ?)
        """, (name, phone, email, company, password))
        
        client_id = cursor.lastrowid  # Retrieve auto-incremented client ID

        conn.commit()
        conn.close()

        return client_id  # ✅ Return client_id for linking with proposals
