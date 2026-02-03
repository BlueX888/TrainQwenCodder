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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制一个方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色方块
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('square', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建 Sprite 并设置到屏幕中心
  const square = this.add.sprite(400, 300, 'square');
  
  // 设置初始透明度为 0（完全透明）
  square.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: square,           // 动画目标对象
    alpha: 1,                  // 目标透明度值（完全不透明）
    duration: 1000,            // 持续时间 1 秒（1000 毫秒）
    ease: 'Linear',            // 线性缓动
    yoyo: true,                // 反向播放（从 1 回到 0）
    repeat: -1                 // 无限循环（-1 表示永久重复）
  });
  
  // 添加提示文本
  this.add.text(400, 500, '方块透明度循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

// 创建游戏实例
new Phaser.Game(config);