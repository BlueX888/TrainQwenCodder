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
  // 使用 Graphics 生成红色方块纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 80, 80);
  graphics.generateTexture('redSquare', 80, 80);
  graphics.destroy();
}

function create() {
  // 创建红色方块精灵，初始位置在画布中央偏上
  const square = this.add.image(400, 200, 'redSquare');
  
  // 创建弹跳动画
  // 使用 yoyo 实现上下弹跳效果
  this.tweens.add({
    targets: square,
    y: 450, // 弹跳到的最低点
    duration: 1500, // 下落时间 1.5 秒
    ease: 'Bounce.easeOut', // 弹跳缓动效果
    yoyo: true, // 往返运动
    repeat: -1, // 无限循环
    yoyoEase: 'Quad.easeIn' // 上升时使用二次缓动
  });
  
  // 添加说明文字
  this.add.text(400, 550, '红色方块弹跳动画 (3秒循环)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);