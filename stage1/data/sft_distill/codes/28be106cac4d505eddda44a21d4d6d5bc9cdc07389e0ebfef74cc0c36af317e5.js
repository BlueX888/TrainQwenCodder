const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建一个矩形图形对象
  const rectangle = this.add.graphics();
  
  // 设置填充颜色为蓝色
  rectangle.fillStyle(0x3498db, 1);
  
  // 绘制一个居中的矩形（200x150）
  const rectX = 300;
  const rectY = 225;
  const rectWidth = 200;
  const rectHeight = 150;
  rectangle.fillRect(rectX, rectY, rectWidth, rectHeight);
  
  // 设置初始透明度为 0（完全透明）
  rectangle.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，4 秒循环播放
  this.tweens.add({
    targets: rectangle,        // 动画目标对象
    alpha: 1,                  // 目标透明度值（完全不透明）
    duration: 4000,            // 持续时间 4 秒（4000 毫秒）
    ease: 'Linear',            // 线性缓动
    loop: -1,                  // 无限循环
    yoyo: false                // 不回放（只从 0 到 1，然后重新开始）
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Rectangle fading in (4s loop)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);