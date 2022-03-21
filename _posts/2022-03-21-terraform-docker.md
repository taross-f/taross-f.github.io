---
tags: Terraform Docker
title: tfsec tflint入りのTerraform実行環境をDockerで作る
---


Terraformの実行環境をDockerで構築しつつtfsecとtflintも動かせるようにしたくなってつくりました。これにTerraformのコードをvolumeでマウントして実行すると良さげです

# コード

Dockerfile
```Dockerfile
FROM hashicorp/terraform
RUN apk update
RUN apk add curl sudo unzip make
RUN curl https://raw.githubusercontent.com/terraform-linters/tflint/v0.24.1/install_linux.sh | sh
RUN curl -Lso tfsec https://github.com/tfsec/tfsec/releases/download/v0.34.0/tfsec-linux-amd64
RUN chmod +x tfsec && mv tfsec /usr/local/bin/
```
