from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import datetime
from database.db_connection import connect_db

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3000", 
    "https://d2d-industrial-management.vercel.app"
])

# ==========================================
# 1. AUTHENTICATION ROUTES
# ==========================================

@app.route('/api/client/login', methods=['POST'])
def client_login():
    data = request.json
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("SELECT client_id, name FROM clients WHERE name = ? AND password = ?", (data['username'], data['password']))
        user = cursor.fetchone()
        if user: return jsonify({"success": True, "client_id": user['client_id'], "name": user['name']})
        return jsonify({"success": False, "message": "Invalid credentials"}), 401
    finally: conn.close()

@app.route('/api/director/login', methods=['POST'])
def director_login():
    data = request.json
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM directors WHERE username = ? AND password = ?", (data['username'], data['password']))
        user = cursor.fetchone()
        if user: return jsonify({"success": True, "name": "Director"})
        return jsonify({"success": False, "message": "Invalid Admin Credentials"}), 401
    finally: conn.close()

@app.route('/api/worker/login', methods=['POST'])
def worker_login():
    data = request.json
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("SELECT worker_id, worker_name, worker_job FROM workers WHERE username = ? AND password = ?", (data['username'], data['password']))
        user = cursor.fetchone()
        if user: 
            return jsonify({
                "success": True, "worker_id": user['worker_id'], "name": user['worker_name'], "job": user['worker_job']
            })
        return jsonify({"success": False, "message": "Invalid Worker Credentials"}), 401
    finally: conn.close()

@app.route('/api/client/signup', methods=['POST'])
def client_signup():
    data = request.json
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO clients (name, password, phone, email, company) VALUES (?, ?, ?, ?, ?)", 
                       (data['username'], data['password'], data['phone'], data['email'], data['company']))
        conn.commit(); client_id = cursor.lastrowid
        return jsonify({"success": True, "client_id": client_id, "name": data['username']})
    except Exception as e: return jsonify({"success": False, "message": str(e)})
    finally: conn.close()

# ==========================================
# 2. PROPOSALS & PROJECT MANAGEMENT
# ==========================================

@app.route('/api/client/proposals/<int:client_id>', methods=['GET'])
def get_client_proposals(client_id):
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT p.proposal_id, p.project_name, p.proposal_description, p.status, p.rejection_reason,
            COALESCE(a.status, 'Pending') as approval_status,
            COALESCE(a.workflow_status, 'Reviewing') as current_stage,
            a.start_date, a.end_date
            FROM proposals p LEFT JOIN approvals a ON p.proposal_id = a.proposal_id
            WHERE p.client_id = ?
        """, (client_id,))
        return jsonify([dict(row) for row in cursor.fetchall()])
    finally: conn.close()

@app.route('/api/proposals/create', methods=['POST'])
def create_proposal():
    try:
        client_id = request.form.get('client_id')
        project_name = request.form.get('project_name')
        desc = request.form.get('description')
        service = request.form.get('service')
        image_path = ""
        if 'image' in request.files:
            file = request.files['image']
            if file.filename != '':
                filename = secure_filename(file.filename)
                filename = f"{client_id}_{int(datetime.datetime.now().timestamp())}_{filename}"
                path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(path)
                image_path = f"uploads/{filename}"
        
        conn = connect_db(); cursor = conn.cursor()
        cursor.execute("INSERT INTO proposals (client_id, project_name, proposal_description, services, client_image) VALUES (?, ?, ?, ?, ?)", 
                       (client_id, project_name, desc, service, image_path))
        conn.commit(); conn.close()
        return jsonify({"success": True})
    except Exception as e: return jsonify({"success": False, "message": str(e)})

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/proposals', methods=['GET'])
def get_all_proposals():
    conn = connect_db(); cursor = conn.cursor()
    try:
        # Fetches ALL details so Director is not "Blind"
        cursor.execute("""
            SELECT p.proposal_id, c.name as client_name, p.project_name, p.proposal_description, p.services, p.client_image, p.rejection_reason,
            CASE 
                WHEN p.status = 'Completed' THEN 'Completed'
                ELSE COALESCE(a.status, 'Pending') 
            END as status
            FROM proposals p 
            JOIN clients c ON p.client_id = c.client_id
            LEFT JOIN approvals a ON p.proposal_id = a.proposal_id
        """)
        return jsonify([dict(row) for row in cursor.fetchall()])
    finally: conn.close()

@app.route('/api/proposals/update_status', methods=['POST'])
def update_status():
    data = request.json
    conn = connect_db(); cursor = conn.cursor()
    try:
        status = data['status']
        reason = data.get('reason', None)

        cursor.execute("SELECT approval_id FROM approvals WHERE proposal_id = ?", (data['proposal_id'],))
        if cursor.fetchone():
            cursor.execute("UPDATE approvals SET status = ? WHERE proposal_id = ?", (status, data['proposal_id']))
        else:
            cursor.execute("INSERT INTO approvals (proposal_id, status) VALUES (?, ?)", (data['proposal_id'], status))
        
        # Saves Rejection Reason here
        cursor.execute("UPDATE proposals SET status = ?, rejection_reason = ? WHERE proposal_id = ?", (status, reason, data['proposal_id']))
        conn.commit()
        return jsonify({"success": True})
    finally: conn.close()

@app.route('/api/proposals/delete/<int:proposal_id>', methods=['DELETE'])
def delete_proposal(proposal_id):
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM proposals WHERE proposal_id = ?", (proposal_id,))
        cursor.execute("DELETE FROM approvals WHERE proposal_id = ?", (proposal_id,))
        conn.commit()
        return jsonify({"success": True})
    finally: conn.close()

@app.route('/api/director/project/<int:proposal_id>', methods=['GET'])
def get_project_details(proposal_id):
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT p.project_name, p.proposal_description, c.name as client_name,
            COALESCE(a.workflow_status, 'Design') as workflow_status, a.start_date, a.end_date
            FROM proposals p JOIN clients c ON p.client_id = c.client_id
            LEFT JOIN approvals a ON p.proposal_id = a.proposal_id
            WHERE p.proposal_id = ?
        """, (proposal_id,))
        row = cursor.fetchone()
        if row: return jsonify(dict(row))
        return jsonify({"success": False, "message": "Not found"}), 404
    finally: conn.close()

