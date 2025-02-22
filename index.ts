import * as pulumi from "@pulumi/pulumi";
import * as ec2 from "./main"

export const publicIpAdd = ec2.publicIp;
