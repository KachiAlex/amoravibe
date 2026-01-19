module "network" {
  source = "../../modules/network"

  cloud = "aws"
  tags = {
    env = "prod"
  }
}

module "core" {
  source      = "../../modules/core"
  environment = "prod"
  network_id  = module.network.network_id
  tags = {
    env = "prod"
  }
}

output "core_identity" {
  value = module.core.service_identity
}
