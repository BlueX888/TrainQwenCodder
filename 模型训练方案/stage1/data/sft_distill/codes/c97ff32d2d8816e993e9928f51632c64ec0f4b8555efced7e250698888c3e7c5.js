const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload,
    create,
    update
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 使用 Graphics 创建粉色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillEllipse(25, 25, 50, 30); // 绘制椭圆 (中心x, 中心y, 宽度, 高度)
  graphics.generateTexture('pinkEllipse', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建粉色椭圆精灵，放置在画布中心
  this.player = this.add.sprite(400, 300, 'pinkEllipse');
  
  // 创建方向键控制
  this.cursors = this.input.keyboard.createCursorKeys();
  
  // 移动速度
  this.moveSpeed = 120;
  
  // 存储椭圆的半径用于边界检测
  this.ellipseWidth = 50;
  this.ellipseHeight = 50;
}

function update(time, delta) {
  // 计算每帧移动距离
  const moveDistance = this.moveSpeed * (delta / 1000);
  
  // 处理水平移动
  if (this.cursors.left.isDown) {
    this.player.x -= moveDistance;
  } else if (this.cursors.right.isDown) {
    this.player.x += moveDistance;
  }
  
  // 处理垂直移动
  if (this.cursors.up.isDown) {
    this.player.y -= moveDistance;
  } else if (this.cursors.down.isDown) {
    this.player.y += moveDistance;
  }
  
  // 限制在画布边界内
  const halfWidth = this.ellipseWidth / 2;
  const halfHeight = this.ellipseHeight / 2;
  
  this.player.x = Phaser.Math.Clamp(
    this.player.x,
    halfWidth,
    config.width - halfWidth
  );
  
  this.player.y = Phaser.Math.Clamp(
    this.player.y,
    halfHeight,
    config.height - halfHeight
  );
}

new Phaser.Game(config);