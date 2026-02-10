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

let diamond;
const moveSpeed = 100; // 每秒向下移动的像素数

function preload() {
  // 使用 Graphics 创建菱形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制菱形（四个三角形组成）
  graphics.fillStyle(0xff6b6b, 1);
  graphics.beginPath();
  graphics.moveTo(32, 0);    // 上顶点
  graphics.lineTo(64, 32);   // 右顶点
  graphics.lineTo(32, 64);   // 下顶点
  graphics.lineTo(0, 32);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 添加边框
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
}

function create() {
  // 设置世界边界，让菱形有足够的移动空间
  this.cameras.main.setBounds(0, 0, 800, 3000);
  this.physics.world.setBounds(0, 0, 800, 3000);
  
  // 创建菱形精灵
  diamond = this.add.sprite(400, 100, 'diamond');
  
  // 设置相机跟随菱形
  // startFollow(target, roundPixels, lerpX, lerpY, offsetX, offsetY)
  // roundPixels: 是否四舍五入像素，避免抖动
  // lerpX/lerpY: 平滑跟随系数 (0-1)，1 表示立即跟随，小于 1 表示有延迟效果
  this.cameras.main.startFollow(diamond, true, 0.1, 0.1);
  
  // 添加提示文字（固定在相机上）
  const text = this.add.text(10, 10, '相机跟随菱形\n菱形持续向下移动', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机视口，不随世界移动
  
  // 添加位置信息文字
  this.positionText = this.add.text(10, 80, '', {
    fontSize: '16px',
    color: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.positionText.setScrollFactor(0);
  
  // 添加背景网格以便观察移动效果
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制水平线
  for (let y = 0; y <= 3000; y += 100) {
    gridGraphics.lineBetween(0, y, 800, y);
  }
  
  // 绘制垂直线
  for (let x = 0; x <= 800; x += 100) {
    gridGraphics.lineBetween(x, 0, x, 3000);
  }
}

function update(time, delta) {
  // 让菱形向下移动
  // delta 是毫秒数，转换为秒
  diamond.y += (moveSpeed * delta) / 1000;
  
  // 更新位置信息
  this.positionText.setText(
    `菱形位置: (${Math.round(diamond.x)}, ${Math.round(diamond.y)})\n` +
    `相机位置: (${Math.round(this.cameras.main.scrollX)}, ${Math.round(this.cameras.main.scrollY)})`
  );
  
  // 当菱形到达底部时，重置到顶部
  if (diamond.y > 2900) {
    diamond.y = 100;
  }
}

new Phaser.Game(config);