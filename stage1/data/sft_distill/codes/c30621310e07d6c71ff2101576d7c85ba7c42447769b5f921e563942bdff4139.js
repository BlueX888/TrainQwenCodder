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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(0, -50);      // 顶点
  graphics.lineTo(-43, 25);     // 左下角
  graphics.lineTo(43, 25);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 将 Graphics 生成为纹理
  graphics.generateTexture('triangle', 86, 75);
  
  // 销毁 Graphics 对象（已生成纹理，不再需要）
  graphics.destroy();
  
  // 创建使用三角形纹理的 Sprite
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 设置初始透明度为 0（完全透明）
  triangle.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: triangle,           // 动画目标对象
    alpha: 1,                    // 目标透明度值（完全不透明）
    duration: 2000,              // 动画持续时间 2 秒
    ease: 'Linear',              // 线性缓动
    yoyo: true,                  // 反向播放（从 1 回到 0）
    repeat: -1                   // 无限循环（-1 表示永久重复）
  });
  
  // 添加说明文字
  this.add.text(400, 500, '三角形透明度循环动画 (2秒周期)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);