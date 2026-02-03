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

let star;
let speed = 2;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 创建一个更大的世界边界，让星形可以移动更远
  this.cameras.main.setBounds(0, 0, 800, 3000);
  
  // 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1);
  graphics.lineStyle(2, 0xffa500, 1);
  
  // 绘制五角星
  const starPoints = [];
  const outerRadius = 30;
  const innerRadius = 15;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    starPoints.push(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    );
  }
  
  graphics.beginPath();
  graphics.moveTo(starPoints[0], starPoints[1]);
  for (let i = 2; i < starPoints.length; i += 2) {
    graphics.lineTo(starPoints[i], starPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('starTexture', 64, 64);
  graphics.destroy();
  
  // 创建星形精灵对象
  star = this.add.sprite(400, 100, 'starTexture');
  
  // 设置相机跟随星形，保持居中
  this.cameras.main.startFollow(star, true, 0.1, 0.1);
  
  // 添加背景网格以便观察相机移动
  this.createGrid();
  
  // 添加提示文本（固定在相机上）
  const text = this.add.text(10, 10, '相机跟随星形向下移动', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机视图上
}

function update(time, delta) {
  // 星形自动向下移动
  star.y += speed;
  
  // 如果星形移动到世界底部，重置到顶部
  if (star.y > 2900) {
    star.y = 100;
  }
  
  // 可选：添加轻微的左右摆动效果
  star.x = 400 + Math.sin(time / 500) * 50;
}

// 辅助函数：创建网格背景
function createGrid() {
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制网格
  const gridSize = 50;
  const worldHeight = 3000;
  
  // 垂直线
  for (let x = 0; x <= 800; x += gridSize) {
    graphics.lineBetween(x, 0, x, worldHeight);
  }
  
  // 水平线
  for (let y = 0; y <= worldHeight; y += gridSize) {
    graphics.lineBetween(0, y, 800, y);
  }
  
  // 添加坐标标记
  for (let y = 0; y <= worldHeight; y += 200) {
    const label = this.add.text(10, y, `Y: ${y}`, {
      fontSize: '14px',
      color: '#888888',
      backgroundColor: '#000000'
    });
  }
}

// 创建游戏实例
new Phaser.Game(config);