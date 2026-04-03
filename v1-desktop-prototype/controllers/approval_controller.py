import sqlite3
from database.db_connection import connect_db

class ApprovalController:

    def approve_proposal(self, proposal_id):
        """ Approve a proposal and update approvals & proposals tables. """
        try:
            conn = connect_db()
            cursor = conn.cursor()

            print(f"[DEBUG] Approving proposal ID {proposal_id}")

            # Ensure proposal exists before updating
            cursor.execute("SELECT proposal_id FROM proposals WHERE proposal_id = ?", (proposal_id,))
            proposal_exists = cursor.fetchone()

            if not proposal_exists:
                print(f"[ERROR] Proposal ID {proposal_id} does not exist. Approval failed.")
                return False

            # Check if approval record already exists
            cursor.execute("SELECT * FROM approvals WHERE proposal_id = ?", (proposal_id,))
            approval_exists = cursor.fetchone()

            if approval_exists:
                cursor.execute("UPDATE approvals SET status = 'Approved' WHERE proposal_id = ?", (proposal_id,))
            else:
                cursor.execute("INSERT INTO approvals (proposal_id, status) VALUES (?, 'Approved')", (proposal_id,))

            # Update proposals table
            cursor.execute("UPDATE proposals SET status = 'Approved' WHERE proposal_id = ?", (proposal_id,))

            conn.commit()
            print(f"[INFO] Proposal ID {proposal_id} approved successfully.")
            return True

        except sqlite3.Error as e:
            print(f"[ERROR] Database error: {e}")
            return False
        finally:
            conn.close()

    def reject_proposal(self, proposal_id):
        """ Reject a proposal and remove related records. """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            print(f"[DEBUG] Rejecting proposal ID {proposal_id}")

            # Ensure proposal exists before attempting deletion
            cursor.execute("SELECT proposal_id FROM proposals WHERE proposal_id = ?", (proposal_id,))
            proposal_exists = cursor.fetchone()

            if not proposal_exists:
                print(f"[ERROR] Proposal ID {proposal_id} does not exist. Rejection failed.")
                return False

            cursor.execute("DELETE FROM approvals WHERE proposal_id = ?", (proposal_id,))
            cursor.execute("DELETE FROM project_files WHERE proposal_id = ?", (proposal_id,))
            cursor.execute("DELETE FROM proposals WHERE proposal_id = ?", (proposal_id,))

            conn.commit()
            print(f"[INFO] Proposal ID {proposal_id} rejected and removed successfully.")
            return True

        except sqlite3.Error as e:
            print(f"[ERROR] Database error: {e}")
            return False
        finally:
            conn.close()
