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
  // 使用 Graphics 绘制方块并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00aaff, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('square', 100, 100);
  graphics.destroy();

  // 在屏幕中心创建方块精灵
  const square = this.add.sprite(400, 300, 'square');

  // 创建缩放动画
  // yoyo: true 使动画在到达目标后反向播放回到起始值
  // duration: 1500 表示单向动画时长1.5秒（往返共3秒）
  // loop: -1 表示无限循环
  this.tweens.add({
    targets: square,
    scaleX: 0.48,
    scaleY: 0.48,
    duration: 1500,
    yoyo: true,
    loop: -1,
    ease: 'Sine.easeInOut'
  });

  // 添加文字说明
  this.add.text(400, 500, 'Square scaling to 48% and back (looping)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);