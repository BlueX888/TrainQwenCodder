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

let ellipse;
let graphics;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 设置世界边界，使场景可以向上扩展
  this.physics.world.setBounds(0, -2000, 800, 3000);
  
  // 创建 Graphics 对象绘制椭圆
  graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillEllipse(30, 30, 60, 40); // 中心点(30,30)，宽60，高40
  
  // 生成纹理
  graphics.generateTexture('ellipseTex', 60, 60);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建椭圆精灵并启用物理
  ellipse = this.physics.add.sprite(400, 300, 'ellipseTex');
  
  // 设置椭圆向上移动的速度
  ellipse.setVelocityY(-100); // 向上移动，负值表示向上
  
  // 设置椭圆的碰撞边界
  ellipse.setCollideWorldBounds(false); // 允许超出世界边界
  
  // 配置相机跟随椭圆
  this.cameras.main.startFollow(ellipse, true, 0.1, 0.1);
  
  // 设置相机边界，使其可以在整个世界范围内移动
  this.cameras.main.setBounds(0, -2000, 800, 3000);
  
  // 添加一些参考线帮助观察相机跟随效果
  this.add.grid(400, 0, 800, 3000, 100, 100, 0x444444, 0, 0xffffff, 0.5)
    .setOrigin(0.5, 0);
  
  // 添加文本提示
  const text = this.add.text(10, 10, 'Camera Following Ellipse\nMoving Upward', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 让文本固定在相机上
  text.setScrollFactor(0);
  
  // 添加位置信息文本
  this.positionText = this.add.text(10, 80, '', {
    fontSize: '16px',
    color: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.positionText.setScrollFactor(0);
}

function update(time, delta) {
  // 更新位置信息显示
  if (this.positionText && ellipse) {
    this.positionText.setText([
      `Ellipse Y: ${Math.round(ellipse.y)}`,
      `Camera Y: ${Math.round(this.cameras.main.scrollY)}`,
      `Velocity: ${ellipse.body.velocity.y}`
    ]);
  }
  
  // 可选：当椭圆到达顶部时重置位置
  if (ellipse.y < -1900) {
    ellipse.y = 300;
  }
}

// 启动游戏
new Phaser.Game(config);