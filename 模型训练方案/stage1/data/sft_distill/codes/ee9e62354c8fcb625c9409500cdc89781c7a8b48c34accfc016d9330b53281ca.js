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

let ellipse;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 设置世界边界，使其足够大以容纳移动
  this.physics.world.setBounds(0, 0, 800, 3000);

  // 使用 Graphics 创建椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillEllipse(32, 32, 60, 40); // 中心点(32,32)，宽60，高40
  graphics.generateTexture('ellipseTex', 64, 64);
  graphics.destroy();

  // 创建物理精灵
  ellipse = this.physics.add.sprite(400, 100, 'ellipseTex');
  
  // 设置椭圆向下移动的速度
  ellipse.setVelocityY(150);

  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, 0, 800, 3000);
  
  // 相机跟随椭圆对象，保持居中
  this.cameras.main.startFollow(ellipse, true, 0.1, 0.1);
  
  // 添加一些参考线以便观察移动效果
  const referenceGraphics = this.add.graphics();
  referenceGraphics.lineStyle(2, 0xffffff, 0.3);
  
  // 绘制水平参考线
  for (let y = 0; y < 3000; y += 100) {
    referenceGraphics.lineBetween(0, y, 800, y);
    
    // 添加距离标记
    const text = this.add.text(10, y + 10, `${y}px`, {
      fontSize: '14px',
      color: '#ffffff'
    });
    text.setScrollFactor(1); // 跟随世界移动
  }

  // 添加提示文本（固定在相机上）
  const infoText = this.add.text(10, 10, '椭圆自动向下移动\n相机跟随并保持居中', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  infoText.setScrollFactor(0); // 固定在相机上不滚动
}

function update(time, delta) {
  // 当椭圆到达世界底部时，重置到顶部
  if (ellipse.y > 2950) {
    ellipse.y = 50;
  }

  // 可选：显示当前位置信息
  // console.log('Ellipse Y:', Math.floor(ellipse.y));
}

// 创建游戏实例
new Phaser.Game(config);