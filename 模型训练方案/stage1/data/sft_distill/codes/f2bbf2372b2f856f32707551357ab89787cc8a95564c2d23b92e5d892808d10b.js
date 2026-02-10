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
  // 创建白色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 60, 60);
  
  // 将 graphics 转换为纹理以便于移动
  graphics.generateTexture('whiteRect', 60, 60);
  graphics.destroy();
  
  // 创建精灵对象
  const rect = this.add.sprite(100, 300, 'whiteRect');
  
  // 创建补间动画
  this.tweens.add({
    targets: rect,           // 动画目标对象
    x: 700,                  // 目标 x 坐标（从左到右）
    duration: 1000,          // 动画持续时间 1 秒
    yoyo: true,              // 往返效果（到达终点后返回起点）
    repeat: -1,              // 无限循环（-1 表示永远重复）
    ease: 'Linear'           // 线性缓动函数
  });
}

new Phaser.Game(config);