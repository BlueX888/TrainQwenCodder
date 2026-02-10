const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制红色三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为红色
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制三角形（等边三角形）
  // 中心点在 (60, 60)，半径约 50
  graphics.beginPath();
  graphics.moveTo(60, 10);  // 顶点
  graphics.lineTo(110, 100); // 右下角
  graphics.lineTo(10, 100);  // 左下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 120, 120);
  
  // 销毁 graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 创建使用三角形纹理的精灵，放置在屏幕中心
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 设置精灵的原点为中心（默认已经是 0.5, 0.5）
  triangle.setOrigin(0.5, 0.5);
  
  // 创建旋转动画
  this.tweens.add({
    targets: triangle,           // 动画目标对象
    angle: 360,                  // 旋转到 360 度
    duration: 4000,              // 持续时间 4 秒
    ease: 'Linear',              // 线性缓动，匀速旋转
    repeat: -1,                  // 无限循环 (-1 表示永远重复)
    yoyo: false                  // 不需要来回播放
  });
  
  // 添加提示文本
  const text = this.add.text(400, 500, '红色三角形旋转动画 (4秒/圈)', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5, 0.5);
}

new Phaser.Game(config);