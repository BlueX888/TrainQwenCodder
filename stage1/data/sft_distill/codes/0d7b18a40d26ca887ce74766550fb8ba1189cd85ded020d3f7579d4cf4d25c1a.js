// Phaser3 相机跟随示例
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

let player;
let infoText;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 设置世界边界为更大的区域，以便观察相机跟随效果
  this.physics.world.setBounds(0, 0, 1600, 1200);
  
  // 使用 Graphics 绘制圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('playerCircle', 50, 50);
  graphics.destroy();
  
  // 创建物理精灵对象，初始位置在世界中心
  player = this.physics.add.sprite(400, 300, 'playerCircle');
  player.setCollideWorldBounds(true);
  player.setBounce(1, 1); // 碰到边界后反弹
  
  // 设置速度：向右上方移动
  player.setVelocity(100, -100);
  
  // 设置相机跟随玩家对象
  this.cameras.main.startFollow(player, true, 0.1, 0.1);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, 0, 1600, 1200);
  
  // 添加背景网格以便观察相机移动
  this.createBackgroundGrid();
  
  // 添加信息文本（固定在相机视图）
  infoText = this.add.text(10, 10, '', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  infoText.setScrollFactor(0); // 固定在相机上，不随场景滚动
  
  // 添加说明文本
  const instructionText = this.add.text(10, 550, '相机跟随绿色圆形移动\n圆形碰到边界会反弹', {
    fontSize: '14px',
    color: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 8, y: 5 }
  });
  instructionText.setScrollFactor(0);
}

function update(time, delta) {
  // 更新信息显示
  if (infoText && player) {
    infoText.setText([
      `圆形位置: (${Math.round(player.x)}, ${Math.round(player.y)})`,
      `相机位置: (${Math.round(this.cameras.main.scrollX)}, ${Math.round(this.cameras.main.scrollY)})`,
      `速度: (${Math.round(player.body.velocity.x)}, ${Math.round(player.body.velocity.y)})`
    ]);
  }
}

// 创建背景网格辅助函数
Phaser.Scene.prototype.createBackgroundGrid = function() {
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制垂直线
  for (let x = 0; x <= 1600; x += 100) {
    gridGraphics.lineBetween(x, 0, x, 1200);
  }
  
  // 绘制水平线
  for (let y = 0; y <= 1200; y += 100) {
    gridGraphics.lineBetween(0, y, 1600, y);
  }
  
  // 添加坐标标记
  for (let x = 0; x <= 1600; x += 200) {
    for (let y = 0; y <= 1200; y += 200) {
      const marker = this.add.text(x + 5, y + 5, `${x},${y}`, {
        fontSize: '12px',
        color: '#666666'
      });
    }
  }
};

// 启动游戏
new Phaser.Game(config);