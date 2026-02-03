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
  // 不需要预加载外部资源
}

function create() {
  // 扩大世界边界，让三角形有足够的移动空间
  this.physics.world.setBounds(0, 0, 3200, 2400);
  
  // 使用 Graphics 绘制三角形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制一个指向右上的三角形
  graphics.fillTriangle(
    25, 0,   // 顶点（上）
    0, 50,   // 左下
    50, 50   // 右下
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', 50, 50);
  graphics.destroy();
  
  // 创建物理精灵，放置在世界中心
  this.player = this.physics.add.sprite(1600, 1200, 'triangle');
  
  // 设置向左下移动的速度
  // 负 x 表示向左，正 y 表示向下
  this.player.setVelocity(-150, 150);
  
  // 设置精灵的碰撞边界
  this.player.setCollideWorldBounds(false);
  
  // 设置相机跟随三角形
  this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, 0, 3200, 2400);
  
  // 添加背景网格以便观察移动效果
  this.createGrid();
  
  // 添加提示文本（固定在相机上）
  const text = this.add.text(10, 10, '三角形自动向左下移动\n相机跟随中...', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上不随场景滚动
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
  // 当前示例中三角形通过物理速度自动移动，不需要手动更新
}

// 辅助函数：创建网格背景以便观察相机移动
function createGrid() {
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制垂直线
  for (let x = 0; x <= 3200; x += 100) {
    graphics.lineBetween(x, 0, x, 2400);
  }
  
  // 绘制水平线
  for (let y = 0; y <= 2400; y += 100) {
    graphics.lineBetween(0, y, 3200, y);
  }
  
  // 添加坐标标记
  for (let x = 0; x <= 3200; x += 400) {
    for (let y = 0; y <= 2400; y += 400) {
      const label = this.add.text(x + 5, y + 5, `(${x},${y})`, {
        fontSize: '12px',
        color: '#666666'
      });
    }
  }
}

// 创建游戏实例
new Phaser.Game(config);