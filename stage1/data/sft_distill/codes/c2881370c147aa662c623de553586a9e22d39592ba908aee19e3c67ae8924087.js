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
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  
  // 设置菱形颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（四个顶点）
  // 中心点在 (50, 50)，尺寸为 100x100
  graphics.beginPath();
  graphics.moveTo(50, 0);    // 上顶点
  graphics.lineTo(100, 50);  // 右顶点
  graphics.lineTo(50, 100);  // 下顶点
  graphics.lineTo(0, 50);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建使用菱形纹理的精灵
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置初始透明度为 0（完全透明）
  diamond.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明
  this.tweens.add({
    targets: diamond,           // 动画目标对象
    alpha: 1,                   // 目标透明度值
    duration: 1500,             // 持续时间 1.5 秒
    ease: 'Linear',             // 线性缓动
    yoyo: true,                 // 反向播放（从 1 回到 0）
    repeat: -1                  // 无限循环 (-1 表示永久重复)
  });
  
  // 添加提示文本
  this.add.text(400, 500, 'Diamond fading animation (1.5s loop)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);