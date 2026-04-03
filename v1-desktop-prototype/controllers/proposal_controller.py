from database.db_connection import connect_db

class ProposalController:
    def submit_proposal(self, client_id, project_name, description, services, image_path):
        conn = connect_db()
        cursor = conn.cursor()

        # Ensure client_id exists before inserting a proposal
        cursor.execute("SELECT client_id FROM clients WHERE client_id = ?", (client_id,))
        client_exists = cursor.fetchone()

        if not client_exists:
            print(f"[ERROR] Client ID {client_id} not found. Cannot submit proposal.")
            conn.close()
            return None

        cursor.execute("""
            INSERT INTO proposals 
                (client_id, project_name, proposal_description, services, image_path, status)
            VALUES (?, ?, ?, ?, ?, 'Pending')
        """, (client_id, project_name, description, services, image_path))

        proposal_id = cursor.lastrowid  # Retrieve inserted proposal ID

        conn.commit()
        conn.close()

        return proposal_id  # Return proposal_id for correct tracking
