const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let triangle;
const moveSpeed = 100; // 每秒移动的像素

function preload() {
  // 使用 Graphics 创建三角形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制三角形
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(32, 0);      // 顶点
  graphics.lineTo(0, 64);      // 左下
  graphics.lineTo(64, 64);     // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 添加边框使三角形更明显
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 64, 64);
  graphics.destroy();
}

function create() {
  // 扩大世界边界，允许三角形移动更远
  this.cameras.main.setBounds(0, 0, 3000, 3000);
  this.physics.world.setBounds(0, 0, 3000, 3000);
  
  // 创建三角形精灵，初始位置在世界中心
  triangle = this.add.sprite(1500, 1500, 'triangle');
  
  // 设置相机跟随三角形
  this.cameras.main.startFollow(triangle, true, 0.1, 0.1);
  
  // 添加网格背景以便观察移动
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制网格
  for (let x = 0; x <= 3000; x += 100) {
    graphics.moveTo(x, 0);
    graphics.lineTo(x, 3000);
  }
  for (let y = 0; y <= 3000; y += 100) {
    graphics.moveTo(0, y);
    graphics.lineTo(3000, y);
  }
  graphics.strokePath();
  
  // 添加文本提示
  const text = this.add.text(16, 16, '相机跟随三角形移动', {
    fontSize: '24px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在屏幕上，不随相机移动
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  
  // 向左下方移动：x 减少，y 增加
  // 使用 45 度角移动（左下方向）
  const moveDistance = moveSpeed * deltaSeconds;
  triangle.x -= moveDistance * Math.cos(Math.PI / 4); // 向左
  triangle.y += moveDistance * Math.sin(Math.PI / 4); // 向下
  
  // 可选：当三角形移动到边界时重置位置
  if (triangle.x < 0 || triangle.y > 3000) {
    triangle.setPosition(1500, 1500);
  }
}

const game = new Phaser.Game(config);