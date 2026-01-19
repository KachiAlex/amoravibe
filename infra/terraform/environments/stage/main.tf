module "network" {
  source = "../../modules/network"

  cloud = "aws"
  tags = {
    env = "stage"
  }
}

module "core" {
  source      = "../../modules/core"
  environment = "stage"
  network_id  = module.network.network_id
  tags = {
    env = "stage"
  }
}

output "core_identity" {
  value = module.core.service_identity
}
