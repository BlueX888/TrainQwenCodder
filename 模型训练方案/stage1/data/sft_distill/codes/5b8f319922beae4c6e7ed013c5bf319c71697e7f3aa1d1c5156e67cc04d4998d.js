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
  // 创建 Graphics 对象绘制方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色方块
  graphics.fillRect(-50, -50, 100, 100); // 以中心点为原点绘制 100x100 的方块
  
  // 将 graphics 转换为纹理
  graphics.generateTexture('square', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，使用纹理代替
  
  // 在屏幕中心创建方块精灵
  const square = this.add.sprite(400, 300, 'square');
  
  // 创建缩放 Tween 动画
  this.tweens.add({
    targets: square,           // 动画目标对象
    scale: 0.64,              // 缩放到 64%（0.64 倍）
    duration: 2000,           // 单程持续时间 2 秒
    yoyo: true,               // 启用悠悠球效果（自动恢复）
    loop: -1,                 // 无限循环（-1 表示永久循环）
    ease: 'Sine.easeInOut'    // 使用平滑的缓动函数
  });
  
  // 添加文字说明
  this.add.text(400, 50, 'Square scaling to 64% and back\n(4 seconds per cycle)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

// 启动 Phaser 游戏
new Phaser.Game(config);