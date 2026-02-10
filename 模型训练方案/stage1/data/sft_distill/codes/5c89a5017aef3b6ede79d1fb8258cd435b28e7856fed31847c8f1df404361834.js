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
  // 创建 Graphics 对象绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x00aaff, 1);
  
  // 绘制三角形（使用 beginPath 和 fillPath）
  graphics.beginPath();
  graphics.moveTo(400, 200); // 顶点
  graphics.lineTo(300, 400); // 左下角
  graphics.lineTo(500, 400); // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 设置初始透明度为 0（完全透明）
  graphics.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: graphics,
    alpha: 1, // 目标透明度：完全不透明
    duration: 4000, // 持续时间 4 秒
    ease: 'Linear', // 线性渐变
    repeat: -1, // 无限循环
    yoyo: false // 不反向播放，只是从 0 到 1 循环
  });
  
  // 添加文字说明
  this.add.text(400, 500, 'Triangle fading in (4s loop)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);