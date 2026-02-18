variable "environment" {
  description = "Deployment environment (dev|stage|prod)."
  type        = string
}

variable "network_id" {
  description = "ID from network module"
  type        = string
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}

locals {
  base_tags = merge(
    {
      app         = "lovedate"
      environment = var.environment
      managed     = "terraform"
    },
    var.tags
  )
}

resource "null_resource" "core_services" {
  triggers = {
    env        = var.environment
    network_id = var.network_id
  }
}

output "service_identity" {
  description = "Placeholder service identity output"
  value       = "core-${var.environment}"
}
