import * as aws from "@pulumi/aws";
import * as config from "./config";

const sg = new aws.ec2.SecurityGroup(config.serviceName, {
    vpcId: config.vpcid,
    ingress: [
        { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 443, toPort: 443, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 8080, toPort: 8080, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 3000, toPort: 3000, cidrBlocks: ["0.0.0.0/0"] },
    ],
    egress: [
        { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
    ],
});

const userDataScript = `#!/bin/bash
sudo apt update -y
sudo apt install -y docker.io
sudo usermod -aG docker $USER
newgrp docker
sleep 15
sudo chmod 777 /var/run/docker.sock
sudo systemctl enable docker
sudo systemctl start docker
sudo systemctl restart docker
# Step 1: Run Ollama container
docker run -d \
  -v ollama:/root/.ollama \
  -p 11434:11434 \
  -e OLLAMA_HOST=0.0.0.0 \
  --name ollama \
  ollama/ollama

# Step 2: Pull the deepseek-r1:8b model
docker exec -it ollama ollama pull deepseek-r1:7b

# Step 3: Run Open WebUI container
docker run -d \
  -p 3000:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  -e OLLAMA_API_BASE_URL=http://host.docker.internal:11434 \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:main`;

const instance = new aws.ec2.Instance(config.serviceName, {
    instanceType: config.instanceType,
    subnetId: config.subnetid, // replace with your subnet ID
    associatePublicIpAddress: true,
    ami: config.amiid,
    keyName: config.keypair, 
    vpcSecurityGroupIds: [sg.id], // replace with your security groupid
    userData: userDataScript,
    rootBlockDevice: {
        volumeSize: Number(config.rtvolumeSize), //convert to number from string 
        volumeType: "gp3",
        deleteOnTermination: true,
    },
    tags: {
        Name: config.serviceName,
    },
});

export const publicIp = instance.publicIp;