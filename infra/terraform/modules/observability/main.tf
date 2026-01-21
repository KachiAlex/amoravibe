terraform {
  required_version = ">= 1.6.2"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.30"
    }
  }
}

variable "environment" {
  type        = string
  description = "Deployment environment"
}

variable "region" {
  type        = string
  description = "Cloud region for telemetry stack"
}

variable "otel_config_path" {
  type        = string
  description = "Path to OpenTelemetry collector config file"
}

variable "dashboards_dir" {
  type        = string
  description = "Directory containing Grafana dashboard JSON"
}

variable "tags" {
  type        = map(string)
  description = "Common tags applied to observability resources"
  default     = {}
}

locals {
  base_tags = merge({
    app         = "lovedate"
    environment = var.environment
    managed     = "terraform"
  }, var.tags)
}

resource "null_resource" "observability_stack" {
  triggers = {
    env             = var.environment
    region          = var.region
    otel_config     = filesha1(var.otel_config_path)
    dashboards_path = var.dashboards_dir
  }
}

output "observability_id" {
  description = "Placeholder identifier for observability stack"
  value       = null_resource.observability_stack.id
}

output "collector_config_path" {
  description = "Resolved path to Otel config"
  value       = var.otel_config_path
}

output "dashboards_directory" {
  description = "Resolved dashboards directory"
  value       = var.dashboards_dir
}
