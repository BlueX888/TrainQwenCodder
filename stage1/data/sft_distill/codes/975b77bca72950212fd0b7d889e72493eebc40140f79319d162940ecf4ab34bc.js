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
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 1. 使用 Graphics 创建圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff6b6b, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy();

  // 2. 创建背景网格以便观察相机移动
  createGrid.call(this);

  // 3. 创建可移动的圆形精灵
  this.player = this.physics.add.sprite(400, 300, 'circle');
  this.player.setCollideWorldBounds(false); // 允许移出世界边界

  // 4. 设置自动向右移动
  this.player.setVelocityX(150);

  // 5. 设置相机跟随
  this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  
  // 可选：设置相机边界（如果需要限制相机移动范围）
  // this.cameras.main.setBounds(0, 0, 2000, 600);

  // 6. 添加提示文本（固定在相机上）
  const text = this.add.text(10, 10, '相机跟随圆形移动', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随场景滚动
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
  // 例如：当圆形移动到一定距离后改变方向
}

// 辅助函数：创建背景网格
function createGrid() {
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);

  // 绘制垂直线
  for (let x = 0; x < 3000; x += 100) {
    gridGraphics.lineBetween(x, 0, x, 600);
  }

  // 绘制水平线
  for (let y = 0; y < 600; y += 100) {
    gridGraphics.lineBetween(0, y, 3000, y);
  }

  // 添加位置标记
  const style = { fontSize: '14px', color: '#666666' };
  for (let x = 0; x < 3000; x += 200) {
    this.add.text(x + 5, 5, `x:${x}`, style);
  }
}

// 创建游戏实例
new Phaser.Game(config);