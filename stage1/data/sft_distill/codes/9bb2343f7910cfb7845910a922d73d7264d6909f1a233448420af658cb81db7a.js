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
let moveSpeed = 2;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 设置世界边界，使其比视口大很多
  this.cameras.main.setBounds(0, 0, 1600, 3000);
  this.physics.world.setBounds(0, 0, 1600, 3000);
  
  // 创建背景网格以便观察相机移动
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x00ff00, 0.3);
  
  // 绘制网格
  for (let x = 0; x <= 1600; x += 100) {
    graphics.moveTo(x, 0);
    graphics.lineTo(x, 3000);
  }
  for (let y = 0; y <= 3000; y += 100) {
    graphics.moveTo(0, y);
    graphics.lineTo(1600, y);
  }
  graphics.strokePath();
  
  // 添加坐标标记
  const style = { font: '16px Arial', fill: '#00ff00' };
  for (let y = 0; y <= 3000; y += 500) {
    this.add.text(10, y + 10, `Y: ${y}`, style);
  }
  
  // 创建星形对象
  star = this.add.graphics();
  star.x = 800; // 世界中心
  star.y = 300; // 起始位置
  
  // 绘制星形
  star.fillStyle(0xffff00, 1);
  star.lineStyle(3, 0xff6600, 1);
  
  // 绘制五角星
  const points = [];
  const outerRadius = 40;
  const innerRadius = 16;
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    });
  }
  
  star.beginPath();
  star.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    star.lineTo(points[i].x, points[i].y);
  }
  star.closePath();
  star.fillPath();
  star.strokePath();
  
  // 添加一个中心圆点以便更清楚地看到中心位置
  star.fillStyle(0xff0000, 1);
  star.fillCircle(0, 0, 5);
  
  // 让相机跟随星形对象，保持居中
  this.cameras.main.startFollow(star, true, 0.1, 0.1);
  
  // 可选：设置相机跟随的偏移量（这里设置为0以保持完全居中）
  this.cameras.main.setFollowOffset(0, 0);
  
  // 添加提示文本（固定在相机视口）
  const infoText = this.add.text(10, 10, 'Camera following the star\nStar moving down automatically', {
    font: '20px Arial',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 10 }
  });
  infoText.setScrollFactor(0); // 固定在相机视口，不随相机移动
  
  // 显示星形位置信息
  this.posText = this.add.text(10, 100, '', {
    font: '16px Arial',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.posText.setScrollFactor(0);
}

function update(time, delta) {
  // 星形自动向下移动
  star.y += moveSpeed;
  
  // 当星形到达世界底部时，重置到顶部
  if (star.y > 2900) {
    star.y = 100;
  }
  
  // 更新位置信息显示
  this.posText.setText(`Star Position: (${Math.floor(star.x)}, ${Math.floor(star.y)})`);
  
  // 可选：添加一些旋转效果使星形更生动
  star.rotation += 0.02;
}

new Phaser.Game(config);