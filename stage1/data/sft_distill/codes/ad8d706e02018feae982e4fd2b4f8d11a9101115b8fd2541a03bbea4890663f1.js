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
  // 不需要加载外部资源
}

function create() {
  // 设置世界边界，使其足够大以便三角形移动
  this.physics.world.setBounds(-2000, -2000, 4000, 4000);
  
  // 使用 Graphics 绘制三角形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff6600, 1);
  // 绘制一个指向上方的三角形
  graphics.fillTriangle(
    30, 10,   // 顶点
    10, 50,   // 左下
    50, 50    // 右下
  );
  graphics.generateTexture('triangleTex', 60, 60);
  graphics.destroy();
  
  // 创建物理精灵，放置在场景中心
  triangle = this.physics.add.sprite(400, 300, 'triangleTex');
  
  // 设置三角形的速度：向左上移动
  // 负 x 值表示向左，负 y 值表示向上
  triangle.setVelocity(-150, -150);
  
  // 设置三角形的碰撞边界
  triangle.setCollideWorldBounds(false);
  
  // 设置主相机跟随三角形
  this.cameras.main.startFollow(triangle, true, 0.1, 0.1);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(-2000, -2000, 4000, 4000);
  
  // 添加背景网格以便观察移动效果
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x333333, 0.5);
  
  // 绘制网格
  for (let x = -2000; x <= 2000; x += 100) {
    gridGraphics.lineBetween(x, -2000, x, 2000);
  }
  for (let y = -2000; y <= 2000; y += 100) {
    gridGraphics.lineBetween(-2000, y, 2000, y);
  }
  
  // 在中心位置绘制一个参考点
  const centerGraphics = this.add.graphics();
  centerGraphics.fillStyle(0x00ff00, 1);
  centerGraphics.fillCircle(400, 300, 5);
  
  // 添加文本提示
  const text = this.add.text(10, 10, '三角形向左上方移动\n相机跟随中...', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在屏幕上，不随相机移动
}

function update(time, delta) {
  // 物理引擎会自动更新三角形位置
  // 相机会自动跟随三角形
  
  // 可选：如果需要限制移动范围，可以在这里添加边界检查
  // 这里让三角形可以无限移动
}

new Phaser.Game(config);