@app.route('/api/director/update_project', methods=['POST'])
def update_project_details():
    try:
        proposal_id = request.form.get('proposal_id')
        workflow_status = request.form.get('workflow_status')
        start_date = request.form.get('start_date')
        end_date = request.form.get('end_date')
        conn = connect_db(); cursor = conn.cursor()
        cursor.execute("UPDATE approvals SET workflow_status = ?, start_date = ?, end_date = ? WHERE proposal_id = ?", 
                       (workflow_status, start_date, end_date, proposal_id))
        conn.commit(); conn.close()
        return jsonify({"success": True})
    except Exception as e: return jsonify({"success": False, "message": str(e)})

# ==========================================
# 3. FINANCIALS (VENDORS/BILLS)
# ==========================================

@app.route('/api/director/vendors/<int:proposal_id>', methods=['GET'])
def get_vendors(proposal_id):
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("SELECT DISTINCT vendor_name FROM vendors")
        rows = cursor.fetchall()
        return jsonify([row[0] for row in rows])
    finally: conn.close()

@app.route('/api/director/bills/<int:proposal_id>', methods=['GET'])
def get_bills(proposal_id):
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM vendors WHERE proposal_id = ?", (proposal_id,))
        rows = cursor.fetchall()
        return jsonify([dict(row) for row in rows])
    finally: conn.close()

@app.route('/api/director/bills/add', methods=['POST'])
def add_bill():
    data = request.json
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO vendors (proposal_id, vendor_name, vendor_phone, vendor_type, material, quantity, price, purchase_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (data['proposal_id'], data['vendor_name'], data['vendor_phone'], data['vendor_type'], 
              data['material'], data['quantity'], data['price'], data['date']))
        conn.commit()
        return jsonify({"success": True})
    except Exception as e: return jsonify({"success": False, "message": str(e)})
    finally: conn.close()

@app.route('/api/director/payments/<int:proposal_id>', methods=['GET'])
def get_payments(proposal_id):
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM payments WHERE proposal_id = ? ORDER BY payment_id DESC", (proposal_id,))
        rows = cursor.fetchall()
        return jsonify([dict(row) for row in rows])
    finally: conn.close()

@app.route('/api/director/vendor_due', methods=['POST'])
def get_vendor_due():
    data = request.json
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("SELECT vendor_phone, vendor_type, SUM(quantity * price) FROM vendors WHERE proposal_id = ? AND vendor_name = ?", 
                       (data['proposal_id'], data['vendor_name']))
        result = cursor.fetchone()
        
        cursor.execute("SELECT SUM(amount) FROM payments WHERE proposal_id = ? AND vendor_name = ?", (data['proposal_id'], data['vendor_name']))
        paid_result = cursor.fetchone()
        total_paid = paid_result[0] if paid_result[0] else 0
        
        if result and result[2] is not None:
            return jsonify({"success": True, "phone": result[0], "type": result[1], "total_bill": result[2], "remaining": result[2] - total_paid})
        else:
            return jsonify({"success": False, "message": "No bills found"})
    finally: conn.close()

