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

let diamond;
let camera;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建一个更大的世界边界，让对象可以移动
  this.physics.world.setBounds(0, 0, 3000, 600);
  
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形路径（中心点在 32, 32）
  const diamondPath = new Phaser.Geom.Polygon([
    32, 0,    // 上顶点
    64, 32,   // 右顶点
    32, 64,   // 下顶点
    0, 32     // 左顶点
  ]);
  
  graphics.fillPoints(diamondPath.points, true);
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
  
  // 创建物理精灵对象
  diamond = this.physics.add.sprite(400, 300, 'diamond');
  
  // 设置精灵向右移动的速度（每秒150像素）
  diamond.setVelocityX(150);
  
  // 设置精灵的碰撞边界
  diamond.setCollideWorldBounds(false);
  
  // 获取主相机
  camera = this.cameras.main;
  
  // 设置相机边界与世界边界一致
  camera.setBounds(0, 0, 3000, 600);
  
  // 让相机跟随菱形对象，并保持居中
  camera.startFollow(diamond, true, 0.1, 0.1);
  
  // 添加一些参考网格线，便于观察相机移动
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制垂直网格线
  for (let x = 0; x <= 3000; x += 100) {
    gridGraphics.lineBetween(x, 0, x, 600);
  }
  
  // 绘制水平网格线
  for (let y = 0; y <= 600; y += 100) {
    gridGraphics.lineBetween(0, y, 3000, y);
  }
  
  // 添加说明文字（固定在相机上）
  const text = this.add.text(10, 10, '相机跟随菱形对象\n菱形自动向右移动', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随世界移动
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
  // 当前菱形由物理引擎自动移动，相机自动跟随
}

// 创建游戏实例
new Phaser.Game(config);