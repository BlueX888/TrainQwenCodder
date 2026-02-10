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
  // 使用 Graphics 绘制三角形并生成纹理
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x0088ff, 1);
  
  // 绘制一个指向右上的三角形（相对于中心点）
  graphics.fillTriangle(
    0, -30,    // 顶点（上）
    -25, 30,   // 左下顶点
    25, 30     // 右下顶点
  );
  
  // 生成纹理
  graphics.generateTexture('triangleTexture', 50, 60);
  graphics.destroy();
  
  // 设置世界边界，允许三角形移动到更大的区域
  this.physics.world.setBounds(-2000, -2000, 4000, 4000);
  
  // 创建物理精灵对象，初始位置在屏幕中心
  triangle = this.physics.add.sprite(400, 300, 'triangleTexture');
  
  // 设置三角形的速度，向左下移动
  // 负的 x 速度表示向左，正的 y 速度表示向下
  triangle.setVelocity(-150, 150);
  
  // 设置三角形在世界边界内碰撞（可选）
  triangle.setCollideWorldBounds(false);
  
  // 配置相机跟随三角形
  // startFollow(target, roundPixels, lerpX, lerpY, offsetX, offsetY)
  // roundPixels: false 使移动更平滑
  // lerpX/lerpY: 0.1 表示相机平滑跟随的速度（0-1之间，越小越平滑）
  this.cameras.main.startFollow(triangle, false, 0.1, 0.1);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(-2000, -2000, 4000, 4000);
  
  // 添加背景网格以便观察移动效果
  const bg = this.add.graphics();
  bg.lineStyle(1, 0x333333, 0.5);
  
  // 绘制网格
  for (let x = -2000; x <= 2000; x += 100) {
    bg.moveTo(x, -2000);
    bg.lineTo(x, 2000);
  }
  for (let y = -2000; y <= 2000; y += 100) {
    bg.moveTo(-2000, y);
    bg.lineTo(2000, y);
  }
  bg.strokePath();
  
  // 添加文本提示（固定在相机上）
  const text = this.add.text(10, 10, '相机跟随三角形\n三角形向左下移动', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随世界移动
}

function update(time, delta) {
  // 三角形自动移动，不需要额外的更新逻辑
  // 相机会自动跟随三角形
}

new Phaser.Game(config);