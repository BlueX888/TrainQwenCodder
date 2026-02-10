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
  // 使用 Graphics 创建黄色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('yellowSquare', 100, 100);
  graphics.destroy();

  // 在屏幕中心创建黄色方块 Sprite
  const square = this.add.sprite(400, 300, 'yellowSquare');

  // 创建抖动动画
  // 使用多个 Tween 组合实现抖动效果
  this.tweens.add({
    targets: square,
    x: '+=10', // 向右偏移
    y: '+=8',  // 向下偏移
    duration: 100,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1,
    repeatDelay: 0
  });

  // 添加旋转抖动增强效果
  this.tweens.add({
    targets: square,
    angle: { from: -2, to: 2 },
    duration: 150,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1,
    repeatDelay: 0
  });

  // 添加缩放抖动
  this.tweens.add({
    targets: square,
    scaleX: { from: 0.98, to: 1.02 },
    scaleY: { from: 1.02, to: 0.98 },
    duration: 200,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1,
    repeatDelay: 0
  });

  // 添加文字说明
  this.add.text(400, 500, 'Yellow Square Shake Animation', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

new Phaser.Game(config);