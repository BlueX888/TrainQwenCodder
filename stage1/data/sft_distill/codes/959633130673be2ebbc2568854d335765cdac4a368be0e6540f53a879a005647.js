const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(-50, -50, 100, 100); // 以中心点为原点绘制
  
  // 将矩形放置在画布中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 创建缩放动画
  this.tweens.add({
    targets: graphics,
    scaleX: 0.16,      // 缩放到 16%
    scaleY: 0.16,      // 缩放到 16%
    duration: 2000,    // 2秒完成缩放
    yoyo: true,        // 往返效果（缩放后恢复）
    repeat: -1,        // 无限循环
    ease: 'Linear'     // 线性缓动
  });
  
  // 添加文字说明
  this.add.text(400, 50, 'Rectangle scaling to 16% and back', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);