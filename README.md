# Ollama with Open WebUI and Deepseek Model Deployment

This repository contains the necessary scripts and configurations to deploy Ollama, Open WebUI, and the Deepseek model using Docker and Docker Compose. The deployment is automated using Pulumi for infrastructure as code (IaC) on AWS.

## Prerequisites

- **Docker**: Ensure Docker is installed on your system.
- **Docker Compose**: Ensure Docker Compose is installed.
- **Pulumi**: Ensure Pulumi is installed and configured with your AWS credentials.
- **AWS Account**: Ensure you have an AWS account with the necessary permissions to create EC2 instances, security groups, and other resources.

## Deployment Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Configure Pulumi

Ensure you have the necessary configuration values set in `config.ts` or `Pulumi.<stack-name>.yaml`. These configurations include:

- `serviceName`: Name of the service.
- `vpcid`: VPC ID where the instance will be deployed.
- `instanceType`: EC2 instance type.
- `subnetid`: Subnet ID where the instance will be deployed.
- `amiid`: AMI ID for the EC2 instance.
- `keypair`: Key pair for SSH access.
- `rtvolumeSize`: Root volume size for the EC2 instance.

### 3. Deploy the Infrastructure

Run the following command to deploy the infrastructure using Pulumi:

```bash
pulumi up
```

This command will create an EC2 instance with Docker and Docker Compose installed, and it will deploy the services defined in the `docker-compose.yaml` file.

### 4. Access the Services

Once the deployment is complete, you can access the services as follows:

- **Open WebUI**: Open your browser and navigate to `http://<public-ip>`. The public IP will be output by Pulumi after the deployment.
- **Ollama**: The Ollama service will be running on port `11434`.

### 5. Pull the Deepseek Model

The Deepseek model will be automatically pulled and deployed by the `deepseek-pull` service defined in the `docker-compose.yaml` file. You can verify the model is available by running:

```bash
sudo docker exec -it ollama ollama list
```

### 6. Manage the Services

You can manage the services using Docker Compose commands:

- **Start the services**:

  ```bash
  docker-compose up -d
  ```

- **Stop the services**:

  ```bash
  docker-compose down
  ```

- **View logs**:

  ```bash
  docker-compose logs -f
  ```

## Docker Compose Configuration

The `docker-compose.yaml` file defines three services:

1. **Ollama**: The Ollama service running on port `11434`.
2. **Open WebUI**: The Open WebUI service running on port `80`.
3. **Deepseek-pull**: A service that pulls the Deepseek model (`deepseek-r1:7b`) and ensures it is available for use.

### Volumes

- `ollama`: Volume for Ollama data.
- `open-webui`: Volume for Open WebUI data.

### Networks

- `ollama-network`: A bridge network for communication between the services.

## Security Group Configuration

The security group allows inbound traffic on ports `22` (SSH), `80` (HTTP), and `443` (HTTPS). It also allows all outbound traffic.

## User Data Script

The EC2 instance is configured with a user data script that:

- Updates the system and installs Docker and Docker Compose.
- Adds the current user to the Docker group.
- Restarts and enables Docker.
- Writes the `docker-compose.yaml` file to the instance.
- Starts the Docker Compose services.

## Troubleshooting

- **Docker Permissions**: If you encounter permission issues, ensure the user has the necessary permissions to access Docker.
- **Service Health**: The `deepseek-pull` service depends on the `open-webui` service being healthy. If the `open-webui` service fails, the `deepseek-pull` service will not start.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Reference docs --
https://medium.com/@oleksii.bebych/run-deepseek-with-ollama-llm-and-open-webui-on-amazon-ec2-fabb2121f1fb

https://github.com/open-webui/open-webui

## Acknowledgments

- [Ollama](https://ollama.ai/)
- [Open WebUI](https://github.com/open-webui/open-webui)
- [Pulumi](https://www.pulumi.com/)

---

For any issues or questions, please open an issue in the repository.