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
    -15, 20,   // 左下顶点
    15, 20     // 右下顶点
  );
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 30, 40);
  graphics.destroy();
  
  // 创建物理精灵并应用三角形纹理
  triangle = this.physics.add.sprite(400, 300, 'triangleTex');
  
  // 设置速度：向左上方移动
  // 负 x 值 = 向左，负 y 值 = 向上
  triangle.setVelocity(-100, -100);
  
  // 设置边界，让三角形可以在更大的世界中移动
  this.physics.world.setBounds(-2000, -2000, 4000, 4000);
  triangle.setCollideWorldBounds(false);
  
  // 扩展世界边界以支持相机跟随
  this.cameras.main.setBounds(-2000, -2000, 4000, 4000);
  
  // 相机跟随三角形，保持居中
  this.cameras.main.startFollow(triangle, true, 0.1, 0.1);
  
  // 添加参考网格以便观察移动效果
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x555555, 0.5);
  
  // 绘制网格
  for (let x = -2000; x <= 2000; x += 100) {
    gridGraphics.lineBetween(x, -2000, x, 2000);
  }
  for (let y = -2000; y <= 2000; y += 100) {
    gridGraphics.lineBetween(-2000, y, 2000, y);
  }
  
  // 添加文本提示
  const text = this.add.text(10, 10, '三角形自动向左上移动\n相机跟随保持居中', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在屏幕上，不随相机移动
}

function update(time, delta) {
  // 三角形会自动移动，因为已设置速度
  // 相机会自动跟随三角形
}

new Phaser.Game(config);