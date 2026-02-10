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

let hexagon;
let moveSpeed = 100; // 向上移动速度

function preload() {
  // 使用 Graphics 创建六边形纹理
  const graphics = this.add.graphics();
  
  // 绘制六边形
  const hexRadius = 30;
  const hexPoints = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = hexRadius + hexRadius * Math.cos(angle);
    const y = hexRadius + hexRadius * Math.sin(angle);
    hexPoints.push(x, y);
  }
  
  // 填充六边形
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillPoints(hexPoints, true);
  
  // 添加边框
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokePoints(hexPoints, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
}

function create() {
  // 设置世界边界（扩大场景范围以展示相机跟随）
  this.physics.world.setBounds(0, 0, 800, 3000);
  
  // 创建六边形精灵，初始位置在场景底部
  hexagon = this.physics.add.sprite(400, 2900, 'hexagon');
  
  // 设置六边形向上移动
  hexagon.setVelocityY(-moveSpeed);
  
  // 设置相机跟随六边形
  this.cameras.main.startFollow(hexagon, true, 0.1, 0.1);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, 0, 800, 3000);
  
  // 添加一些参考线帮助观察相机跟随效果
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制水平参考线（每100像素一条）
  for (let y = 0; y < 3000; y += 100) {
    graphics.lineBetween(0, y, 800, y);
    
    // 添加坐标文字
    const text = this.add.text(10, y + 5, `Y: ${y}`, {
      fontSize: '14px',
      color: '#888888'
    });
    text.setScrollFactor(1); // 跟随世界移动
  }
  
  // 添加中心十字线（固定在屏幕中心）
  const centerGraphics = this.add.graphics();
  centerGraphics.lineStyle(2, 0xff0000, 0.8);
  centerGraphics.lineBetween(400, 0, 400, 600); // 垂直线
  centerGraphics.lineBetween(0, 300, 800, 300); // 水平线
  centerGraphics.setScrollFactor(0); // 固定在相机视图
  
  // 添加提示文字
  const instructions = this.add.text(10, 10, 
    '相机跟随六边形\n六边形自动向上移动', 
    {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }
  );
  instructions.setScrollFactor(0); // 固定在相机视图
  
  // 显示六边形位置信息
  this.positionText = this.add.text(10, 560, '', {
    fontSize: '14px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.positionText.setScrollFactor(0);
}

function update(time, delta) {
  // 更新位置信息显示
  if (hexagon && this.positionText) {
    this.positionText.setText(
      `六边形位置: (${Math.round(hexagon.x)}, ${Math.round(hexagon.y)})\n` +
      `相机位置: (${Math.round(this.cameras.main.scrollX)}, ${Math.round(this.cameras.main.scrollY)})`
    );
  }
  
  // 当六边形到达顶部时，重置到底部
  if (hexagon.y < 100) {
    hexagon.setPosition(400, 2900);
  }
}

// 启动游戏
new Phaser.Game(config);