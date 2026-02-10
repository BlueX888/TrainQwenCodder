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
  // 创建方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('playerBox', 50, 50);
  graphics.destroy();

  // 创建背景网格作为参考
  createGrid.call(this);

  // 创建玩家方块（使用物理系统）
  this.player = this.physics.add.sprite(400, 300, 'playerBox');
  
  // 设置方块向左移动
  this.player.setVelocityX(-150);

  // 设置世界边界（扩大世界以便方块移动）
  this.physics.world.setBounds(-2000, 0, 4000, 600);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(-2000, 0, 4000, 600);
  
  // 让相机跟随方块
  this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  
  // 添加提示文本（固定在相机上）
  const text = this.add.text(10, 10, '相机跟随红色方块\n方块向左移动', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机视图上
}

function update(time, delta) {
  // 可选：如果方块移动到世界边界，可以反向移动
  if (this.player.x <= -1950) {
    this.player.setVelocityX(150); // 向右移动
  } else if (this.player.x >= 1950) {
    this.player.setVelocityX(-150); // 向左移动
  }
}

// 创建网格背景以便观察相机移动
function createGrid() {
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x00ff00, 0.3);
  
  // 绘制垂直线
  for (let x = -2000; x <= 2000; x += 100) {
    gridGraphics.lineBetween(x, 0, x, 600);
  }
  
  // 绘制水平线
  for (let y = 0; y <= 600; y += 100) {
    gridGraphics.lineBetween(-2000, y, 2000, y);
  }
  
  // 添加位置标记
  for (let x = -2000; x <= 2000; x += 200) {
    const marker = this.add.text(x, 300, x.toString(), {
      fontSize: '14px',
      fill: '#00ff00'
    });
    marker.setOrigin(0.5);
  }
}

new Phaser.Game(config);