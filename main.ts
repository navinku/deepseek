import * as aws from "@pulumi/aws";
import * as config from "./config";
import * as fs from "fs";
import * as path from "path"

const dockerComposeFile = fs.readFileSync(path.join(__dirname, "./docker-compose.yaml"), "utf-8");
const dockerComposeBase64 = Buffer.from(dockerComposeFile).toString("base64");

const sg = new aws.ec2.SecurityGroup(config.serviceName, {
    vpcId: config.vpcid,
    ingress: [
        { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 443, toPort: 443, cidrBlocks: ["0.0.0.0/0"] },
    ],
    egress: [
        { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
    ],
});

const userDataScript = `#!/bin/bash
sudo apt update -y
sudo apt install -y docker.io
sudo apt install -y docker-compose
sudo usermod -aG docker $USER
newgrp docker
sleep 15
sudo chmod 777 /var/run/docker.sock
sudo systemctl enable docker
sudo systemctl start docker
sudo systemctl restart docker
sleep 10
cat <<EOF > /home/ubuntu/docker-compose.yaml
$(echo ${dockerComposeBase64} | base64 --decode)
EOF

cd /home/ubuntu

docker-compose up -d`;

const instance = new aws.ec2.Instance(config.serviceName, {
    instanceType: config.instanceType,
    subnetId: config.subnetid, 
    associatePublicIpAddress: true,
    ami: config.amiid,
    keyName: config.keypair, 
    vpcSecurityGroupIds: [sg.id], 
    userData: userDataScript,
    rootBlockDevice: {
        volumeSize: Number(config.rtvolumeSize), 
        volumeType: "gp3",
        deleteOnTermination: true,
    },
    tags: {
        Name: config.serviceName,
    },
});

export const publicIp = instance.publicIp;