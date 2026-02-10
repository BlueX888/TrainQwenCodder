const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let star;
let graphics;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建星形纹理
  graphics = this.add.graphics();
  
  // 绘制黄色星形
  graphics.fillStyle(0xffff00, 1);
  graphics.lineStyle(2, 0xffa500, 1);
  
  // 绘制五角星
  const points = [];
  const radius = 30;
  const innerRadius = 15;
  
  for (let i = 0; i < 5; i++) {
    // 外顶点
    const angle1 = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    points.push(radius * Math.cos(angle1) + 32);
    points.push(radius * Math.sin(angle1) + 32);
    
    // 内顶点
    const angle2 = (Math.PI * 2 * i) / 5 + Math.PI / 5 - Math.PI / 2;
    points.push(innerRadius * Math.cos(angle2) + 32);
    points.push(innerRadius * Math.sin(angle2) + 32);
  }
  
  graphics.beginPath();
  graphics.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) {
    graphics.lineTo(points[i], points[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('starTexture', 64, 64);
  graphics.clear();
  
  // 创建更大的场景空间（添加背景网格以便观察移动）
  const worldWidth = 3200;
  const worldHeight = 2400;
  
  // 绘制网格背景
  graphics.lineStyle(1, 0x444444, 0.5);
  for (let x = 0; x < worldWidth; x += 100) {
    graphics.lineTo(x, 0);
    graphics.lineTo(x, worldHeight);
    graphics.moveTo(x + 100, 0);
  }
  for (let y = 0; y < worldHeight; y += 100) {
    graphics.moveTo(0, y);
    graphics.lineTo(worldWidth, y);
  }
  graphics.strokePath();
  
  // 设置世界边界
  this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
  
  // 创建星形精灵，放置在场景右侧
  star = this.physics.add.sprite(2800, 1200, 'starTexture');
  star.setCollideWorldBounds(true);
  
  // 设置星形向左移动
  star.setVelocityX(-150);
  
  // 添加旋转效果使移动更明显
  star.setAngularVelocity(100);
  
  // 设置相机跟随星形
  this.cameras.main.startFollow(star, true, 0.1, 0.1);
  
  // 设置相机边界
  this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
  
  // 添加文本提示
  const text = this.add.text(16, 16, '相机跟随星形移动', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在屏幕上，不随相机移动
  
  // 添加速度提示
  const speedText = this.add.text(16, 50, '', {
    fontSize: '16px',
    fill: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  speedText.setScrollFactor(0);
  
  // 更新速度显示
  this.time.addEvent({
    delay: 100,
    callback: () => {
      speedText.setText(`位置: (${Math.round(star.x)}, ${Math.round(star.y)})`);
    },
    loop: true
  });
}

function update(time, delta) {
  // 当星形到达左边界时，让它反弹或重置到右侧
  if (star.x <= 50) {
    star.x = 3150;
    star.y = Phaser.Math.Between(100, 2300);
  }
}

new Phaser.Game(config);