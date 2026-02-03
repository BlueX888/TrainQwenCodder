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
  // 使用 Graphics 绘制粉色方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('pinkSquare', 100, 100);
  graphics.destroy();
  
  // 创建精灵对象
  const square = this.add.sprite(400, 300, 'pinkSquare');
  
  // 创建淡入淡出动画
  this.tweens.add({
    targets: square,
    alpha: 0, // 目标透明度为0（完全透明）
    duration: 500, // 持续时间500毫秒（0.5秒）
    yoyo: true, // 启用yoyo效果，动画会反向播放回到初始值
    repeat: -1, // 无限循环
    ease: 'Linear' // 线性缓动
  });
  
  // 添加文字说明
  this.add.text(400, 500, 'Pink Square Fade In/Out Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);