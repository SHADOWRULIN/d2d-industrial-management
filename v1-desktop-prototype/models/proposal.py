class Proposal:
    def __init__(self, proposal_id, client_id, project_name, description, services, image_path, status):
        self.proposal_id = proposal_id
        self.client_id = client_id
        self.project_name = project_name
        self.description = description
        self.services = services
        self.image_path = image_path
        self.status = status
