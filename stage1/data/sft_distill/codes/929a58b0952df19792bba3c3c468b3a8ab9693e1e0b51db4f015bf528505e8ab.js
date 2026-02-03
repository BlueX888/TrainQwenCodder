const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let circle;
let moveSpeed = 2;

function preload() {
  // 无需预加载资源
}

function create() {
  // 设置世界边界，使其比屏幕大，以便对象可以移动
  this.cameras.main.setBounds(0, 0, 800, 2000);
  this.physics.world.setBounds(0, 0, 800, 2000);

  // 创建一个 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(0, 0, 20); // 以中心点绘制半径为20的圆
  
  // 生成纹理以便后续使用
  graphics.generateTexture('circleTexture', 40, 40);
  graphics.destroy();

  // 创建圆形精灵对象
  circle = this.add.sprite(400, 100, 'circleTexture');
  
  // 绘制一些背景参考网格，便于观察相机跟随效果
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制横线
  for (let y = 0; y <= 2000; y += 100) {
    gridGraphics.moveTo(0, y);
    gridGraphics.lineTo(800, y);
  }
  
  // 绘制竖线
  for (let x = 0; x <= 800; x += 100) {
    gridGraphics.moveTo(x, 0);
    gridGraphics.lineTo(x, 2000);
  }
  
  gridGraphics.strokePath();

  // 添加坐标文本标记
  for (let y = 0; y <= 2000; y += 200) {
    this.add.text(10, y + 10, `Y: ${y}`, {
      fontSize: '16px',
      color: '#ffffff'
    });
  }

  // 设置相机跟随圆形对象
  // 参数：目标对象, 是否立即跟随, lerp平滑度X, lerp平滑度Y
  this.cameras.main.startFollow(circle, true, 0.1, 0.1);
  
  // 可选：设置相机跟随的偏移量，使目标保持在屏幕特定位置
  // this.cameras.main.setFollowOffset(0, -100); // 让圆形显示在屏幕上方一些

  // 添加提示文本（固定在相机上）
  const instructionText = this.add.text(10, 10, '相机跟随圆形向下移动', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  instructionText.setScrollFactor(0); // 固定在相机视图上，不随世界移动
}

function update(time, delta) {
  // 让圆形持续向下移动
  circle.y += moveSpeed;

  // 当圆形到达世界底部时，重置到顶部
  if (circle.y > 1950) {
    circle.y = 100;
  }

  // 显示当前圆形位置（固定在相机上的调试信息）
  if (this.debugText) {
    this.debugText.destroy();
  }
  
  this.debugText = this.add.text(10, 550, `圆形位置: (${Math.round(circle.x)}, ${Math.round(circle.y)})`, {
    fontSize: '16px',
    color: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.debugText.setScrollFactor(0);
}

new Phaser.Game(config);