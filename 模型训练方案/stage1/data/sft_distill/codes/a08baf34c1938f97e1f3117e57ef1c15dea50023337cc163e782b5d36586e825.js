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
  // 使用 Graphics 创建灰色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('graySquare', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建灰色方块精灵并放置在屏幕中心
  const square = this.add.sprite(400, 300, 'graySquare');
  
  // 创建旋转动画
  this.tweens.add({
    targets: square,           // 动画目标对象
    rotation: Math.PI * 2,     // 旋转角度：2π 弧度（360度）
    duration: 1500,            // 动画时长：1.5 秒
    ease: 'Linear',            // 线性缓动，匀速旋转
    loop: -1,                  // -1 表示无限循环
    repeat: 0                  // 每次循环不需要额外重复
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Rotating Gray Square', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);