const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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
  },
  backgroundColor: '#2d2d2d'
};

let hexagon;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建一个更大的世界边界，让六边形有足够的移动空间
  this.physics.world.setBounds(-2000, -2000, 4000, 4000);
  
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制六边形（正六边形，半径40）
  const hexagonPoints = [];
  const radius = 40;
  const centerX = 50;
  const centerY = 50;
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // 从顶点开始
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    hexagonPoints.push({ x, y });
  }
  
  graphics.fillPoints(hexagonPoints, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', 100, 100);
  graphics.destroy();
  
  // 创建物理精灵，初始位置在世界中心
  hexagon = this.physics.add.sprite(0, 0, 'hexagon');
  
  // 设置六边形向左上方移动
  // 负 x 表示向左，负 y 表示向上
  hexagon.setVelocity(-150, -150);
  
  // 设置精灵的世界边界碰撞
  hexagon.setCollideWorldBounds(false); // 不限制在世界边界内，让它自由移动
  
  // 获取主相机
  const camera = this.cameras.main;
  
  // 设置相机边界为世界边界
  camera.setBounds(-2000, -2000, 4000, 4000);
  
  // 让相机跟随六边形
  camera.startFollow(hexagon);
  
  // 可选：设置跟随平滑效果（lerp），值越小越平滑
  // camera.setLerp(0.1, 0.1);
  
  // 添加一些参考网格线，帮助观察移动效果
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制网格
  for (let x = -2000; x <= 2000; x += 100) {
    gridGraphics.lineBetween(x, -2000, x, 2000);
  }
  for (let y = -2000; y <= 2000; y += 100) {
    gridGraphics.lineBetween(-2000, y, 2000, y);
  }
  
  // 添加提示文本（固定在相机视图）
  const text = this.add.text(10, 10, '六边形正在向左上方移动\n相机自动跟随', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机视图，不随世界移动
}

function update(time, delta) {
  // 可选：在控制台输出六边形位置，观察移动效果
  // console.log('Hexagon position:', hexagon.x.toFixed(2), hexagon.y.toFixed(2));
}

// 启动游戏
new Phaser.Game(config);