@app.route('/api/director/payments/add', methods=['POST'])
def add_payment():
    data = request.json
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO payments (proposal_id, serial_number, vendor_name, vendor_phone, vendor_type, amount, status, payment_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (data['proposal_id'], data['serial_number'], data['vendor_name'], data['vendor_phone'], 
              data['vendor_type'], data['amount'], data['status'], data['payment_date']))
        conn.commit()
        return jsonify({"success": True})
    except Exception as e: return jsonify({"success": False, "message": str(e)})
    finally: conn.close()

@app.route('/api/director/financial_summary/<int:proposal_id>', methods=['GET'])
def get_financial_summary(proposal_id):
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("SELECT SUM(quantity * price) FROM vendors WHERE proposal_id = ?", (proposal_id,))
        total_cost = cursor.fetchone()[0] or 0
        cursor.execute("SELECT SUM(amount) FROM payments WHERE proposal_id = ? AND status = 'Paid'", (proposal_id,))
        total_paid = cursor.fetchone()[0] or 0
        cursor.execute("SELECT COUNT(*) FROM vendors WHERE proposal_id = ?", (proposal_id,))
        bill_count = cursor.fetchone()[0] or 0
        return jsonify({"total_cost": total_cost, "total_paid": total_paid, "balance": total_cost - total_paid, "bill_count": bill_count})
    finally: conn.close()

@app.route('/api/director/vendor_orders/add', methods=['POST'])
def add_vendor_order():
    data = request.json
    conn = connect_db(); cursor = conn.cursor()
    try:
        for item in data['items']:
            cursor.execute("""
                INSERT INTO vendors (proposal_id, vendor_type, vendor_name, vendor_phone, material, quantity, price, purchase_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (data['proposal_id'], data['vendor_type'], data['vendor_name'], data['vendor_phone'], item['material'], item['quantity'], item['price'], item['date']))
        conn.commit()
        return jsonify({"success": True})
    except Exception as e: return jsonify({"success": False, "message": str(e)})
    finally: conn.close()

@app.route('/api/director/vendor_orders/<int:proposal_id>', methods=['GET'])
def get_vendor_history(proposal_id):
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("SELECT vendor_name, vendor_type, material, quantity, price, purchase_date, (quantity * price) as total FROM vendors WHERE proposal_id = ? ORDER BY vendor_id DESC", (proposal_id,))
        rows = cursor.fetchall()
        return jsonify([dict(row) for row in rows])
    finally: conn.close()

# ==========================================
# 4. WORKERS (HR)
# ==========================================

@app.route('/api/director/workers/<int:proposal_id>', methods=['GET'])
def get_workers(proposal_id):
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("SELECT worker_id, worker_name, worker_job FROM workers")
        return jsonify([dict(row) for row in cursor.fetchall()])
    finally: conn.close()

@app.route('/api/director/workers/add', methods=['POST'])
def add_worker():
    data = request.json
    conn = connect_db(); cursor = conn.cursor()
    try:
        username = data['worker_name'].lower().replace(" ", "")
        cursor.execute("INSERT INTO workers (username, password, worker_name, worker_job) VALUES (?, '123', ?, ?)", 
                       (username, data['worker_name'], data['worker_job']))
        conn.commit()
        return jsonify({"success": True})
    except Exception as e: return jsonify({"success": False, "message": str(e)})
    finally: conn.close()

@app.route('/api/director/workers/delete/<int:worker_id>', methods=['DELETE'])
def delete_worker(worker_id):
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM workers WHERE worker_id = ?", (worker_id,))
        conn.commit()
        return jsonify({"success": True})
    finally: conn.close()

# ==========================================
# 5. MANUFACTURING, WAREHOUSE & DELIVERY
# ==========================================

@app.route('/api/director/warehouse/<int:proposal_id>', methods=['GET'])
def get_warehouse_docs(proposal_id):
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, type, pdf_path FROM warehouse WHERE proposal_id = ?", (proposal_id,))
        result = [dict(row, filename=os.path.basename(row['pdf_path'])) for row in cursor.fetchall()]
        return jsonify(result)
    finally: conn.close()

@app.route('/api/director/warehouse/upload', methods=['POST'])
def upload_warehouse_doc():
    try:
        if 'file' not in request.files: return jsonify({"success": False, "message": "No file"})
        file = request.files['file']
        filename = secure_filename(f"wh_{request.form['proposal_id']}_{file.filename}")
        path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(path)
        conn = connect_db(); cursor = conn.cursor()
        cursor.execute("INSERT INTO warehouse (proposal_id, type, pdf_path) VALUES (?, ?, ?)", 
                       (request.form['proposal_id'], request.form['type'], path))
        conn.commit(); conn.close()
        return jsonify({"success": True})
    except Exception as e: return jsonify({"success": False, "message": str(e)})

@app.route('/api/director/manufacturing/<int:proposal_id>', methods=['GET'])
def get_manufacturing_tasks(proposal_id):
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT m.id, m.machines, m.work, w.worker_name, m.start_date, m.end_date, m.status 
            FROM management m JOIN workers w ON m.worker_id = w.worker_id WHERE m.proposal_id = ?
        """, (proposal_id,))
        return jsonify([dict(row) for row in cursor.fetchall()])
    finally: conn.close()

