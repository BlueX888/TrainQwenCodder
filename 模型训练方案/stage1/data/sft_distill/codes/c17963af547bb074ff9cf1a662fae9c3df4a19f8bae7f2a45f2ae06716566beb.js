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
const MOVE_SPEED = 100; // 每秒移动像素数

function preload() {
  // 使用 Graphics 创建菱形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制菱形（四个顶点）
  graphics.fillStyle(0xff6b6b, 1);
  graphics.beginPath();
  graphics.moveTo(32, 0);    // 上顶点
  graphics.lineTo(64, 32);   // 右顶点
  graphics.lineTo(32, 64);   // 下顶点
  graphics.lineTo(0, 32);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 添加描边使菱形更明显
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建一个更大的世界边界，让菱形有足够的移动空间
  this.cameras.main.setBounds(0, 0, 3200, 600);
  this.physics.world.setBounds(0, 0, 3200, 600);
  
  // 在场景左侧创建菱形精灵
  diamond = this.add.sprite(100, 300, 'diamond');
  
  // 设置相机跟随菱形，保持居中
  this.cameras.main.startFollow(diamond, true, 0.1, 0.1);
  
  // 添加一些参考网格，方便观察相机移动
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制垂直网格线
  for (let x = 0; x <= 3200; x += 100) {
    gridGraphics.lineBetween(x, 0, x, 600);
  }
  
  // 绘制水平网格线
  for (let y = 0; y <= 600; y += 100) {
    gridGraphics.lineBetween(0, y, 3200, y);
  }
  
  // 添加文本提示
  const text = this.add.text(16, 16, '菱形自动向右移动，相机跟随', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 将文本固定在相机上，不随场景滚动
  text.setScrollFactor(0);
  
  // 添加位置信息文本
  this.positionText = this.add.text(16, 50, '', {
    fontSize: '16px',
    color: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.positionText.setScrollFactor(0);
}

function update(time, delta) {
  // 让菱形向右移动
  // delta 是毫秒，需要转换为秒
  diamond.x += MOVE_SPEED * (delta / 1000);
  
  // 更新位置信息
  this.positionText.setText(
    `菱形位置: (${Math.round(diamond.x)}, ${Math.round(diamond.y)})\n` +
    `相机位置: (${Math.round(this.cameras.main.scrollX)}, ${Math.round(this.cameras.main.scrollY)})`
  );
  
  // 可选：当菱形到达世界边界时重置位置
  if (diamond.x > 3200) {
    diamond.x = 100;
  }
}

new Phaser.Game(config);