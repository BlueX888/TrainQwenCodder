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
const MOVE_SPEED = 2;

function preload() {
  // 使用 Graphics 创建星形纹理
  const graphics = this.add.graphics();
  
  // 绘制黄色星形
  graphics.fillStyle(0xffff00, 1);
  graphics.lineStyle(2, 0xffa500, 1);
  
  // 绘制五角星
  const points = [];
  const outerRadius = 30;
  const innerRadius = 15;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push({
      x: 32 + Math.cos(angle) * radius,
      y: 32 + Math.sin(angle) * radius
    });
  }
  
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 64, 64);
  graphics.destroy();
}

function create() {
  // 设置世界边界，使其比相机视口大很多
  this.cameras.main.setBounds(0, 0, 3000, 3000);
  this.physics.world.setBounds(0, 0, 3000, 3000);
  
  // 创建星形精灵，放置在世界中心偏左下位置
  star = this.add.sprite(400, 1500, 'star');
  star.setOrigin(0.5, 0.5);
  
  // 设置相机跟随星形
  this.cameras.main.startFollow(star, true, 0.1, 0.1);
  
  // 可选：设置相机跟随的偏移量（如果需要）
  // this.cameras.main.setFollowOffset(0, 0);
  
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
  
  // 添加文字提示
  const text = this.add.text(10, 10, '相机跟随星形移动\n星形自动向右上方移动', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机视口上
  
  // 添加坐标显示
  this.coordText = this.add.text(10, 80, '', {
    fontSize: '16px',
    color: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.coordText.setScrollFactor(0);
}

function update(time, delta) {
  // 星形自动向右上方移动
  star.x += MOVE_SPEED;
  star.y -= MOVE_SPEED;
  
  // 星形旋转效果
  star.angle += 1;
  
  // 更新坐标显示
  this.coordText.setText(
    `星形坐标: (${Math.round(star.x)}, ${Math.round(star.y)})\n` +
    `相机中心: (${Math.round(this.cameras.main.scrollX + 400)}, ${Math.round(this.cameras.main.scrollY + 300)})`
  );
  
  // 可选：当星形到达边界时重置位置
  if (star.x > 2900 || star.y < 100) {
    star.x = 400;
    star.y = 1500;
  }
}

new Phaser.Game(config);