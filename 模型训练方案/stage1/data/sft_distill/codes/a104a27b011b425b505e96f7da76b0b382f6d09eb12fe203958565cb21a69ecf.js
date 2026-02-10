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
  // 创建一个圆形图形对象
  const graphics = this.add.graphics();
  
  // 设置填充样式为蓝色
  graphics.fillStyle(0x4a90e2, 1);
  
  // 绘制圆形（中心点在 0,0，半径为 50）
  graphics.fillCircle(0, 0, 50);
  
  // 设置圆形位置到画布中心
  graphics.setPosition(400, 300);
  
  // 创建缩放动画
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    scaleX: 0.48,               // X 轴缩放到 48%
    scaleY: 0.48,               // Y 轴缩放到 48%
    duration: 2000,             // 动画持续时间 2 秒
    yoyo: true,                 // 动画结束后反向播放（恢复到原始大小）
    repeat: -1,                 // 无限循环（-1 表示永久重复）
    ease: 'Sine.easeInOut'      // 缓动函数，使动画更平滑
  });
  
  // 添加文字说明
  this.add.text(400, 50, '圆形缩放动画循环播放', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '缩放范围: 100% ↔ 48% (2秒一个周期)', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);