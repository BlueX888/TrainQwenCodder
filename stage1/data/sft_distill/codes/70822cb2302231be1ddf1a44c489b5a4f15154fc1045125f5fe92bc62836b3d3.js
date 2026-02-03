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

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 设置世界边界为更大的范围，允许对象移动
  this.physics.world.setBounds(0, 0, 3000, 3000);
  
  // 使用 Graphics 绘制椭圆并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillEllipse(40, 30, 80, 60); // 中心点、宽度、高度
  graphics.generateTexture('ellipse', 80, 60);
  graphics.destroy();
  
  // 创建物理精灵对象，初始位置在场景中心
  this.player = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置椭圆向右上方移动（正x轴，负y轴）
  this.player.setVelocity(150, -100);
  
  // 设置对象在世界边界内碰撞反弹
  this.player.setCollideWorldBounds(true);
  this.player.setBounce(1, 1);
  
  // 获取主相机并设置跟随对象
  const camera = this.cameras.main;
  
  // 相机跟随椭圆对象，保持居中
  camera.startFollow(this.player, true, 0.1, 0.1);
  
  // 设置相机边界与世界边界一致
  camera.setBounds(0, 0, 3000, 3000);
  
  // 添加一些参考网格线，便于观察相机跟随效果
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制网格
  for (let x = 0; x <= 3000; x += 100) {
    gridGraphics.lineBetween(x, 0, x, 3000);
  }
  for (let y = 0; y <= 3000; y += 100) {
    gridGraphics.lineBetween(0, y, 3000, y);
  }
  
  // 添加文本提示
  const text = this.add.text(16, 16, 'Camera following the green ellipse', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 将文本固定在相机上，不随相机移动
  text.setScrollFactor(0);
}

function update(time, delta) {
  // 每帧更新逻辑（本例中物理系统自动处理移动）
  // 可以在这里添加额外的逻辑，如检测边界等
}

// 启动游戏
new Phaser.Game(config);