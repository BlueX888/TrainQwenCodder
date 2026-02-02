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

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建一个大的世界边界，让对象可以移动
  this.physics.world.setBounds(0, 0, 2000, 2000);
  
  // 使用 Graphics 绘制椭圆并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色椭圆
  graphics.fillEllipse(30, 30, 60, 40); // 中心点(30,30)，宽60，高40
  graphics.generateTexture('ellipse', 60, 60);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建物理精灵对象
  this.ellipseSprite = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置精灵向右上方移动
  // 向右速度为正，向上速度为负（Phaser 坐标系 Y 轴向下为正）
  this.ellipseSprite.setVelocity(150, -100);
  
  // 设置精灵的世界边界碰撞
  this.ellipseSprite.setCollideWorldBounds(false); // 不碰撞边界，让它自由移动
  
  // 设置相机跟随椭圆精灵
  this.cameras.main.startFollow(this.ellipseSprite);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, 0, 2000, 2000);
  
  // 添加一些背景网格以便观察相机移动
  const backgroundGraphics = this.add.graphics();
  backgroundGraphics.lineStyle(1, 0x333333, 0.5);
  
  // 绘制网格
  for (let x = 0; x <= 2000; x += 100) {
    backgroundGraphics.lineBetween(x, 0, x, 2000);
  }
  for (let y = 0; y <= 2000; y += 100) {
    backgroundGraphics.lineBetween(0, y, 2000, y);
  }
  
  // 添加文本提示
  const text = this.add.text(16, 16, 'Camera Following Ellipse', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 让文本固定在相机上，不随场景移动
  text.setScrollFactor(0);
}

function update(time, delta) {
  // 可选：添加边界检测，当椭圆移出世界时重置位置
  if (this.ellipseSprite.x > 1900 || this.ellipseSprite.y < 100) {
    this.ellipseSprite.setPosition(400, 300);
  }
}

// 创建游戏实例
new Phaser.Game(config);