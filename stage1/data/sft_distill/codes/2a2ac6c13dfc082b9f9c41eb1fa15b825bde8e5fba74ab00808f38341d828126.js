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
  // 创建一个矩形 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置填充样式为蓝色
  graphics.fillStyle(0x4a90e2, 1);
  
  // 绘制一个矩形（中心点在 0,0）
  const rectWidth = 200;
  const rectHeight = 150;
  graphics.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight);
  
  // 设置矩形位置到屏幕中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 创建缩放补间动画
  this.tweens.add({
    targets: graphics,        // 动画目标对象
    scaleX: 0.8,             // X 轴缩放到 80%
    scaleY: 0.8,             // Y 轴缩放到 80%
    duration: 3000,          // 持续时间 3 秒
    yoyo: true,              // 启用往返效果（缩放后自动恢复）
    loop: -1,                // 无限循环（-1 表示永久循环）
    ease: 'Sine.easeInOut'   // 缓动函数，使动画更平滑
  });
  
  // 添加文字说明
  this.add.text(400, 500, '矩形将在 3 秒内缩放到 80% 并循环播放', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

// 启动 Phaser 游戏
new Phaser.Game(config);