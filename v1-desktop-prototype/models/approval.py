class Approval:
    def __init__(self, approval_id, proposal_id, status, output_design_pdf_path, output_detail_pdf_path, start_date, end_date):
        self.approval_id = approval_id
        self.proposal_id = proposal_id
        self.status = status
        self.output_design_pdf_path = output_design_pdf_path
        self.output_detail_pdf_path = output_detail_pdf_path
        self.start_date = start_date
        self.end_date = end_date
