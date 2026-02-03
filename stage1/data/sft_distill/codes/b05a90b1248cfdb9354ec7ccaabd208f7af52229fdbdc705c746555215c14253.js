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
  graphics.fillRect(0, 0, 100, 100); // 绘制 100x100 的方块
  
  // 设置方块位置到屏幕中心
  graphics.x = 350;
  graphics.y = 250;
  
  // 初始设置为完全透明
  graphics.alpha = 0;
  
  // 创建渐变动画
  this.tweens.add({
    targets: graphics,        // 动画目标对象
    alpha: 1,                 // 目标透明度值（完全不透明）
    duration: 500,            // 持续时间 0.5 秒
    ease: 'Linear',           // 线性缓动
    yoyo: true,               // 启用往返效果（到达目标后反向播放）
    repeat: -1                // 无限循环（-1 表示永久重复）
  });
  
  // 添加文字说明
  this.add.text(400, 100, 'Alpha Fade Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 500, 'The square fades in/out every 0.5 seconds', {
    fontSize: '16px',
    color: '#cccccc'
  }).setOrigin(0.5);
}

// 创建游戏实例
new Phaser.Game(config);