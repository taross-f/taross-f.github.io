---
tags: OpenVINO Python
title: OpenVINO 2020.4 動かしてみた
---

[OpenVINO](https://docs.openvinotoolkit.org/) を Mac 上で気軽に動かしたい気持ちになったので書きます

# OpenVINO とは

インテルが NVIDIA の GPU 一強に待ったをかけるつもりかどうかはわかりませんが、インテルのハードウェア上でのみ動作する推論を行う SDK です。インテルのハードウェアに特化してチューニングされているようで Intel 製の GPU も推論に使うことができて、よくある画像認識 OSS などの動作と比べてかなり軽快です。安価なエッジでの推論に特に向いていそうです

またオフィシャルな Pre-Trained Model がたくさんあって、小売店用とか自動運転用とか[モデル](https://github.com/openvinotoolkit/open_model_zoo)があります

# インストール

ホストマシンへのインストールが手順が多くて大変、だけど動かすだけならリファレンスの Dockerfile でほぼいけます
[Linux Docker 向けリファレンス(アカウント登録要)](https://docs.openvinotoolkit.org/latest/_docs_install_guides_installing_openvino_docker_linux.html)があって、保証されてないけど Mac 上でも動きます。ただしコンテナからホスト Mac の Webcam とか GPU にアクセスする方法が非常にめんどくさそう、というかできなそうなのでそこだけ注意ですね

# DEMO 実行

2020/9/15 現在 `2020.4` が最新バージョンのよう。以下は libpython のバージョン指定と USER を変えています。インストールが Mac 上でも走るようにするのと、Demo 実行のため

`ARG package_url=http://registrationcenter-download.intel.com/akdlm/irc_nas/16803/l_openvino_toolkit_p_0000.0.000.tgz` この部分だけはオフィシャルでもログインしてダウンロードリンクをコピって来てね、となっているのでコピってきます

[Gist](https://gist.github.com/taross-f/0daad7051232f6ee95c24214102f369f)

```
FROM ubuntu:18.04
USER root
WORKDIR /
SHELL ["/bin/bash", "-xo", "pipefail", "-c"]
# Creating user openvino
RUN useradd -ms /bin/bash openvino && \
  chown openvino -R /home/openvino
ARG DEPENDENCIES="autoconf \
  automake \
  build-essential \
  cmake \
  cpio \
  curl \
  gnupg2 \
  libdrm2 \
  libglib2.0-0 \
  lsb-release \
  libgtk-3-0 \
  libtool \
  udev \
  unzip \
  sudo \
  dos2unix"
RUN apt-get update && \
  apt-get install -y --no-install-recommends ${DEPENDENCIES} && \
  rm -rf /var/lib/apt/lists/*
WORKDIR /thirdparty
RUN sed -Ei 's/# deb-src /deb-src /' /etc/apt/sources.list && \
  apt-get update && \
  apt-get source ${DEPENDENCIES} && \
  rm -rf /var/lib/apt/lists/*
# setup Python
ENV PYTHON python3.6
# fix libpython versioning
RUN apt-get update && \
  apt-get install -y --no-install-recommends python3-pip python3-dev lib${PYTHON} && \
  rm -rf /var/lib/apt/lists/*
# get URL from OpenVINO Web with log-in
ARG package_url=http://registrationcenter-download.intel.com/akdlm/irc_nas/16803/l_openvino_toolkit_p_0000.0.000.tgz
ARG TEMP_DIR=/tmp/openvino_installer
WORKDIR ${TEMP_DIR}
ADD ${package_url} ${TEMP_DIR}
# install product by installation script
ENV INTEL_OPENVINO_DIR /opt/intel/openvino
RUN tar -xzf ${TEMP_DIR}/*.tgz --strip 1
RUN sed -i 's/decline/accept/g' silent.cfg && \
  ${TEMP_DIR}/install.sh -s silent.cfg && \
  ${INTEL_OPENVINO_DIR}/install_dependencies/install_openvino_dependencies.sh
WORKDIR /tmp
RUN rm -rf ${TEMP_DIR}
# installing dependencies for package
WORKDIR /tmp
RUN ${PYTHON} -m pip install --no-cache-dir setuptools && \
  find "${INTEL_OPENVINO_DIR}/" -type f -name "*requirements*.*" -path "*/${PYTHON}/*" -exec ${PYTHON} -m pip install --no-cache-dir -r "{}" \; && \
  find "${INTEL_OPENVINO_DIR}/" -type f -name "*requirements*.*" -not -path "*/post_training_optimization_toolkit/*" -not -name "*windows.txt"  -not -name "*ubuntu16.txt" -not -path "*/python3*/*" -not -path "*/python2*/*" -exec ${PYTHON} -m pip install --no-cache-dir -r "{}" \;
WORKDIR ${INTEL_OPENVINO_DIR}/deployment_tools/open_model_zoo/tools/accuracy_checker
RUN source ${INTEL_OPENVINO_DIR}/bin/setupvars.sh && \
  ${PYTHON} -m pip install --no-cache-dir -r ${INTEL_OPENVINO_DIR}/deployment_tools/open_model_zoo/tools/accuracy_checker/requirements.in && \
  ${PYTHON} ${INTEL_OPENVINO_DIR}/deployment_tools/open_model_zoo/tools/accuracy_checker/setup.py install
WORKDIR ${INTEL_OPENVINO_DIR}/deployment_tools/tools/post_training_optimization_toolkit
RUN if [ -f requirements.txt ]; then \
  ${PYTHON} -m pip install --no-cache-dir -r ${INTEL_OPENVINO_DIR}/deployment_tools/tools/post_training_optimization_toolkit/requirements.txt && \
  ${PYTHON} ${INTEL_OPENVINO_DIR}/deployment_tools/tools/post_training_optimization_toolkit/setup.py install; \
  fi;
# Post-installation cleanup and setting up OpenVINO environment variables
RUN if [ -f "${INTEL_OPENVINO_DIR}"/bin/setupvars.sh ]; then \
  printf "\nsource \${INTEL_OPENVINO_DIR}/bin/setupvars.sh\n" >> /home/openvino/.bashrc; \
  printf "\nsource \${INTEL_OPENVINO_DIR}/bin/setupvars.sh\n" >> /root/.bashrc; \
  fi;
RUN find "${INTEL_OPENVINO_DIR}/" -name "*.*sh" -type f -exec dos2unix {} \;
USER openvino
# needs root for demo
USER root
WORKDIR ${INTEL_OPENVINO_DIR}
```

あとはビルドして実行

```
docker build .
docker run -it --rm <IMAGE> bash

# in container
./deployment_tools/demo/demo_squeezenet_download_convert_run.sh
```

で、モデルダウンロードしてビルドして実行して、ってやってくれます。他の Demo は Mac 上だとなかなか動かすのは大変かもしれない

動かした結果は以下のようになります

```
classid probability label
------- ----------- -----
817     0.6853030   sports car, sport car
479     0.1835197   car wheel
511     0.0917197   convertible
436     0.0200694   beach wagon, station wagon, wagon, estate car, beach waggon, station waggon, waggon
751     0.0069604   racer, race car, racing car
656     0.0044177   minivan
717     0.0024739   pickup, pickup truck
581     0.0017788   grille, radiator grille
468     0.0013083   cab, hack, taxi, taxicab
661     0.0007443   Model T

[ INFO ] Execution successful

[ INFO ] This sample is an API example, for any performance measurements please use the dedicated benchmark_app tool


###################################################

Demo completed successfully.
```

# サンプル

リファレンス上にもサンプルたくさんあったり、 [hampen2929/pyvino](https://github.com/hampen2929/pyvino) なんて Python でのサンプルを作っている人がいて非常に有用です
