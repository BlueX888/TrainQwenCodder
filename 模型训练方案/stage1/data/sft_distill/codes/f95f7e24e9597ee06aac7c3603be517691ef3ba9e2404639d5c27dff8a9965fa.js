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
  // 无需预加载资源
}

function create() {
  // 创建白色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 80, 60);
  
  // 将 graphics 转换为纹理以便于补间动画控制
  graphics.generateTexture('whiteRect', 80, 60);
  graphics.destroy();
  
  // 创建精灵对象用于动画
  const rect = this.add.sprite(100, 300, 'whiteRect');
  
  // 创建补间动画
  this.tweens.add({
    targets: rect,           // 动画目标对象
    x: 700,                  // 目标 x 坐标（从左到右）
    duration: 3000,          // 持续时间 3 秒
    yoyo: true,              // 启用往返效果（到达目标后反向播放）
    repeat: -1,              // 无限循环（-1 表示永久重复）
    ease: 'Linear'           // 线性缓动函数，匀速移动
  });
}

new Phaser.Game(config);