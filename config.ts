import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
export const vpcid = config.require("vpcid");
export const subnetid = config.require("subnetid");
export const keypair = config.require("keypair");

export const amiid = config.require("amiid"); 
export const instanceType = config.require("instanceType");
export const rtvolumeSize = config.require("rtvolumeSize");
export const dtvolumeSize = config.require("dtvolumeSize");
export const serviceName = config.require("serviceName");
