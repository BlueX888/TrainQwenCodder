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
  // 使用 Graphics 绘制一个方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色方块
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('square', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建方块精灵并设置位置
  const square = this.add.sprite(400, 300, 'square');
  
  // 设置初始透明度为 0（完全透明）
  square.setAlpha(0);
  
  // 创建 Tween 动画：3 秒内从透明（alpha=0）到不透明（alpha=1）
  this.tweens.add({
    targets: square,           // 动画目标对象
    alpha: 1,                  // 目标透明度值
    duration: 3000,            // 持续时间 3 秒
    ease: 'Linear',            // 线性缓动
    yoyo: true,                // 反向播放（从 1 回到 0）
    repeat: -1                 // 无限循环（-1 表示永久重复）
  });
  
  // 添加文字提示
  this.add.text(400, 500, 'Square fading in/out (3s cycle)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);