terraform {
  required_version = ">= 1.6.2"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.99"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.30"
    }
  }
}

variable "cloud" {
  description = "Target cloud provider (aws|azure)."
  type        = string
  default     = "aws"
}

variable "tags" {
  description = "Common resource tags"
  type        = map(string)
  default     = {}
}

locals {
  base_tags = merge(
    {
      app     = "lovedate"
      env     = var.tags["env"]
      managed = "terraform"
    },
    var.tags
  )
}

# TODO: implement actual network resources per cloud
resource "null_resource" "network_placeholder" {
  triggers = {
    cloud = var.cloud
  }
}

output "network_id" {
  description = "Placeholder network identifier"
  value       = null_resource.network_placeholder.id
}
