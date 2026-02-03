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
  graphics.fillRect(0, 0, 50, 50);
  
  // 将 graphics 转换为纹理以便进行补间动画
  graphics.generateTexture('whiteRect', 50, 50);
  graphics.destroy();
  
  // 创建精灵对象用于动画
  const rect = this.add.sprite(100, 300, 'whiteRect');
  
  // 创建补间动画：从左到右移动
  this.tweens.add({
    targets: rect,
    x: 700, // 目标 x 坐标（右侧位置）
    duration: 500, // 持续时间 0.5 秒
    yoyo: true, // 启用往返效果
    repeat: -1, // 无限循环 (-1 表示永久重复)
    ease: 'Linear' // 线性缓动
  });
}

new Phaser.Game(config);