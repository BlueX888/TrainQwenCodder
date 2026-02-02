const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 创建橙色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF8C00, 1); // 橙色
  graphics.fillStar(50, 50, 5, 20, 40); // 5个顶点的星形
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建星形精灵，放置在画布中心
  this.star = this.add.sprite(400, 300, 'star');
  
  // 创建方向键控制
  this.cursors = this.input.keyboard.createCursorKeys();
  
  // 移动速度
  this.moveSpeed = 200;
}

function update(time, delta) {
  // 将 delta 转换为秒（delta 是毫秒）
  const deltaInSeconds = delta / 1000;
  
  // 计算本帧的移动距离
  const moveDistance = this.moveSpeed * deltaInSeconds;
  
  // 根据方向键状态更新位置
  if (this.cursors.left.isDown) {
    this.star.x -= moveDistance;
  }
  if (this.cursors.right.isDown) {
    this.star.x += moveDistance;
  }
  if (this.cursors.up.isDown) {
    this.star.y -= moveDistance;
  }
  if (this.cursors.down.isDown) {
    this.star.y += moveDistance;
  }
  
  // 限制星形在画布边界内
  // 星形纹理大小为 100x100，所以半径为 50
  const radius = 50;
  this.star.x = Phaser.Math.Clamp(this.star.x, radius, config.width - radius);
  this.star.y = Phaser.Math.Clamp(this.star.y, radius, config.height - radius);
}

new Phaser.Game(config);