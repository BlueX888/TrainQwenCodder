const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let square;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制方块并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('squareTexture', 100, 100);
  graphics.destroy();

  // 创建方块精灵，放置在屏幕中央
  square = this.add.sprite(400, 300, 'squareTexture');
  
  // 设置方块的原点为中心，使其围绕中心旋转
  square.setOrigin(0.5, 0.5);
}

function update(time, delta) {
  // 每秒旋转 120 度
  // 120 度 = 120 * (Math.PI / 180) = 2.0944 弧度
  // delta 是毫秒，需要转换为秒
  const rotationSpeed = (120 * Math.PI / 180); // 弧度/秒
  const rotationIncrement = rotationSpeed * (delta / 1000); // 弧度/帧
  
  // 增加旋转角度
  square.rotation += rotationIncrement;
}

new Phaser.Game(config);