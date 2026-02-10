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

let triangle;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制一个指向上方的三角形
  graphics.fillTriangle(
    0, -20,    // 顶点（上）
    -15, 20,   // 左下角
    15, 20     // 右下角
  );
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 30, 40);
  graphics.destroy();
  
  // 创建物理精灵对象
  triangle = this.physics.add.sprite(400, 300, 'triangleTex');
  
  // 设置三角形向左上方移动的速度
  triangle.setVelocity(-150, -150);
  
  // 设置世界边界，让三角形可以在更大的空间移动
  this.physics.world.setBounds(-2000, -2000, 4000, 4000);
  triangle.setCollideWorldBounds(false);
  
  // 设置相机边界（与世界边界一致）
  this.cameras.main.setBounds(-2000, -2000, 4000, 4000);
  
  // 相机跟随三角形
  this.cameras.main.startFollow(triangle, true, 0.1, 0.1);
  
  // 设置相机跟随偏移量为0，保持三角形居中
  this.cameras.main.setFollowOffset(0, 0);
  
  // 添加背景网格以便观察移动效果
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制网格
  for (let x = -2000; x <= 2000; x += 100) {
    gridGraphics.moveTo(x, -2000);
    gridGraphics.lineTo(x, 2000);
  }
  for (let y = -2000; y <= 2000; y += 100) {
    gridGraphics.moveTo(-2000, y);
    gridGraphics.lineTo(2000, y);
  }
  gridGraphics.strokePath();
  
  // 添加文本提示
  const text = this.add.text(10, 10, '三角形向左上方移动\n相机跟随保持居中', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在屏幕上，不随相机移动
}

function update(time, delta) {
  // 三角形通过 setVelocity 自动移动，相机自动跟随
  // 可以添加额外的逻辑，例如边界检测或方向改变
}

new Phaser.Game(config);