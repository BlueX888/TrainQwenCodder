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
  // 使用 Graphics 绘制白色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 60, 60);
  
  // 生成纹理
  graphics.generateTexture('whiteRect', 60, 60);
  graphics.destroy();
  
  // 创建精灵对象，初始位置在左侧
  const rect = this.add.sprite(100, 300, 'whiteRect');
  
  // 创建补间动画
  this.tweens.add({
    targets: rect,           // 动画目标对象
    x: 700,                  // 目标 x 坐标（右侧）
    duration: 1000,          // 持续时间 1 秒
    yoyo: true,              // 启用往返效果（到达目标后反向播放）
    repeat: -1,              // 无限循环（-1 表示永远重复）
    ease: 'Linear'           // 线性缓动函数，保持匀速移动
  });
}

new Phaser.Game(config);