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
  }
};

let triangle;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 设置世界边界，使其足够大以便三角形移动
  this.physics.world.setBounds(0, 0, 2400, 1800);
  
  // 使用 Graphics 绘制三角形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff6600, 1);
  
  // 绘制一个向上的三角形（中心点在 32, 32）
  graphics.fillTriangle(
    32, 10,   // 顶点（上）
    10, 54,   // 左下顶点
    54, 54    // 右下顶点
  );
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 64, 64);
  graphics.destroy();
  
  // 创建物理精灵，初始位置在世界中心
  triangle = this.physics.add.sprite(1200, 900, 'triangleTex');
  
  // 设置三角形向左上方移动（负 x 和负 y 方向）
  triangle.setVelocity(-150, -150);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, 0, 2400, 1800);
  
  // 相机跟随三角形，保持其在屏幕中心
  this.cameras.main.startFollow(triangle, true, 0.1, 0.1);
  
  // 添加提示文本（固定在相机视图中）
  const text = this.add.text(10, 10, '三角形自动向左上移动\n相机跟随保持居中', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机视图，不随相机移动
}

function update(time, delta) {
  // 当三角形到达世界边界时，让它从对面重新出现
  if (triangle.x < 0) {
    triangle.x = 2400;
  }
  if (triangle.y < 0) {
    triangle.y = 1800;
  }
  if (triangle.x > 2400) {
    triangle.x = 0;
  }
  if (triangle.y > 1800) {
    triangle.y = 0;
  }
}

new Phaser.Game(config);