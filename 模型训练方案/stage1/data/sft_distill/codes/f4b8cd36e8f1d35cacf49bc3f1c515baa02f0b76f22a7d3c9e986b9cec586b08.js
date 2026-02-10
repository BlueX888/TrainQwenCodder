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
  // 使用 Graphics 绘制青色三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为青色
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制三角形（等边三角形）
  // 中心点在 (50, 50)，边长约 80
  graphics.beginPath();
  graphics.moveTo(50, 10);      // 顶点
  graphics.lineTo(10, 90);      // 左下
  graphics.lineTo(90, 90);      // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 100, 100);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建三角形精灵并放置在屏幕中心
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 设置原点为中心，使旋转围绕中心进行
  triangle.setOrigin(0.5, 0.5);
  
  // 创建旋转动画
  this.tweens.add({
    targets: triangle,           // 动画目标对象
    angle: 360,                  // 旋转到 360 度
    duration: 1000,              // 持续时间 1 秒
    ease: 'Linear',              // 线性缓动，保持匀速旋转
    repeat: -1,                  // 无限循环 (-1 表示永久重复)
    onRepeat: function() {
      // 每次重复时重置角度，避免累积
      triangle.angle = 0;
    }
  });
}

new Phaser.Game(config);