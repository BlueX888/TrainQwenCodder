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
  // 使用 Graphics 绘制黄色矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 150, 100);
  graphics.generateTexture('yellowRect', 150, 100);
  graphics.destroy();

  // 创建精灵对象
  const rect = this.add.sprite(400, 300, 'yellowRect');

  // 创建淡入淡出动画
  // 使用 yoyo 实现淡入淡出效果，repeat -1 实现无限循环
  this.tweens.add({
    targets: rect,
    alpha: 0, // 目标透明度为0（完全透明）
    duration: 500, // 淡出持续500毫秒
    yoyo: true, // 启用yoyo效果，动画结束后反向播放（淡入）
    repeat: -1, // 无限循环
    ease: 'Linear' // 线性缓动
  });

  // 添加提示文本
  this.add.text(400, 500, '黄色矩形淡入淡出循环动画', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);