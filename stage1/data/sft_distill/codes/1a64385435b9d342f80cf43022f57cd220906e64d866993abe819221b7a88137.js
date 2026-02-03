const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 创建粉色三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  
  // 绘制一个等腰三角形（顶点朝上）
  graphics.fillTriangle(
    16, 0,   // 顶点
    0, 32,   // 左下角
    32, 32   // 右下角
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建三角形精灵
  this.triangle = this.add.sprite(400, 300, 'triangle');
  
  // 设置移动速度
  this.moveSpeed = 80;
  
  // 创建方向键
  this.cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，转换为秒）
  const distance = this.moveSpeed * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测方向键输入
  if (this.cursors.left.isDown) {
    velocityX = -distance;
  } else if (this.cursors.right.isDown) {
    velocityX = distance;
  }
  
  if (this.cursors.up.isDown) {
    velocityY = -distance;
  } else if (this.cursors.down.isDown) {
    velocityY = distance;
  }
  
  // 更新位置
  this.triangle.x += velocityX;
  this.triangle.y += velocityY;
  
  // 限制在画布边界内
  // 考虑三角形的宽度和高度（32x32）
  const halfWidth = this.triangle.width / 2;
  const halfHeight = this.triangle.height / 2;
  
  this.triangle.x = Phaser.Math.Clamp(
    this.triangle.x,
    halfWidth,
    config.width - halfWidth
  );
  
  this.triangle.y = Phaser.Math.Clamp(
    this.triangle.y,
    halfHeight,
    config.height - halfHeight
  );
}

new Phaser.Game(config);