module "network" {
  source = "../../modules/network"

  cloud = "aws"
  tags = {
    env = "dev"
  }
}

module "core" {
  source      = "../../modules/core"
  environment = "dev"
  network_id  = module.network.network_id
  tags = {
    env = "dev"
  }
}

output "core_identity" {
  value = module.core.service_identity
}
