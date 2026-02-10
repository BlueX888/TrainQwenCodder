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

let triangle;
const moveSpeed = 100; // 每秒移动的像素

function preload() {
  // 使用 Graphics 创建三角形纹理
  const graphics = this.add.graphics();
  
  // 绘制一个向上的三角形
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(25, 0);      // 顶点
  graphics.lineTo(50, 50);     // 右下角
  graphics.lineTo(0, 50);      // 左下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 50, 50);
  graphics.destroy();
}

function create() {
  // 设置世界边界，让场景更大以展示相机跟随效果
  this.cameras.main.setBounds(0, 0, 2000, 2000);
  this.physics.world.setBounds(0, 0, 2000, 2000);
  
  // 创建三角形 Sprite
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 让相机跟随三角形，并保持居中
  this.cameras.main.startFollow(triangle, true, 0.1, 0.1);
  
  // 可选：设置相机跟随的偏移量（这里设置为 0,0 表示居中）
  this.cameras.main.setFollowOffset(0, 0);
  
  // 添加背景网格以便观察相机移动
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制网格
  for (let x = 0; x <= 2000; x += 100) {
    graphics.moveTo(x, 0);
    graphics.lineTo(x, 2000);
  }
  for (let y = 0; y <= 2000; y += 100) {
    graphics.moveTo(0, y);
    graphics.lineTo(2000, y);
  }
  graphics.strokePath();
  
  // 添加坐标文本以便观察位置
  this.add.text(10, 10, 'Camera follows triangle', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  }).setScrollFactor(0); // 固定在屏幕上，不随相机移动
  
  // 创建动态文本显示三角形位置
  this.positionText = this.add.text(10, 50, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  }).setScrollFactor(0);
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  
  // 让三角形向右上方移动
  // 右上方向：x 增加，y 减少（Phaser 的 y 轴向下为正）
  const moveDistance = moveSpeed * deltaSeconds;
  triangle.x += moveDistance;
  triangle.y -= moveDistance;
  
  // 限制三角形在世界边界内
  triangle.x = Phaser.Math.Clamp(triangle.x, 0, 2000);
  triangle.y = Phaser.Math.Clamp(triangle.y, 0, 2000);
  
  // 更新位置显示
  this.positionText.setText(
    `Triangle Position: (${Math.floor(triangle.x)}, ${Math.floor(triangle.y)})`
  );
  
  // 当三角形到达边界时，可以重置位置（可选）
  if (triangle.x >= 2000 || triangle.y <= 0) {
    triangle.setPosition(100, 500);
  }
}

new Phaser.Game(config);