@app.route('/api/director/manufacturing/add', methods=['POST'])
def add_manufacturing_task():
    data = request.json
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO management (proposal_id, machines, work, worker_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)", 
                       (data['proposal_id'], data['machine'], data['work'], data['worker_id'], data['start_date'], data['end_date'], data['status']))
        conn.commit()
        return jsonify({"success": True})
    finally: conn.close()

# ==========================================
# 6. WORKER PORTAL & TASKS
# ==========================================

@app.route('/api/worker/projects', methods=['GET'])
def get_worker_projects():
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("SELECT proposal_id, project_name FROM proposals")
        return jsonify([dict(row) for row in cursor.fetchall()])
    finally: conn.close()

@app.route('/api/common/machines', methods=['GET'])
def get_active_machines():
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("SELECT machine_name FROM machines WHERE status = 'Active'")
        return jsonify([row['machine_name'] for row in cursor.fetchall()])
    finally: conn.close()

@app.route('/api/worker/log_machine', methods=['POST'])
def log_machine_usage():
    data = request.json
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("SELECT log_id FROM machine_logs WHERE worker_id = ? AND status = 'Active'", (data['worker_id'],))
        if cursor.fetchone():
            return jsonify({"success": False, "message": "You have an active session!"}), 403

        now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        cursor.execute("""
            INSERT INTO machine_logs (worker_id, worker_name, proposal_id, project_name, machine_name, hours_used, log_date, work_description, status, start_timestamp)
            VALUES (?, ?, ?, ?, ?, 0, ?, ?, 'Active', ?)
        """, (data['worker_id'], data['worker_name'], data['proposal_id'], data['project_name'], data['machine_name'], data['date'], data['work_description'], now))
        conn.commit()
        return jsonify({"success": True, "start_time": now})
    finally: conn.close()

@app.route('/api/worker/end_session', methods=['POST'])
def end_worker_session():
    data = request.json
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("SELECT start_timestamp FROM machine_logs WHERE worker_id = ? AND status = 'Active'", (data['worker_id'],))
        row = cursor.fetchone()
        if not row: return jsonify({"success": False, "message": "No active session found"}), 404
        
        start_time = datetime.datetime.strptime(row['start_timestamp'], '%Y-%m-%d %H:%M:%S')
        duration = datetime.datetime.now() - start_time
        hours = round(max(0.01, duration.total_seconds() / 3600), 2)

        cursor.execute("UPDATE machine_logs SET hours_used = ?, status = 'Completed' WHERE worker_id = ? AND status = 'Active'", (hours, data['worker_id']))
        conn.commit()
        return jsonify({"success": True, "hours": hours})
    finally: conn.close()

