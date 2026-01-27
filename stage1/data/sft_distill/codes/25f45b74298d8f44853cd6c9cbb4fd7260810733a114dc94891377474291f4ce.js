const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建背景网格以便观察相机移动
  createBackgroundGrid.call(this);
  
  // 使用 Graphics 生成圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff6b6b, 1);
  graphics.fillCircle(25, 25, 25); // 圆心在 (25, 25)，半径 25
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy();
  
  // 创建圆形精灵对象
  this.player = this.add.sprite(400, 300, 'circle');
  
  // 设置相机跟随圆形对象
  // startFollow(target, roundPixels, lerpX, lerpY, offsetX, offsetY)
  // roundPixels: true 保持像素完美
  // lerpX/lerpY: 0.1 平滑跟随（值越小越平滑）
  this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  
  // 设置相机边界，让世界更大以便观察跟随效果
  this.cameras.main.setBounds(0, 0, 2000, 600);
  
  // 添加提示文本（固定在相机上）
  const text = this.add.text(10, 10, '相机跟随圆形对象', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随世界移动
  
  // 移动速度
  this.moveSpeed = 2;
}

function update(time, delta) {
  // 让圆形自动向右移动
  this.player.x += this.moveSpeed;
  
  // 当圆形移动到世界边界时，重置位置
  if (this.player.x > 2000) {
    this.player.x = 0;
  }
}

// 创建背景网格辅助函数
function createBackgroundGrid() {
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制垂直线
  for (let x = 0; x <= 2000; x += 100) {
    graphics.lineBetween(x, 0, x, 600);
  }
  
  // 绘制水平线
  for (let y = 0; y <= 600; y += 100) {
    graphics.lineBetween(0, y, 2000, y);
  }
  
  // 添加坐标标记
  for (let x = 0; x <= 2000; x += 200) {
    const label = this.add.text(x + 5, 5, `${x}`, {
      fontSize: '14px',
      color: '#888888'
    });
  }
}

new Phaser.Game(config);