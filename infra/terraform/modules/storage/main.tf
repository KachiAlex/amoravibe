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

variable "tags" {
  type        = map(string)
  default     = {}
  description = "Resource tags"
}

locals {
  base_tags = merge({
    app         = "lovedate"
    environment = var.environment
    managed     = "terraform"
  }, var.tags)
}

resource "aws_s3_bucket" "pii" {
  bucket = "${local.base_tags.environment}-lovedate-pii"

  tags = merge(local.base_tags, {
    data_classification = "pii"
  })
}

resource "aws_s3_bucket_versioning" "pii" {
  bucket = aws_s3_bucket.pii.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "pii" {
  bucket = aws_s3_bucket.pii.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket" "media" {
  bucket = "${local.base_tags.environment}-lovedate-media"

  tags = merge(local.base_tags, {
    data_classification = "media"
  })
}

resource "aws_s3_bucket_public_access_block" "media" {
  bucket = aws_s3_bucket.media.id
  block_public_acls   = true
  block_public_policy = true
  ignore_public_acls  = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "media" {
  bucket = aws_s3_bucket.media.id

  rule {
    id     = "media-glacier-transition"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "GLACIER"
    }
  }
}

resource "aws_s3_bucket" "logs" {
  bucket = "${local.base_tags.environment}-lovedate-logs"

  tags = merge(local.base_tags, {
    data_classification = "logs"
  })
}

resource "aws_s3_bucket_lifecycle_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    id     = "logs-expire"
    status = "Enabled"

    expiration {
      days = 30
    }
  }
}

output "bucket_pi" {
  description = "PII bucket name"
  value       = aws_s3_bucket.pii.bucket
}

output "bucket_media" {
  description = "Media bucket name"
  value       = aws_s3_bucket.media.bucket
}

output "bucket_logs" {
  description = "Logs bucket name"
  value       = aws_s3_bucket.logs.bucket
}
