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
  // 使用 Graphics 绘制紫色矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('purpleRect', 100, 100);
  graphics.destroy();

  // 创建紫色矩形精灵，放置在画面中央偏上位置
  const rect = this.add.sprite(400, 200, 'purpleRect');

  // 创建弹跳动画
  // 使用 yoyo 和 Bounce.easeOut 实现弹跳效果
  this.tweens.add({
    targets: rect,
    y: 400, // 从 200 弹跳到 400
    duration: 2500, // 2.5 秒完成一次弹跳
    ease: 'Bounce.easeOut', // 弹跳缓动效果
    yoyo: true, // 往返运动
    repeat: -1, // 无限循环
    hold: 0, // 不在终点停留
    repeatDelay: 0 // 重复之间无延迟
  });

  // 添加说明文字
  this.add.text(400, 550, '紫色矩形弹跳动画 (2.5秒循环)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);