@app.route('/api/worker/tasks/<int:worker_id>', methods=['GET'])
def get_worker_tasks(worker_id):
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT log_id as id, project_name as title, work_description as description, 
                   machine_name as machines, hours_used as hours, log_date as date, 
                   'Utilization' as type, status, start_timestamp
            FROM machine_logs WHERE worker_id = ? ORDER BY log_id DESC
        """, (worker_id,))
        utilization_logs = [dict(row) for row in cursor.fetchall()]

        cursor.execute("""
            SELECT m.id, p.project_name as title, m.work as description, 
                   m.machines, 'N/A' as hours, m.end_date as end_date, 
                   'Assignment' as type, m.status
            FROM management m JOIN proposals p ON m.proposal_id = p.proposal_id 
            WHERE m.worker_id = ?
        """, (worker_id,))
        assignments = [dict(row) for row in cursor.fetchall()]

        return jsonify(utilization_logs + assignments)
    finally: conn.close()

@app.route('/api/worker/update-task/<int:task_id>', methods=['PUT'])
def update_task_status(task_id):
    data = request.json
    new_status = data.get('status')
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("UPDATE management SET status = ? WHERE id = ?", (new_status, task_id))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"success": False, "message": "Task not found"}), 404
        return jsonify({"success": True, "message": "Status updated successfully!"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally: conn.close()

@app.route('/api/worker/delete_log/<int:log_id>', methods=['DELETE'])
def delete_worker_log(log_id):
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM machine_logs WHERE log_id = ?", (log_id,))
        conn.commit()
        return jsonify({"success": True})
    finally: conn.close()

# ==========================================
# 7. MACHINE MANAGEMENT ROUTES
# ==========================================

@app.route('/api/director/machines/add', methods=['POST'])
def add_new_machine():
    data = request.json
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("SELECT machine_id FROM machines WHERE machine_name = ?", (data['machine_name'],))
        if cursor.fetchone():
            return jsonify({"success": False, "message": "Machine already exists"}), 400

        cursor.execute("INSERT INTO machines (machine_name, status) VALUES (?, 'Active')", (data['machine_name'],))
        conn.commit()
        return jsonify({"success": True})
    except Exception as e: return jsonify({"success": False, "message": str(e)}), 500
    finally: conn.close()

@app.route('/api/director/machine_usage_logs', methods=['POST'])
def get_specific_machine_logs():
    data = request.json
    machine_name = data.get('machine_name')
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT worker_name, project_name, log_date, hours_used, status 
            FROM machine_logs 
            WHERE machine_name LIKE ? 
            ORDER BY log_id DESC
        """, (f"%{machine_name}%",))
        return jsonify([dict(row) for row in cursor.fetchall()])
    finally: conn.close()

@app.route('/api/director/machine_logs/<int:proposal_id>', methods=['GET'])
def get_machine_logs(proposal_id):
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM machine_logs WHERE proposal_id = ? ORDER BY log_id DESC", (proposal_id,))
        return jsonify([dict(row) for row in cursor.fetchall()])
    finally: conn.close()

@app.route('/api/director/feedback/<int:proposal_id>', methods=['GET'])
def get_proposal_feedback(proposal_id):
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM feedback WHERE proposal_id = ?", (proposal_id,))
        return jsonify([dict(row) for row in cursor.fetchall()])
    finally: conn.close()

# ==========================================
# 8. LOGISTICS & COMPLETION (Unified)
# ==========================================

@app.route('/api/director/logistics/<int:proposal_id>', methods=['GET'])
def get_logistics_status(proposal_id):
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM logistics WHERE proposal_id = ?", (proposal_id,))
        row = cursor.fetchone()
        if row: return jsonify(dict(row))
        else: return jsonify({"stage": "Pending", "packer_id": "", "packing_date": "", "address": "", "tracking_id": ""})
    finally: conn.close()

@app.route('/api/director/logistics/pack', methods=['POST'])
def save_packing_stage():
    data = request.json
    conn = connect_db(); cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM logistics WHERE proposal_id = ?", (data['proposal_id'],))
        exists = cursor.fetchone()
        if exists:
            cursor.execute("UPDATE logistics SET stage = 'Packed', packer_id = ?, packing_date = ? WHERE proposal_id = ?", (data['packer_id'], data['packing_date'], data['proposal_id']))
        else:
            cursor.execute("INSERT INTO logistics (proposal_id, stage, packer_id, packing_date) VALUES (?, 'Packed', ?, ?)", (data['proposal_id'], data['packer_id'], data['packing_date']))
        conn.commit()
        return jsonify({"success": True})
    except Exception as e: return jsonify({"success": False, "message": str(e)}), 500
    finally: conn.close()

@app.route('/api/director/logistics/complete', methods=['POST'])
def complete_logistics_pipeline():
    data = request.json
    conn = connect_db(); cursor = conn.cursor()
    try:
        # 1. Update Logistics
        cursor.execute("""
            UPDATE logistics 
            SET stage = 'Delivered', address = ?, tracking_id = ? 
            WHERE proposal_id = ?
        """, (data['address'], data.get('tracking_id', ''), data['proposal_id']))

        # 2. Update Main Proposal Status
        cursor.execute("UPDATE proposals SET status = 'Completed' WHERE proposal_id = ?", (data['proposal_id'],))
        
        # 3. Close Workflow
        cursor.execute("UPDATE approvals SET workflow_status = 'Closed' WHERE proposal_id = ?", (data['proposal_id'],))

        conn.commit()
        return jsonify({"success": True})
    except Exception as e:
        print(f"Delivery Error: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    finally: conn.close()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)