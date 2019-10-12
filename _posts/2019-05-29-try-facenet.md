---
tags: Python cv
title: facenet動かしてみた
---

今自分のいる会社が人体認識顔識別な技術を使っていて、最近の OSS で自分でも試せそうなものないかなと思って調べてみた part2

part1 は[こちら](https://blog.taross-f.dev/try-tf-pose-estimation/)

# facenet

[![facenet](https://github-link-card.s3.ap-northeast-1.amazonaws.com/davidsandberg/facenet.png)](https://github.com/davidsandberg/facenet)

顔の特徴量を抜き出して比較できる、それぞれの顔で学習しなくても特徴のベクトルの距離で同一人物かどうかを検出できるみたい  
[OpenFace](https://github.com/cmusatyalab/openface)に inspire されてると  
ただ last update が 1 年前になっちゃってるので、まあデモ的な感じですかね

# 環境

- PC: MacBook Pro (2016)
- OS: mac OS Mojave
- CPU: 2 GHz Intel Core i5
- Memory: 8 GB 1867 MHz LPDDR3

# インストール

```
git clone git@github.com:davidsandberg/facenet.git

# python はとりあえず 3.6.5でためしている
cd facenet pyenv local 3.6.5
pip install -r requirements.txt

# https://drive.google.com/file/d/1EXPBSXwTaqrSC0OhUdXNmKSh9qJUQ55-/view からmodelをdownloadしておく
mkdir models
# とかして置いておく

# 比べたいテスト画像を
mkdir images
# とかして置いておく
```

# コード

デフォルトだと 1 枚の写真で複数の顔があると類似度が 1 人目の顔だけになるっぽい。のでちょっと表示を変えて元の画像で顔に ID 振るようにしてみた。

```
""Performs face alignment and calculates L2 distance between the embeddings of images."""

# MIT License
#
# Copyright (c) 2016 David Sandberg
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

from scipy import misc
import tensorflow as tf
import numpy as np
import sys
import os
import copy
import argparse
import facenet
import align.detect_face
import cv2
import functools


def main(args):

  images = load_and_align_data(args.image_files, args.image_size, args.margin, args.gpu_memory_fraction)
  with tf.Graph().as_default():
    with tf.Session() as sess:
      # Load the model
      facenet.load_model(args.model)

      # Get input and output tensors
      images_placeholder = tf.get_default_graph().get_tensor_by_name("input:0")
      embeddings = tf.get_default_graph().get_tensor_by_name("embeddings:0")
      phase_train_placeholder = tf.get_default_graph().get_tensor_by_name("phase_train:0")

      # Run forward pass to calculate embeddings
      feed_dict = {images_placeholder: images, phase_train_placeholder: False}
      emb = sess.run(embeddings, feed_dict=feed_dict)
      nrof_images = len(images)

      print('Images:')
      for i in range(len(args.image_files)):
        print('%1d: %s' % (i, args.image_files[i]))
      print('')

      # Print distance matrix
      print('Distance matrix')
      print('    ', end='')
      for i in range(nrof_images):
        print('    %1d     ' % i, end='')
      print('')
      for i in range(nrof_images):
        print('%1d  ' % i, end='')
        for j in range(nrof_images):
          dist = np.sqrt(np.sum(np.square(np.subtract(emb[i, :], emb[j, :]))))
          print('  %1.4f  ' % dist, end='')
        print('')
  cv2.waitKey(0)
  cv2.destroyAllWindows()


def load_and_align_data(image_paths, image_size, margin, gpu_memory_fraction):

  minsize = 20  # minimum size of face
  threshold = [0.6, 0.7, 0.7]  # three steps's threshold
  factor = 0.709  # scale factor

  print('Creating networks and loading parameters')
  with tf.Graph().as_default():
    gpu_options = tf.GPUOptions(per_process_gpu_memory_fraction=gpu_memory_fraction)
    sess = tf.Session(config=tf.ConfigProto(gpu_options=gpu_options, log_device_placement=False))
    with sess.as_default():
      pnet, rnet, onet = align.detect_face.create_mtcnn(sess, None)

  tmp_image_paths = copy.copy(image_paths)
  img_list = []
  img_no = 0
  for image in tmp_image_paths:
    img = misc.imread(os.path.expanduser(image), mode='RGB')
    img_size = np.asarray(img.shape)[0:2]
    bounding_boxes, _ = align.detect_face.detect_face(img, minsize, pnet, rnet, onet, threshold, factor)
    if len(bounding_boxes) < 1:
      image_paths.remove(image)
      print("can't detect face, remove ", image)
      continue
    img2 = cv2.imread(os.path.expanduser(image))
    for box in bounding_boxes:
      # この辺で顔に番号を振っている
      img2 = cv2.rectangle(img2, (int(box[0]), int(box[1])), (int(box[2]), int(box[3])), (0, 255, 0), 1)
      cv2.putText(img2, str(img_no), ((int(box[0]) + int(box[2])) // 2, (int(box[1]) + int(box[3])) // 2),
                  cv2.FONT_HERSHEY_PLAIN, 2, (255, 255, 0), 5)
      img_no += 1
    cv2.imshow(f'test{img_no}', img2)
    for i in range(len(bounding_boxes)):
      det = np.squeeze(bounding_boxes[i, 0:4])
      bb = np.zeros(4, dtype=np.int32)
      bb[0] = np.maximum(det[0] - margin / 2, 0)
      bb[1] = np.maximum(det[1] - margin / 2, 0)
      bb[2] = np.minimum(det[2] + margin / 2, img_size[1])
      bb[3] = np.minimum(det[3] + margin / 2, img_size[0])
      cropped = img[bb[1]:bb[3], bb[0]:bb[2], :]
      aligned = misc.imresize(cropped, (image_size, image_size), interp='bilinear')
      prewhitened = facenet.prewhiten(aligned)
      img_list.append(prewhitened)
  images = np.stack(img_list)
  return images


def parse_arguments(argv):
  parser = argparse.ArgumentParser()

  parser.add_argument('model', type=str,
                      help='Could be either a directory containing the meta_file and ckpt_file or a model protobuf (.pb) file')
  parser.add_argument('image_files', type=str, nargs='+', help='Images to compare')
  parser.add_argument('--image_size', type=int,
                      help='Image size (height, width) in pixels.', default=160)
  parser.add_argument('--margin', type=int,
                      help='Margin for the crop around the bounding box (height, width) in pixels.', default=44)
  parser.add_argument('--gpu_memory_fraction', type=float,
                      help='Upper bound on the amount of GPU memory that will be used by the process.', default=1.0)
  return parser.parse_args(argv)


if __name__ == '__main__':
  main(parse_arguments(sys.argv[1:]))

```

# 実行してみると

以下のような画面が出て顔識別できてそうで、ID も振られてますね

![result](/images/screenshot_20190529.png "screenshot")

```
Creating networks and loading parameters
2019-05-29 00:27:43.585356: I tensorflow/core/platform/cpu_feature_guard.cc:140] Your CPU supports instructions that this TensorFlow binary was not compiled to use: AVX2 FMA
Model directory: models/20180402-114759
Metagraph file: model-20180402-114759.meta
Checkpoint file: model-20180402-114759.ckpt-275
Images:
0: images/nissinIMGL1032_TP_V4.jpg
1: images/saya12050I9A1675_TP_V4.jpg
2: images/akanesaya501IMGL3229_TP_V4.jpg

Distance matrix
        0         1         2
0    0.0000    1.0826    0.9648
1    1.0826    0.0000    0.6487
2    0.9648    0.6487    0.0000
```

結果の`Distance matrix`で各 ID 間の距離が出てます

id1,2 は同一人物、id0 は別人なので、しきい値を例えば 0.8 くらいに設定してたら同一人物かどうかの判定もできてる

# まとめ

顔の類似度はそれぞれの顔を学習しなくても特徴点の類似度で結構判別できるものですねー  
しきい値うまく調整すれば取りたいレベルで取れそう

次回は Intel の本気が見れる? [OpenVINO](https://docs.openvinotoolkit.org/) について書きたい気持ちがあります

<iframe src="https://rcm-fe.amazon-adsystem.com/e/cm?o=9&p=288&l=ur1&category=musicunlimited&banner=16ETYA43WQV6H01G3982&f=ifr&linkID=613b340ea7107b05dbeba8cd4022946a&t=tarossf-22&tracking_id=tarossf-22" width="320" height="50" scrolling="no" border="0" marginwidth="0" style="border:none;" frameborder="0"></iframe>
